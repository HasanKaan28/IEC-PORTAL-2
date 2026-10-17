"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { requirePageAccess, guardedAction, requirePermission, userCan, type ActionResult } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { tasksProjectsText, type TasksProjectsText } from "@/lib/i18n/portal/tasks-projects";
import { recordAudit } from "@/lib/tasks/audit";
import { getProjectJoinRequests, isProjectLead } from "./project-queries";
import {
  PROJECT_CATEGORY_KEYS,
  PROJECT_LEAD_ROLE,
  PROJECT_MEMBER_ROLE,
  type ProjectCategoryKey,
  type ProjectJoinRequestItem,
} from "./project-types";

/**
 * Project mutations. Each action authenticates the caller first, validates input with zod and
 * derives identity from the session only. The service-role client is used only after the
 * permission and ownership checks have passed.
 */

type ErrorText = TasksProjectsText["errors"];

async function errorText(): Promise<ErrorText> {
  return tasksProjectsText[await getServerLocale()].errors;
}

function firstError(error: z.ZodError, fallback: string): string {
  return error.errors[0]?.message || fallback;
}

function revalidateProjectViews() {
  revalidatePath("/portal/projeler");
  revalidatePath("/portal/gorevler");
  revalidatePath("/portal");
}

/* ------------------------------------------------------------------------------------------ */
/* Join requests                                                                              */
/* ------------------------------------------------------------------------------------------ */

/** The caller asks to join a project. The request is always created for the caller. */
export async function requestJoinProjectAction(projectId: string, message: string): Promise<ActionResult> {
  return guardedAction(async () => {
    const user = await requirePageAccess("projects");
    const t = await errorText();

    const parsed = z
      .object({
        projectId: z.string().uuid(t.invalidInput),
        message: z
          .string({ errorMap: () => ({ message: t.invalidInput }) })
          .trim()
          .min(10, t.joinMessageMin)
          .max(1000, t.joinMessageMax),
      })
      .safeParse({ projectId, message });
    if (!parsed.success) return { success: false, error: firstError(parsed.error, t.invalidInput) };

    // Everything here is allowed by RLS for the caller, so the user-scoped client is enough.
    const supabase = await createClient();

    const { data: project } = await (supabase.from("projects") as any)
      .select("id, status")
      .eq("id", parsed.data.projectId)
      .maybeSingle();
    if (!project) return { success: false, error: t.projectNotFound };
    if ((project as { status: string }).status === "completed") return { success: false, error: t.projectClosed };

    const { data: membership } = await (supabase.from("project_members") as any)
      .select("id")
      .eq("project_id", parsed.data.projectId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (membership) return { success: false, error: t.alreadyMember };

    const { data: pending } = await (supabase.from("project_join_requests") as any)
      .select("id")
      .eq("project_id", parsed.data.projectId)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .limit(1);
    if (pending && (pending as unknown[]).length > 0) return { success: false, error: t.alreadyRequested };

    const { error } = await (supabase.from("project_join_requests") as any).insert({
      project_id: parsed.data.projectId,
      user_id: user.id,
      message: parsed.data.message,
      status: "pending",
    });
    if (error) {
      console.error("[projects] join request insert failed", error);
      return { success: false, error: t.saveFailed };
    }

    revalidatePath("/portal/projeler");
    return { success: true };
  });
}

/** Approve or decline a join request. Only that project's lead or a projects.review_requests holder. */
export async function reviewProjectJoinRequestAction(
  requestId: string,
  status: "approved" | "rejected",
  reviewerNote?: string
): Promise<ActionResult> {
  return guardedAction(async () => {
    const user = await requirePageAccess("projects");
    const t = await errorText();

    const parsed = z
      .object({
        requestId: z.string().uuid(t.invalidInput),
        status: z.enum(["approved", "rejected"], { errorMap: () => ({ message: t.invalidInput }) }),
        reviewerNote: z
          .string({ errorMap: () => ({ message: t.invalidInput }) })
          .trim()
          .max(500, t.reviewerNoteMax)
          .optional(),
      })
      .safeParse({ requestId, status, reviewerNote });
    if (!parsed.success) return { success: false, error: firstError(parsed.error, t.invalidInput) };

    if (!isSupabaseAdminConfigured()) return { success: false, error: t.serverNotConfigured };
    // Project leads who are not club leaders cannot read requests through RLS, so the request is
    // loaded with the service role and the ownership check below decides whether to continue.
    const admin = createAdminClient();

    const { data: requestRow } = await (admin.from("project_join_requests") as any)
      .select("id, project_id, user_id, status")
      .eq("id", parsed.data.requestId)
      .maybeSingle();
    if (!requestRow) return { success: false, error: t.requestNotFound };
    const request = requestRow as { id: string; project_id: string; user_id: string; status: string };

    if (request.user_id === user.id) return { success: false, error: t.selfReview };
    const allowed =
      userCan(user, "projects.review_requests") || (await isProjectLead(user.id, request.project_id));
    if (!allowed) return { success: false, error: t.reviewForbidden };
    if (request.status !== "pending") return { success: false, error: t.requestAlreadyReviewed };

    const { data: updated, error: updateError } = await (admin.from("project_join_requests") as any)
      .update({
        status: parsed.data.status,
        reviewer_id: user.id,
        reviewer_note: parsed.data.reviewerNote ? parsed.data.reviewerNote : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.id)
      .eq("status", "pending")
      .select("id");
    if (updateError) {
      console.error("[projects] join request review failed", updateError);
      return { success: false, error: t.saveFailed };
    }
    if (!updated || (updated as unknown[]).length === 0) {
      return { success: false, error: t.requestAlreadyReviewed };
    }

    if (parsed.data.status === "approved") {
      const { error: memberError } = await (admin.from("project_members") as any).upsert(
        { project_id: request.project_id, user_id: request.user_id, role: PROJECT_MEMBER_ROLE },
        { onConflict: "project_id,user_id", ignoreDuplicates: true }
      );
      if (memberError) {
        console.error("[projects] adding approved member failed", memberError);
        // Put the request back so it can be reviewed again instead of showing a false approval.
        await (admin.from("project_join_requests") as any)
          .update({ status: "pending", reviewer_id: null, reviewer_note: null, updated_at: new Date().toISOString() })
          .eq("id", request.id);
        return { success: false, error: t.saveFailed };
      }
    }

    await recordAudit({
      actorId: user.id,
      action: parsed.data.status === "approved" ? "project_join_request.approve" : "project_join_request.reject",
      targetType: "project_join_request",
      targetId: request.id,
      details: { project_id: request.project_id, applicant_id: request.user_id },
    });

    revalidateProjectViews();
    return { success: true };
  });
}

/** Requests the caller may review (see getProjectJoinRequests for the scope rules). */
export async function getProjectJoinRequestsAction(): Promise<ActionResult<ProjectJoinRequestItem[]>> {
  return guardedAction(async () => {
    const user = await requirePageAccess("projects");
    return { success: true, data: await getProjectJoinRequests(user) };
  });
}

/* ------------------------------------------------------------------------------------------ */
/* Create project                                                                             */
/* ------------------------------------------------------------------------------------------ */

const TURKISH_ASCII: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

function slugify(text: string): string {
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşüâîû]/g, (char) => TURKISH_ASCII[char] ?? char)
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/g, "");
}

function createProjectSchema(t: ErrorText) {
  const invalid = { errorMap: () => ({ message: t.invalidInput }) };
  const text = (max: number, maxMessage: string) => z.string(invalid).trim().max(max, maxMessage).default("");
  const optionalHttpsUrl = z
    .string(invalid)
    .trim()
    .max(300, t.urlInvalid)
    .default("")
    .refine((value) => {
      if (value === "") return true;
      try {
        const url = new URL(value);
        return url.protocol === "https:" && Boolean(url.hostname);
      } catch {
        return false;
      }
    }, t.urlInvalid);

  return z
    .object({
      titleTr: text(120, t.projectTitleMax),
      titleEn: text(120, t.projectTitleMax),
      summaryTr: text(300, t.projectSummaryMax),
      summaryEn: text(300, t.projectSummaryMax),
      category: z.enum(PROJECT_CATEGORY_KEYS, { errorMap: () => ({ message: t.categoryInvalid }) }),
      githubUrl: optionalHttpsUrl,
      demoUrl: optionalHttpsUrl,
    })
    .superRefine((value, ctx) => {
      const titles = [value.titleTr, value.titleEn].filter(Boolean);
      if (titles.length === 0 || titles.some((title) => title.length < 3)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t.projectTitleRequired, path: ["titleTr"] });
      }
      const summaries = [value.summaryTr, value.summaryEn].filter(Boolean);
      if (summaries.length === 0 || summaries.some((summary) => summary.length < 10)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: t.projectSummaryRequired, path: ["summaryTr"] });
      }
    });
}

/** Creates a project (concept stage, not featured publicly) with the caller as its lead. */
export async function createProjectAction(input: {
  titleTr?: string;
  titleEn?: string;
  summaryTr?: string;
  summaryEn?: string;
  category: ProjectCategoryKey;
  githubUrl?: string;
  demoUrl?: string;
}): Promise<ActionResult<{ id: string }>> {
  return guardedAction(async () => {
    const user = await requirePermission("projects.create");
    const t = await errorText();

    const parsed = createProjectSchema(t).safeParse(input ?? {});
    if (!parsed.success) return { success: false, error: firstError(parsed.error, t.invalidInput) };
    const value = parsed.data;

    if (!isSupabaseAdminConfigured()) return { success: false, error: t.serverNotConfigured };
    // RLS only lets the "leader" role write projects; the app permission (checked above) is the
    // source of truth, so the insert runs with the service role.
    const admin = createAdminClient();

    const titleTr = value.titleTr || value.titleEn;
    const titleEn = value.titleEn || value.titleTr;
    const summaryTr = value.summaryTr || value.summaryEn;
    const summaryEn = value.summaryEn || value.summaryTr;
    const slug = `${slugify(titleEn || titleTr) || "project"}-${randomUUID().slice(0, 6)}`;

    const { data: inserted, error } = await (admin.from("projects") as any)
      .insert({
        slug,
        title_tr: titleTr,
        title_en: titleEn,
        tagline_tr: summaryTr,
        tagline_en: summaryEn,
        category_tr: tasksProjectsText.tr.projectCategories[value.category],
        category_en: tasksProjectsText.en.projectCategories[value.category],
        status: "concept",
        is_flagship: false,
        is_featured: false,
        github_url: value.githubUrl || null,
        demo_url: value.demoUrl || null,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("[projects] create failed", error);
      return { success: false, error: t.saveFailed };
    }
    const projectId = (inserted as { id: string }).id;

    const { error: leadError } = await (admin.from("project_members") as any).insert({
      project_id: projectId,
      user_id: user.id,
      role: PROJECT_LEAD_ROLE,
    });
    if (leadError) {
      console.error("[projects] adding project lead failed", leadError);
      await (admin.from("projects") as any).delete().eq("id", projectId);
      return { success: false, error: t.saveFailed };
    }

    await recordAudit({
      actorId: user.id,
      action: "project.create",
      targetType: "project",
      targetId: projectId,
      details: { slug },
    });

    revalidateProjectViews();
    return { success: true, data: { id: projectId } };
  });
}

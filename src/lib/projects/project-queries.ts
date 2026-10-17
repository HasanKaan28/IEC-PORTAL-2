import { createAdminClient, createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser, userCan, type SessionUser } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import type { SupportedLocale } from "@/lib/i18n/translations";
import {
  PROJECT_STATUSES,
  isProjectLeadRole,
  type JoinRequestStatus,
  type PortalProjectItem,
  type PortalProjectStatus,
  type ProjectJoinRequestItem,
  type ProjectViewerStatus,
} from "./project-types";

/**
 * Read-only project queries for the portal. They return empty lists (never sample data) when
 * Supabase is not configured or a query fails.
 */

function localized(tr: string | null | undefined, en: string | null | undefined, locale: SupportedLocale): string {
  // Titles exist in Turkish and English only; Bosnian readers get English.
  return (locale === "tr" ? tr || en : en || tr) || "";
}

interface ProjectRow {
  id: string;
  slug: string;
  title_tr: string;
  title_en: string;
  tagline_tr: string;
  tagline_en: string;
  category_tr: string;
  category_en: string;
  status: string;
  accent_color: string | null;
  github_url: string | null;
  demo_url: string | null;
}

interface MemberRow {
  project_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile: { full_name: string | null; avatar_url: string | null } | null;
}

function toStatus(value: string): PortalProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(value) ? (value as PortalProjectStatus) : "concept";
}

/** All portal projects with lead, member count and the viewer's relation to each. */
export async function getPortalProjects(
  viewerId?: string | null,
  localeOverride?: SupportedLocale
): Promise<PortalProjectItem[]> {
  if (!isSupabaseConfigured()) return [];
  const locale = localeOverride ?? (await getServerLocale());
  const currentUserId = viewerId === undefined ? (await getSessionUser())?.id ?? null : viewerId;

  try {
    const supabase = await createClient();
    const [projectsResult, membersResult, requestsResult] = await Promise.all([
      (supabase.from("projects") as any)
        .select(
          "id, slug, title_tr, title_en, tagline_tr, tagline_en, category_tr, category_en, status, accent_color, github_url, demo_url"
        )
        .order("is_flagship", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(300),
      (supabase.from("project_members") as any)
        .select("project_id, user_id, role, joined_at, profile:user_id (full_name, avatar_url)")
        .order("joined_at", { ascending: true })
        .limit(5000),
      currentUserId
        ? (supabase.from("project_join_requests") as any)
            .select("project_id")
            .eq("user_id", currentUserId)
            .eq("status", "pending")
        : Promise.resolve({ data: [] }),
    ]);

    if (projectsResult.error) {
      console.error("[projects] list query failed", projectsResult.error);
      return [];
    }

    const members = (membersResult.data as MemberRow[] | null) ?? [];
    const pendingProjectIds = new Set(
      ((requestsResult.data as Array<{ project_id: string }> | null) ?? []).map((row) => row.project_id)
    );

    return ((projectsResult.data as ProjectRow[] | null) ?? []).map((project) => {
      const projectMembers = members.filter((member) => member.project_id === project.id);
      const lead = projectMembers.find((member) => isProjectLeadRole(member.role)) ?? null;
      const viewerMembership = currentUserId
        ? projectMembers.find((member) => member.user_id === currentUserId) ?? null
        : null;

      let userStatus: ProjectViewerStatus = "none";
      if (viewerMembership) userStatus = isProjectLeadRole(viewerMembership.role) ? "lead" : "member";
      else if (pendingProjectIds.has(project.id)) userStatus = "pending";

      return {
        id: project.id,
        slug: project.slug,
        title: localized(project.title_tr, project.title_en, locale),
        description: localized(project.tagline_tr, project.tagline_en, locale),
        category: localized(project.category_tr, project.category_en, locale),
        status: toStatus(project.status),
        accentColor: project.accent_color,
        leadId: lead?.user_id ?? null,
        leadName: lead?.profile?.full_name ?? null,
        leadAvatar: lead?.profile?.avatar_url ?? null,
        membersCount: projectMembers.length,
        githubUrl: project.github_url,
        demoUrl: project.demo_url,
        userStatus,
      };
    });
  } catch (error) {
    console.error("[projects] list query failed", error);
    return [];
  }
}

/** Ids of the projects the user leads (project_members.role = lead). */
export async function getLedProjectIds(userId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("project_members") as any)
      .select("project_id, role")
      .eq("user_id", userId);
    if (error) return [];
    return ((data as Array<{ project_id: string; role: string }> | null) ?? [])
      .filter((row) => isProjectLeadRole(row.role))
      .map((row) => row.project_id);
  } catch {
    return [];
  }
}

/** True when the user is a lead of that project. */
export async function isProjectLead(userId: string, projectId: string): Promise<boolean> {
  return (await getLedProjectIds(userId)).includes(projectId);
}

interface RequestRow {
  id: string;
  project_id: string;
  user_id: string;
  message: string | null;
  status: string;
  reviewer_note: string | null;
  created_at: string;
  project: { title_tr: string; title_en: string } | null;
  applicant: {
    full_name: string | null;
    avatar_url: string | null;
    department: string | null;
    class_year: string | null;
  } | null;
}

/**
 * Join requests the user may review: every request for holders of projects.review_requests,
 * otherwise only requests for projects the user leads. Anyone else gets an empty list.
 * The scope is decided before the service-role client is used (RLS would hide requests from
 * project leads who are not club leaders).
 */
export async function getProjectJoinRequests(
  reviewer?: SessionUser | null,
  localeOverride?: SupportedLocale
): Promise<ProjectJoinRequestItem[]> {
  if (!isSupabaseConfigured()) return [];
  const user = reviewer === undefined ? await getSessionUser() : reviewer;
  if (!user) return [];
  const locale = localeOverride ?? (await getServerLocale());

  const canReviewAll = userCan(user, "projects.review_requests");
  const ledProjectIds = canReviewAll ? [] : await getLedProjectIds(user.id);
  if (!canReviewAll && ledProjectIds.length === 0) return [];

  try {
    const client = isSupabaseAdminConfigured() ? createAdminClient() : await createClient();
    let query = (client.from("project_join_requests") as any)
      .select(
        "id, project_id, user_id, message, status, reviewer_note, created_at, project:project_id (title_tr, title_en), applicant:user_id (full_name, avatar_url, department, class_year)"
      )
      .order("created_at", { ascending: false })
      .limit(300);
    if (!canReviewAll) query = query.in("project_id", ledProjectIds);

    const { data, error } = await query;
    if (error) {
      console.error("[projects] join request query failed", error);
      return [];
    }

    return ((data as RequestRow[] | null) ?? []).map((row) => ({
      id: row.id,
      projectId: row.project_id,
      projectTitle: localized(row.project?.title_tr, row.project?.title_en, locale),
      userId: row.user_id,
      userName: row.applicant?.full_name || "",
      userAvatar: row.applicant?.avatar_url ?? null,
      userDepartment: row.applicant?.department ?? null,
      classYear: row.applicant?.class_year ?? null,
      message: row.message ?? "",
      status: (["pending", "approved", "rejected"].includes(row.status) ? row.status : "pending") as JoinRequestStatus,
      reviewerNote: row.reviewer_note,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error("[projects] join request query failed", error);
    return [];
  }
}

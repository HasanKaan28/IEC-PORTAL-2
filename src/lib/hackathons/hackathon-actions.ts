"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { requirePageAccess, guardedAction, requirePermission, type ActionResult } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { eventsHackathonsText, type EventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";
import { MAX_TEAM_MEMBERS } from "./hackathon-types";

/**
 * Hackathon server actions. Every body authenticates first; identity always comes from the session.
 * Team and request writes use the user-scoped client so RLS applies on top of the checks below.
 */

type UserClient = Awaited<ReturnType<typeof createClient>>;

const HACKATHON_PATH = "/portal/hackathon";

async function text(): Promise<EventsHackathonsText> {
  return eventsHackathonsText[await getServerLocale()];
}

function firstError(error: z.ZodError, fallback: string): string {
  return error.errors[0]?.message ?? fallback;
}

function listSchema(t: EventsHackathonsText) {
  return z
    .array(z.string().max(40, t.validation.tooManyItems))
    .max(8, t.validation.tooManyItems)
    .transform((items) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean))));
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

/** True when the user leads or belongs to any team of the hackathon. */
async function isInTeamForHackathon(supabase: UserClient, hackathonId: string, userId: string): Promise<boolean> {
  const { data: teams } = await (supabase.from("hackathon_teams") as any)
    .select("id, leader_id")
    .eq("hackathon_id", hackathonId);
  const rows = (teams ?? []) as Array<{ id: string; leader_id: string }>;
  if (rows.some((row) => row.leader_id === userId)) return true;
  if (rows.length === 0) return false;
  const { data: memberships } = await (supabase.from("hackathon_team_members") as any)
    .select("id")
    .eq("user_id", userId)
    .in("team_id", rows.map((row) => row.id))
    .limit(1);
  return ((memberships ?? []) as unknown[]).length > 0;
}

async function countTeamMembers(supabase: UserClient, teamId: string): Promise<number> {
  const { count } = await (supabase.from("hackathon_team_members") as any)
    .select("id", { count: "exact", head: true })
    .eq("team_id", teamId);
  return typeof count === "number" ? count : 0;
}

/** Adds a hackathon to the list. Requires hackathons.create. */
export async function createHackathonAction(input: {
  title: string;
  description: string;
  locationCountry: string;
  startDate: string;
  endDate: string;
  applicationUrl: string;
  tags: string[];
}): Promise<ActionResult<{ id: string }>> {
  return guardedAction(async () => {
    const user = await requirePermission("hackathons.create");
    const t = await text();

    const schema = z
      .object({
        title: z.string().trim().min(3, t.validation.titleLength).max(150, t.validation.titleLength),
        description: z.string().trim().min(10, t.validation.descriptionLength).max(2000, t.validation.descriptionLength),
        locationCountry: z.string().trim().min(2, t.validation.locationLength).max(120, t.validation.locationLength),
        startDate: z.string().refine(isIsoDate, t.validation.dateInvalid),
        endDate: z.string().refine(isIsoDate, t.validation.dateInvalid),
        applicationUrl: z
          .string()
          .trim()
          .max(500, t.validation.urlInvalid)
          .url(t.validation.urlInvalid)
          .refine((value) => value.startsWith("https://"), t.validation.urlInvalid),
        tags: listSchema(t),
      })
      .refine((value) => value.endDate >= value.startDate, { message: t.validation.dateOrder, path: ["endDate"] });
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { success: false, error: firstError(parsed.error, t.errors.invalidInput) };
    if (!isSupabaseAdminConfigured()) return { success: false, error: t.errors.notConfigured };

    // Service role after the permission check: RLS on hackathons only knows the "leader" role, while
    // hackathons.create is also held by admins.
    const { data, error } = await (createAdminClient().from("hackathons") as any)
      .insert({
        title: parsed.data.title,
        description: parsed.data.description,
        location_country: parsed.data.locationCountry,
        start_date: parsed.data.startDate,
        end_date: parsed.data.endDate,
        application_url: parsed.data.applicationUrl,
        tags: parsed.data.tags,
        created_by: user.id,
      })
      .select("id")
      .single();
    if (error || !data) {
      console.error("[hackathons] create failed", error);
      return { success: false, error: t.errors.generic };
    }

    revalidatePath(HACKATHON_PATH);
    return { success: true, data: { id: (data as { id: string }).id }, message: t.hackathons.hackathonCreated };
  });
}

/** Creates a team led by the signed-in user. */
export async function createHackathonTeamAction(input: {
  hackathonId: string;
  name: string;
  description: string;
  lookingFor: string[];
}): Promise<ActionResult<{ id: string }>> {
  return guardedAction(async () => {
    const user = await requirePageAccess("hackathons");
    const t = await text();

    const schema = z.object({
      hackathonId: z.string().uuid(t.errors.invalidInput),
      name: z.string().trim().min(3, t.validation.teamNameLength).max(60, t.validation.teamNameLength),
      description: z
        .string()
        .trim()
        .min(10, t.validation.teamDescriptionLength)
        .max(600, t.validation.teamDescriptionLength),
      lookingFor: listSchema(t),
    });
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { success: false, error: firstError(parsed.error, t.errors.invalidInput) };

    const supabase = await createClient();
    const { data: hackathon } = await (supabase.from("hackathons") as any)
      .select("id, end_date")
      .eq("id", parsed.data.hackathonId)
      .maybeSingle();
    if (!hackathon) return { success: false, error: t.errors.hackathonNotFound };
    if ((hackathon as { end_date: string }).end_date < todayIsoDate()) {
      return { success: false, error: t.errors.hackathonEnded };
    }
    if (await isInTeamForHackathon(supabase, parsed.data.hackathonId, user.id)) {
      return { success: false, error: t.errors.alreadyInTeam };
    }

    const { data: team, error } = await (supabase.from("hackathon_teams") as any)
      .insert({
        hackathon_id: parsed.data.hackathonId,
        name: parsed.data.name,
        description: parsed.data.description,
        is_open: true,
        looking_for: parsed.data.lookingFor,
        leader_id: user.id,
      })
      .select("id")
      .single();
    if (error || !team) {
      console.error("[hackathons] team create failed", error);
      return { success: false, error: t.errors.generic };
    }
    const teamId = (team as { id: string }).id;

    const { error: memberError } = await (supabase.from("hackathon_team_members") as any).insert({
      team_id: teamId,
      user_id: user.id,
    });
    if (memberError && memberError.code !== "23505") {
      // The captain is still recognised through leader_id; log so the membership row can be fixed.
      console.error("[hackathons] captain membership insert failed", memberError);
    }

    revalidatePath(HACKATHON_PATH);
    return { success: true, data: { id: teamId }, message: t.hackathons.teamCreated };
  });
}

/** Sends a join request from the signed-in user to a team. */
export async function requestJoinHackathonTeamAction(teamId: string, message: string): Promise<ActionResult> {
  return guardedAction(async () => {
    const user = await requirePageAccess("hackathons");
    const t = await text();

    const parsed = z
      .object({
        teamId: z.string().uuid(t.errors.invalidInput),
        message: z.string().trim().min(10, t.validation.messageLength).max(500, t.validation.messageLength),
      })
      .safeParse({ teamId, message });
    if (!parsed.success) return { success: false, error: firstError(parsed.error, t.errors.invalidInput) };

    const supabase = await createClient();
    const { data: teamData } = await (supabase.from("hackathon_teams") as any)
      .select("id, hackathon_id, leader_id, is_open, hackathons:hackathon_id(end_date)")
      .eq("id", parsed.data.teamId)
      .maybeSingle();
    const team = teamData as {
      id: string;
      hackathon_id: string;
      leader_id: string;
      is_open: boolean;
      hackathons: { end_date: string } | null;
    } | null;
    if (!team) return { success: false, error: t.errors.teamNotFound };
    if (team.leader_id === user.id) return { success: false, error: t.errors.ownTeam };
    if (team.hackathons && team.hackathons.end_date < todayIsoDate()) {
      return { success: false, error: t.errors.hackathonEnded };
    }
    if (!team.is_open) return { success: false, error: t.errors.teamClosed };
    if (await isInTeamForHackathon(supabase, team.hackathon_id, user.id)) {
      return { success: false, error: t.errors.alreadyInTeam };
    }

    const { data: pending } = await (supabase.from("hackathon_join_requests") as any)
      .select("id")
      .eq("team_id", team.id)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .limit(1);
    if (((pending ?? []) as unknown[]).length > 0) return { success: false, error: t.errors.alreadyRequested };
    if ((await countTeamMembers(supabase, team.id)) >= MAX_TEAM_MEMBERS) {
      return { success: false, error: t.errors.teamFull };
    }

    const { error } = await (supabase.from("hackathon_join_requests") as any).insert({
      team_id: team.id,
      user_id: user.id,
      message: parsed.data.message,
      status: "pending",
    });
    if (error) {
      console.error("[hackathons] join request failed", error);
      return { success: false, error: t.errors.generic };
    }

    revalidatePath(HACKATHON_PATH);
    return { success: true, message: t.hackathons.requestSent };
  });
}

/** Accepts or declines a join request. Only the captain of the request's team may do this. */
export async function reviewHackathonJoinRequestAction(
  requestId: string,
  status: "approved" | "rejected"
): Promise<ActionResult> {
  return guardedAction(async () => {
    const user = await requirePageAccess("hackathons");
    const t = await text();

    const parsed = z
      .object({ requestId: z.string().uuid(), status: z.enum(["approved", "rejected"]) })
      .safeParse({ requestId, status });
    if (!parsed.success) return { success: false, error: t.errors.invalidInput };

    const supabase = await createClient();
    const { data: requestData } = await (supabase.from("hackathon_join_requests") as any)
      .select("id, team_id, user_id, status")
      .eq("id", parsed.data.requestId)
      .maybeSingle();
    const request = requestData as { id: string; team_id: string; user_id: string; status: string } | null;
    if (!request) return { success: false, error: t.errors.requestNotFound };

    const { data: teamData } = await (supabase.from("hackathon_teams") as any)
      .select("id, hackathon_id, leader_id")
      .eq("id", request.team_id)
      .maybeSingle();
    const team = teamData as { id: string; hackathon_id: string; leader_id: string } | null;
    if (!team) return { success: false, error: t.errors.teamNotFound };
    if (team.leader_id !== user.id) return { success: false, error: t.errors.notTeamLeader };
    if (request.status !== "pending") return { success: false, error: t.errors.requestAlreadyReviewed };

    let memberCount = 0;
    if (parsed.data.status === "approved") {
      memberCount = await countTeamMembers(supabase, team.id);
      if (memberCount >= MAX_TEAM_MEMBERS) return { success: false, error: t.errors.teamFull };
      if (await isInTeamForHackathon(supabase, team.hackathon_id, request.user_id)) {
        return { success: false, error: t.errors.applicantInOtherTeam };
      }
      const { error: memberError } = await (supabase.from("hackathon_team_members") as any).insert({
        team_id: team.id,
        user_id: request.user_id,
      });
      if (memberError && memberError.code !== "23505") {
        console.error("[hackathons] member insert failed", memberError);
        return { success: false, error: t.errors.generic };
      }
    }

    const { error: updateError } = await (supabase.from("hackathon_join_requests") as any)
      .update({ status: parsed.data.status })
      .eq("id", request.id)
      .eq("status", "pending");
    if (updateError) {
      console.error("[hackathons] request review failed", updateError);
      return { success: false, error: t.errors.generic };
    }

    // A full team stops recruiting automatically.
    if (parsed.data.status === "approved" && memberCount + 1 >= MAX_TEAM_MEMBERS) {
      await (supabase.from("hackathon_teams") as any).update({ is_open: false }).eq("id", team.id);
    }

    revalidatePath(HACKATHON_PATH);
    return {
      success: true,
      message: parsed.data.status === "approved" ? t.hackathons.approved : t.hackathons.rejected,
    };
  });
}

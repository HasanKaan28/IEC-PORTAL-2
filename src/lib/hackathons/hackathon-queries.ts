import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";
import type { HackathonItem, HackathonJoinRequestItem, HackathonTeamItem } from "./hackathon-types";

/**
 * Server-side hackathon reads (user-scoped client, RLS applies). Empty results when Supabase is not
 * configured; there is no demo data.
 */

interface HackathonRow {
  id: string;
  title: string;
  description: string;
  location_country: string;
  start_date: string;
  end_date: string;
  application_url: string;
  tags: string[] | null;
}

interface TeamRow {
  id: string;
  hackathon_id: string;
  name: string;
  description: string | null;
  is_open: boolean;
  looking_for: string[] | null;
  leader_id: string;
  created_at: string;
  hackathons: { title: string } | null;
  leader: { full_name: string | null; avatar_url: string | null } | null;
}

interface MemberRow {
  team_id: string;
  user_id: string;
  joined_at: string;
  profile: { full_name: string | null; department: string | null; avatar_url: string | null } | null;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getHackathons(): Promise<HackathonItem[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const [hackathonResult, teamResult] = await Promise.all([
      (supabase.from("hackathons") as any)
        .select("id, title, description, location_country, start_date, end_date, application_url, tags")
        .order("start_date", { ascending: true }),
      (supabase.from("hackathon_teams") as any).select("hackathon_id"),
    ]);
    if (hackathonResult.error) {
      console.error("[hackathons] list failed", hackathonResult.error);
      return [];
    }
    const teamCounts = new Map<string, number>();
    for (const row of (teamResult.data ?? []) as Array<{ hackathon_id: string }>) {
      teamCounts.set(row.hackathon_id, (teamCounts.get(row.hackathon_id) ?? 0) + 1);
    }
    const today = todayIsoDate();
    return ((hackathonResult.data ?? []) as HackathonRow[]).map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      locationCountry: row.location_country,
      startDate: row.start_date,
      endDate: row.end_date,
      applicationUrl: row.application_url,
      tags: row.tags ?? [],
      teamsCount: teamCounts.get(row.id) ?? 0,
      isOpen: row.end_date >= today,
    }));
  } catch (error) {
    console.error("[hackathons] list failed", error);
    return [];
  }
}

/** All teams with members and the signed-in user's relation to each one. */
export async function getHackathonTeams(): Promise<HackathonTeamItem[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const [supabase, user] = await Promise.all([createClient(), getSessionUser()]);
    const { data, error } = await (supabase.from("hackathon_teams") as any)
      .select(
        "id, hackathon_id, name, description, is_open, looking_for, leader_id, created_at, hackathons:hackathon_id(title), leader:leader_id(full_name, avatar_url)"
      )
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[hackathons] team list failed", error);
      return [];
    }
    const teams = (data ?? []) as TeamRow[];
    if (teams.length === 0) return [];

    const teamIds = teams.map((team) => team.id);
    const [memberResult, pendingResult] = await Promise.all([
      (supabase.from("hackathon_team_members") as any)
        .select("team_id, user_id, joined_at, profile:user_id(full_name, department, avatar_url)")
        .in("team_id", teamIds)
        .order("joined_at", { ascending: true }),
      user
        ? (supabase.from("hackathon_join_requests") as any)
            .select("team_id")
            .eq("user_id", user.id)
            .eq("status", "pending")
        : Promise.resolve({ data: [] }),
    ]);

    const membersByTeam = new Map<string, MemberRow[]>();
    for (const row of (memberResult.data ?? []) as MemberRow[]) {
      const list = membersByTeam.get(row.team_id) ?? [];
      list.push(row);
      membersByTeam.set(row.team_id, list);
    }
    const pendingTeamIds = new Set(((pendingResult.data ?? []) as Array<{ team_id: string }>).map((row) => row.team_id));

    return teams.map((team) => {
      const memberRows = membersByTeam.get(team.id) ?? [];
      const isLeader = user?.id === team.leader_id;
      const isMember = Boolean(user && memberRows.some((member) => member.user_id === user.id));
      return {
        id: team.id,
        hackathonId: team.hackathon_id,
        hackathonTitle: team.hackathons?.title ?? "",
        name: team.name,
        description: team.description ?? "",
        isOpen: team.is_open,
        lookingFor: team.looking_for ?? [],
        leaderName: team.leader?.full_name ?? "",
        leaderAvatar: team.leader?.avatar_url ?? null,
        members: memberRows.map((member) => ({
          id: member.user_id,
          name: member.profile?.full_name ?? "",
          department: member.profile?.department ?? null,
          avatar: member.profile?.avatar_url ?? null,
          isLeader: member.user_id === team.leader_id,
        })),
        userStatus: isLeader ? "leader" : isMember ? "member" : pendingTeamIds.has(team.id) ? "pending" : "none",
      };
    });
  } catch (error) {
    console.error("[hackathons] team list failed", error);
    return [];
  }
}

/** Join requests for the teams the signed-in user leads. */
export async function getHackathonJoinRequests(): Promise<HackathonJoinRequestItem[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const [supabase, user] = await Promise.all([createClient(), getSessionUser()]);
    if (!user) return [];
    const { data: ledTeams } = await (supabase.from("hackathon_teams") as any)
      .select("id, name")
      .eq("leader_id", user.id);
    const teams = (ledTeams ?? []) as Array<{ id: string; name: string }>;
    if (teams.length === 0) return [];
    const teamNames = new Map(teams.map((team) => [team.id, team.name]));

    const { data, error } = await (supabase.from("hackathon_join_requests") as any)
      .select("id, team_id, message, status, created_at, profile:user_id(full_name, department)")
      .in("team_id", teams.map((team) => team.id))
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("[hackathons] join request list failed", error);
      return [];
    }
    return (
      (data ?? []) as Array<{
        id: string;
        team_id: string;
        message: string | null;
        status: HackathonJoinRequestItem["status"];
        created_at: string;
        profile: { full_name: string | null; department: string | null } | null;
      }>
    ).map((row) => ({
      id: row.id,
      teamId: row.team_id,
      teamName: teamNames.get(row.team_id) ?? "",
      userName: row.profile?.full_name ?? "",
      userDepartment: row.profile?.department ?? null,
      message: row.message ?? "",
      status: row.status,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error("[hackathons] join request list failed", error);
    return [];
  }
}

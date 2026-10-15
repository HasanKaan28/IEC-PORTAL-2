"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  HackathonTeamItem,
  HackathonJoinRequestItem,
  LookingForTeamMemberItem,
} from "./hackathon-types";
import {
  memoryHackathons,
  memoryHackathonTeams,
  memoryHackathonJoinRequests,
  memoryLookingForTeamMembers,
} from "./hackathon-queries";

export async function createHackathonTeamAction(data: {
  hackathonId: string;
  name: string;
  description: string;
  lookingFor: string[];
}) {
  if (!data.name || data.name.trim().length < 3) {
    return { success: false, error: "Takım adı en az 3 karakter olmalıdır." };
  }

  const hackathon = memoryHackathons.find((h) => h.id === data.hackathonId);

  const newTeam: HackathonTeamItem = {
    id: `team-${Date.now()}`,
    hackathonId: data.hackathonId,
    hackathonTitle: hackathon?.title.split("—")[0].trim() || "Hackathon",
    name: data.name.trim(),
    description: data.description.trim(),
    isOpen: true,
    lookingFor: data.lookingFor && data.lookingFor.length > 0 ? data.lookingFor : ["Yazılımcı", "Donanımcı"],
    leaderId: "usr-current",
    leaderName: "Kaan Mete Şenyıldız",
    leaderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    leaderRole: "Kaptan & Kurucu",
    members: [
      {
        id: "usr-current",
        name: "Kaan Mete Şenyıldız",
        role: "Kaptan",
        department: "CSE",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      },
    ],
    userStatus: "leader",
  };

  try {
    const admin = createAdminClient();
    await (admin.from("hackathon_teams") as any).insert({
      hackathon_id: data.hackathonId,
      name: data.name.trim(),
      description: data.description.trim(),
      is_open: true,
      looking_for: newTeam.lookingFor,
      leader_id: "a0000000-0000-0000-0000-000000000001",
    });
  } catch {
    // Fallback
  }

  memoryHackathonTeams.unshift(newTeam);

  revalidatePath("/portal/hackathon");
  return { success: true, team: newTeam };
}

export async function requestJoinHackathonTeamAction(teamId: string, message: string) {
  if (!message || message.trim().length < 5) {
    return { success: false, error: "Lütfen takıma neler katabileceğinizi belirten en az 5 karakterlik bir mesaj yazınız." };
  }

  const team = memoryHackathonTeams.find((t) => t.id === teamId);

  const newRequest: HackathonJoinRequestItem = {
    id: `hjr-${Date.now()}`,
    teamId,
    teamName: team?.name || "Hackathon Takımı",
    userId: "usr-current",
    userName: "Kaan Mete Şenyıldız",
    userDepartment: "Bilgisayar Bilimleri (CSE)",
    message: message.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    const admin = createAdminClient();
    await (admin.from("hackathon_join_requests") as any).insert({
      team_id: teamId,
      user_id: "a0000000-0000-0000-0000-000000000001",
      message: message.trim(),
      status: "pending",
    });
  } catch {
    // Fallback
  }

  memoryHackathonJoinRequests.unshift(newRequest);

  if (team) {
    team.userStatus = "pending";
  }

  revalidatePath("/portal/hackathon");
  return { success: true, request: newRequest };
}

export async function reviewHackathonJoinRequestAction(
  requestId: string,
  status: "approved" | "rejected"
) {
  try {
    const admin = createAdminClient();
    await (admin.from("hackathon_join_requests") as any)
      .update({ status })
      .eq("id", requestId);
  } catch {
    // Fallback
  }

  const req = memoryHackathonJoinRequests.find((r) => r.id === requestId);
  if (req) {
    req.status = status;
    if (status === "approved") {
      const team = memoryHackathonTeams.find((t) => t.id === req.teamId);
      if (team) {
        team.members.push({
          id: req.userId,
          name: req.userName,
          role: "Üye",
          department: req.userDepartment,
        });
      }
    }
  }

  revalidatePath("/portal/hackathon");
  return { success: true };
}

export async function registerLookingForTeamAction(skills: string[], statement: string) {
  if (!statement || statement.trim().length < 10) {
    return { success: false, error: "Lütfen en az 10 karakterlik bir tanıtım cümlesi giriniz." };
  }

  const existingIdx = memoryLookingForTeamMembers.findIndex((m) => m.id === "usr-current");

  const entry: LookingForTeamMemberItem = {
    id: "usr-current",
    name: "Kaan Mete Şenyıldız",
    department: "Bilgisayar Bilimleri (CSE)",
    classYear: "2. Sınıf",
    skills: skills.length > 0 ? skills : ["Frontend", "C++", "IoT"],
    statement: statement.trim(),
    contactEmail: "student@ius.edu.ba",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
  };

  if (existingIdx >= 0) {
    memoryLookingForTeamMembers[existingIdx] = entry;
  } else {
    memoryLookingForTeamMembers.unshift(entry);
  }

  revalidatePath("/portal/hackathon");
  return { success: true, profile: entry };
}

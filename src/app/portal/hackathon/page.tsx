import React from "react";
import { Metadata } from "next";
import HackathonsPortalClient from "@/components/portal/hackathons/HackathonsPortalClient";
import {
  getHackathons,
  getHackathonTeams,
  getLookingForTeamMembers,
  getHackathonJoinRequests,
} from "@/lib/hackathons/hackathon-queries";

export const metadata: Metadata = {
  title: "Hackathon Takımları & Yarışmalar | IUS Engineering Club",
  description: "DevHack 2027 Saraybosna ve uluslararası hackathon ilanları, takım kurma ve takım arayan üyeler vitrini.",
};

export default async function PortalHackathonPage() {
  const [hackathons, teams, lookingMembers, joinRequests] = await Promise.all([
    getHackathons(),
    getHackathonTeams(),
    getLookingForTeamMembers(),
    getHackathonJoinRequests(),
  ]);

  return (
    <HackathonsPortalClient
      initialHackathons={hackathons}
      initialTeams={teams}
      initialLookingMembers={lookingMembers}
      initialJoinRequests={joinRequests}
    />
  );
}

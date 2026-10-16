import React from "react";
import type { Metadata } from "next";
import HackathonsPortalClient from "@/components/portal/hackathons/HackathonsPortalClient";
import { getHackathonJoinRequests, getHackathons, getHackathonTeams } from "@/lib/hackathons/hackathon-queries";
import { getSessionUser, userCan } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";

export async function generateMetadata(): Promise<Metadata> {
  const t = eventsHackathonsText[await getServerLocale()];
  return { title: t.metadata.hackathonsTitle, description: t.metadata.hackathonsDescription };
}

export default async function PortalHackathonPage() {
  const [user, hackathons, teams, joinRequests] = await Promise.all([
    getSessionUser(),
    getHackathons(),
    getHackathonTeams(),
    getHackathonJoinRequests(),
  ]);

  return (
    <HackathonsPortalClient
      hackathons={hackathons}
      teams={teams}
      joinRequests={joinRequests}
      canCreateHackathon={userCan(user, "hackathons.create")}
    />
  );
}

import React from "react";
import type { Metadata } from "next";
import EventsPortalClient from "@/components/portal/events/EventsPortalClient";
import { getEvents } from "@/lib/events/event-queries";
import { normalizeCheckInCode } from "@/lib/events/event-types";
import { getSessionUser, userCan } from "@/lib/auth/session";
import { guardPortalPage } from "@/lib/rbac/page-guard";
import { getServerLocale } from "@/lib/i18n/server";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";

export async function generateMetadata(): Promise<Metadata> {
  const t = eventsHackathonsText[await getServerLocale()];
  return { title: t.metadata.eventsTitle, description: t.metadata.eventsDescription };
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PortalEventsPage({ searchParams }: { searchParams: SearchParams }) {
  await guardPortalPage("events");
  const [user, events, params] = await Promise.all([getSessionUser(), getEvents(), searchParams]);

  // A scanned QR code links here with ?checkin=<event id>&code=<digits>; only prefill for an event
  // whose check-in is open. The code is verified on the server when the member confirms.
  let initialCheckIn: { eventId: string; code: string } | null = null;
  const checkinId = typeof params.checkin === "string" ? params.checkin : null;
  const rawCode = typeof params.code === "string" ? params.code : "";
  if (checkinId) {
    const target = events.find((event) => event.id === checkinId);
    if (target && target.checkInOpen && !target.attended) {
      initialCheckIn = { eventId: target.id, code: normalizeCheckInCode(rawCode) ?? "" };
    }
  }

  return (
    <EventsPortalClient
      events={events}
      canManage={userCan(user, "events.manage")}
      canHost={userCan(user, "events.qr_host")}
      initialCheckIn={initialCheckIn}
    />
  );
}

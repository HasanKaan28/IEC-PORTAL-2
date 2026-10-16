import React from "react";
import { Metadata } from "next";
import EventsPortalClient from "@/components/portal/events/EventsPortalClient";
import { getEvents } from "@/lib/events/event-queries";

export const metadata: Metadata = {
  title: "Etkinlikler & Atölyeler",
  description:
    "Mühendislik atölyeleri, teknoloji seminerleri, hackathonlar ve dinamik QR yoklama sistemi.",
};

export default async function PortalEventsPage() {
  const events = await getEvents();

  return <EventsPortalClient initialEvents={events} />;
}

import React from "react";
import type { Metadata } from "next";
import CertificatesPortalClient from "@/components/portal/certificates/CertificatesPortalClient";
import { getUserCertificates } from "@/lib/events/event-queries";
import { getServerLocale } from "@/lib/i18n/server";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";

export async function generateMetadata(): Promise<Metadata> {
  const t = eventsHackathonsText[await getServerLocale()];
  return { title: t.metadata.certificatesTitle, description: t.metadata.certificatesDescription };
}

export default async function PortalCertificatesPage() {
  // Only the signed-in user's own certificates (resolved from the session on the server).
  const certificates = await getUserCertificates();
  return <CertificatesPortalClient certificates={certificates} />;
}

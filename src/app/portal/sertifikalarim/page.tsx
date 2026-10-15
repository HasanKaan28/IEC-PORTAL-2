import React from "react";
import { Metadata } from "next";
import CertificatesPortalClient from "@/components/portal/certificates/CertificatesPortalClient";
import { getUserCertificates } from "@/lib/events/event-queries";

export const metadata: Metadata = {
  title: "Sertifikalarım | IUS Engineering Club",
  description:
    "Etkinlik başarı ve katılım sertifikaları, doğrulanabilir dijital kimlikler, PDF indirme ve LinkedIn profil entegrasyonu.",
};

export default async function PortalCertificatesPage() {
  const certificates = await getUserCertificates();

  return <CertificatesPortalClient initialCertificates={certificates} />;
}

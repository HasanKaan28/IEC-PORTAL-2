import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getEventById, getEventAttendances } from "@/lib/events/event-queries";
import { generateEventTOTP } from "@/lib/events/totp";
import LiveAttendancePresenter from "@/components/portal/admin/LiveAttendancePresenter";

export const metadata: Metadata = {
  title: "Canlı Yoklama Projeksiyon Ekranı | IUS Engineering Club",
  description:
    "Organizatör projeksiyon ekranı: 60 saniyede bir dönen dinamik TOTP tabanlı QR kod ve canlı yoklama akışı.",
};

export default async function LiveAttendancePresenterPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  const { code, payload, remainingSeconds } = generateEventTOTP(
    event.id,
    event.qrSigningSecret
  );

  const attendances = await getEventAttendances(event.id);

  return (
    <LiveAttendancePresenter
      event={event}
      initialCode={code}
      initialPayload={payload}
      initialRemaining={remainingSeconds}
      initialAttendees={attendances}
    />
  );
}

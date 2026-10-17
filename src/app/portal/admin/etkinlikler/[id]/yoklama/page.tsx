import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, KeyRound, ShieldAlert } from "lucide-react";
import LiveAttendancePresenter from "@/components/portal/admin/LiveAttendancePresenter";
import { getSessionUser, userCan } from "@/lib/auth/session";
import { getEventAttendancesForHost, getEventSigningRecord } from "@/lib/events/event-queries";
import { getEventStatus, isUuid, type PresenterEvent } from "@/lib/events/event-types";
import { buildCheckInUrl, generateEventTOTP, QrSigningError, type TOTPResult } from "@/lib/events/totp";
import { getServerLocale } from "@/lib/i18n/server";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";

export async function generateMetadata(): Promise<Metadata> {
  const t = eventsHackathonsText[await getServerLocale()];
  return {
    title: t.metadata.presenterTitle,
    description: t.metadata.presenterDescription,
    robots: { index: false, follow: false },
  };
}

function Notice({ icon, title, body, backLabel }: { icon: React.ReactNode; title: string; body: string; backLabel: string }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600" aria-hidden="true">
        {icon}
      </div>
      <h1 className="mt-4 font-display text-lg font-bold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-600">{body}</p>
      <Link
        href="/portal/etkinlikler"
        className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {backLabel}
      </Link>
    </div>
  );
}

/** Live QR check-in screen. Only members with events.qr_host may open it. */
export default async function LiveAttendancePresenterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = eventsHackathonsText[await getServerLocale()];

  const user = await getSessionUser();
  if (!user) redirect("/portal/giris");
  if (!userCan(user, "events.qr_host")) {
    return (
      <Notice
        icon={<ShieldAlert className="h-6 w-6" />}
        title={t.presenter.forbiddenTitle}
        body={t.presenter.forbiddenBody}
        backLabel={t.presenter.back}
      />
    );
  }
  if (!isUuid(id)) notFound();

  const record = await getEventSigningRecord(id, "host");
  if (!record) notFound();

  let totp: TOTPResult;
  try {
    totp = generateEventTOTP(record.id, record.qrSigningSecret);
  } catch (error) {
    if (!(error instanceof QrSigningError)) throw error;
    console.error("[presenter] QR code generation unavailable:", error.message);
    return (
      <Notice
        icon={<KeyRound className="h-6 w-6" />}
        title={t.presenter.qrUnavailableTitle}
        body={t.presenter.qrUnavailableBody}
        backLabel={t.presenter.back}
      />
    );
  }

  const attendees = await getEventAttendancesForHost(record.id);
  // Only public fields go to the client component; the signing secret stays on the server.
  const event: PresenterEvent = {
    id: record.id,
    title: record.title,
    venue: record.venue,
    dateTime: record.dateTime,
    checkInOpen: getEventStatus(record.dateTime) === "live",
  };

  return (
    <LiveAttendancePresenter
      event={event}
      initialCode={totp.code}
      initialQrValue={buildCheckInUrl(record.id, totp.code)}
      initialRemaining={totp.remainingSeconds}
      initialAttendees={attendees}
    />
  );
}

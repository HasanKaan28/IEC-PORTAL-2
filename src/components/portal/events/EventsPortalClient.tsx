"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Calendar, CheckCircle2, Clock, MapPin, Plus, QrCode, Tv } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate } from "@/lib/i18n/format";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";
import { EVENT_TIME_ZONE, type EventItem, type EventStatus } from "@/lib/events/event-types";
import CheckInModal from "./CheckInModal";
import CreateEventModal from "./CreateEventModal";
import EmptyState from "./EmptyState";
import PortalToast, { useToast } from "./PortalToast";
import { cardClass, chipClass, iconButton, primaryButton, secondaryButton, tabButton } from "./styles";

interface EventsPortalClientProps {
  events: EventItem[];
  canManage: boolean;
  canHost: boolean;
  /** From a scanned QR link (?checkin=<event>&code=<digits>), already validated on the server. */
  initialCheckIn: { eventId: string; code: string } | null;
}

type EventsTab = "all" | "upcoming" | "past";

const STATUS_BADGE: Record<EventStatus, string> = {
  live: "border-emerald-200 bg-emerald-50 text-emerald-700",
  upcoming: "border-brand-200 bg-brand-50 text-brand-700",
  past: "border-slate-200 bg-slate-100 text-slate-600",
};

export default function EventsPortalClient({ events, canManage, canHost, initialCheckIn }: EventsPortalClientProps) {
  const { locale } = useLocale();
  const t = eventsHackathonsText[locale];
  const router = useRouter();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  const [activeTab, setActiveTab] = useState<EventsTab>("all");
  const [checkIn, setCheckIn] = useState<{ eventId: string; code?: string } | null>(initialCheckIn);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        if (activeTab === "upcoming") return event.status !== "past";
        if (activeTab === "past") return event.status === "past";
        return true;
      }),
    [events, activeTab]
  );
  const activeCount = events.filter((event) => event.status !== "past").length;
  const checkInEvent = checkIn ? events.find((event) => event.id === checkIn.eventId) ?? null : null;

  const closeCheckIn = () => {
    setCheckIn(null);
    // Drop ?checkin=...&code=... so a reload does not reopen the dialog with an expired code.
    if (initialCheckIn) router.replace("/portal/etkinlikler", { scroll: false });
  };

  const formatParts = (iso: string) => ({
    day: formatDate(iso, locale, { day: "numeric", timeZone: EVENT_TIME_ZONE }),
    month: formatDate(iso, locale, { month: "short", timeZone: EVENT_TIME_ZONE }),
    when: formatDate(iso, locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: EVENT_TIME_ZONE,
    }),
  });

  const tabs: Array<{ id: EventsTab; label: string }> = [
    { id: "all", label: t.events.tabs.all },
    { id: "upcoming", label: t.events.tabs.upcoming },
    { id: "past", label: t.events.tabs.past },
  ];

  return (
    <div className="space-y-6">
      <PortalToast toast={toast} onDismiss={dismissToast} dismissLabel={t.common.dismiss} />

      <header className={`${cardClass} flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center`}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-900">{t.events.title}</h1>
            {activeCount > 0 && (
              <span className={`${chipClass} rounded-full border-brand-200 bg-brand-50 text-brand-700`}>
                {t.events.upcomingCount(activeCount)}
              </span>
            )}
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{t.events.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/portal/sertifikalarim"
            className={`${secondaryButton} border-accent-200 bg-accent-50 text-accent-800 hover:bg-accent-100 hover:text-accent-900`}
          >
            <Award className="h-4 w-4" aria-hidden="true" />
            <span>{t.events.myCertificates}</span>
          </Link>
          {canManage && (
            <button type="button" onClick={() => setIsCreateOpen(true)} className={primaryButton}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{t.events.newEvent}</span>
            </button>
          )}
        </div>
      </header>

      {events.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-6 w-6" />}
          title={t.events.emptyTitle}
          body={t.events.emptyBody}
          action={
            canManage ? (
              <button type="button" onClick={() => setIsCreateOpen(true)} className={primaryButton}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>{t.events.emptyManagerAction}</span>
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div role="group" aria-label={t.events.filterLabel} className="flex items-center gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                aria-pressed={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={tabButton(activeTab === tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-6 w-6" />}
              title={t.events.emptyFilteredTitle}
              body={t.events.emptyFilteredBody}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {filteredEvents.map((event) => {
                const parts = formatParts(event.dateTime);
                return (
                  <li key={event.id}>
                    <article className={`${cardClass} flex h-full flex-col p-5 transition-shadow hover:shadow-md`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-brand-200 bg-brand-50"
                            aria-hidden="true"
                          >
                            <span className="text-xs font-semibold uppercase text-brand-700">{parts.month}</span>
                            <span className="text-lg font-bold leading-tight text-slate-900">{parts.day}</span>
                          </div>
                          <div className="min-w-0">
                            <span className={`${chipClass} ${STATUS_BADGE[event.status]}`}>
                              {t.events.status[event.status]}
                            </span>
                            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                              <Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                              <time dateTime={event.dateTime}>{parts.when}</time>
                            </p>
                          </div>
                        </div>

                        {canHost && event.status !== "past" && (
                          <Link
                            href={`/portal/admin/etkinlikler/${event.id}/yoklama`}
                            aria-label={t.events.openPresenter(event.title)}
                            title={t.events.openPresenter(event.title)}
                            className={`${iconButton} shrink-0`}
                          >
                            <Tv className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        )}
                      </div>

                      <h2 className="mt-4 text-base font-bold leading-snug text-slate-900">{event.title}</h2>
                      <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                        {event.description}
                      </p>
                      <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-600">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
                        <span className="sr-only">{t.events.venueLabel}: </span>
                        <span className="truncate">{event.venue}</span>
                      </p>

                      <div className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                        {event.attended ? (
                          <>
                            <span className={`${chipClass} border-emerald-200 bg-emerald-50 text-emerald-700`}>
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                              {t.events.attended}
                            </span>
                            {event.certificateCode && (
                              <Link href="/portal/sertifikalarim" className={secondaryButton}>
                                <Award className="h-4 w-4 text-accent-600" aria-hidden="true" />
                                <span>{t.events.viewCertificate}</span>
                              </Link>
                            )}
                          </>
                        ) : event.checkInOpen ? (
                          <button type="button" onClick={() => setCheckIn({ eventId: event.id })} className={primaryButton}>
                            <QrCode className="h-4 w-4" aria-hidden="true" />
                            <span>{t.events.checkIn}</span>
                          </button>
                        ) : (
                          <span className="text-sm text-slate-500">
                            {event.status === "upcoming" ? t.events.opensOnEventDay : t.events.ended}
                          </span>
                        )}
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {checkInEvent && (
        <CheckInModal
          key={checkInEvent.id}
          event={checkInEvent}
          initialCode={checkIn?.code}
          onClose={closeCheckIn}
          onCheckedIn={() => router.refresh()}
        />
      )}

      {isCreateOpen && (
        <CreateEventModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={(message) => {
            setIsCreateOpen(false);
            showToast({ kind: "success", message });
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { AlertTriangle, ArrowLeft, Maximize2, MapPin, Minimize2, Moon, ShieldCheck, Sun, Users } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate } from "@/lib/i18n/format";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";
import { EVENT_TIME_ZONE, type EventAttendanceItem, type PresenterEvent } from "@/lib/events/event-types";
import { getEventLiveTOTPAction } from "@/lib/events/event-actions";

interface LiveAttendancePresenterProps {
  event: PresenterEvent;
  initialCode: string;
  initialQrValue: string;
  initialRemaining: number;
  initialAttendees: EventAttendanceItem[];
}

const ROTATION_SECONDS = 60;
const POLL_INTERVAL_MS = 5000;
const RING_RADIUS = 16;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Host projector screen: rotating QR code, the same code as digits, and the live attendee list. */
export default function LiveAttendancePresenter({
  event,
  initialCode,
  initialQrValue,
  initialRemaining,
  initialAttendees,
}: LiveAttendancePresenterProps) {
  const { locale } = useLocale();
  const t = eventsHackathonsText[locale].presenter;

  const [code, setCode] = useState(initialCode);
  const [qrValue, setQrValue] = useState(initialQrValue);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [attendees, setAttendees] = useState<EventAttendanceItem[]>(initialAttendees);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const expiresAtRef = useRef(Date.now() + initialRemaining * 1000);
  const inFlightRef = useRef(false);

  const sync = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      const res = await getEventLiveTOTPAction(event.id);
      if (res.success && res.data) {
        setCode(res.data.code);
        setQrValue(res.data.qrValue);
        setAttendees(res.data.attendees);
        expiresAtRef.current = Date.now() + res.data.remainingSeconds * 1000;
        setRemaining(res.data.remainingSeconds);
        setSyncError(null);
      } else {
        setSyncError(res.success ? t.syncError : res.error);
      }
    } catch {
      setSyncError(t.syncError);
    } finally {
      inFlightRef.current = false;
    }
  }, [event.id, t.syncError]);

  // Countdown from the server-provided expiry; fetch the next code as soon as it runs out.
  useEffect(() => {
    const timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((expiresAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) void sync();
    }, 1000);
    return () => clearInterval(timer);
  }, [sync]);

  // Keep the attendee list and clock in step with the server.
  useEffect(() => {
    const poll = setInterval(() => void sync(), POLL_INTERVAL_MS);
    return () => clearInterval(poll);
  }, [sync]);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(qrValue, {
      width: 480,
      margin: 1,
      errorCorrectionLevel: "M",
      color: { dark: isDarkMode ? "#ffffffff" : "#1c1623ff", light: "#00000000" },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch((error) => console.error("[presenter] QR render failed", error));
    return () => {
      cancelled = true;
    };
  }, [qrValue, isDarkMode]);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current?.requestFullscreen().catch(() => {});
    }
  };

  const shownSeconds = Math.min(ROTATION_SECONDS, remaining);
  const formattedCode = code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
  const surface = isDarkMode ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white";
  const mutedText = isDarkMode ? "text-slate-300" : "text-slate-600";
  const focusRing = "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-400";

  return (
    <div
      ref={containerRef}
      className={`flex min-h-[80vh] flex-col overflow-y-auto rounded-2xl border transition-colors duration-300 ${
        isDarkMode ? "border-slate-800 bg-ink-900 text-white" : "border-slate-200 bg-slate-50 text-slate-900"
      }`}
    >
      <header
        className={`flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4 ${
          isDarkMode ? "border-slate-800 bg-ink-950/70" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/portal/etkinlikler"
            aria-label={t.back}
            title={t.back}
            className={`rounded-xl p-2 transition-colors ${focusRing} ${
              isDarkMode ? "bg-slate-800 text-slate-200 hover:bg-slate-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                  isDarkMode ? "border-brand-500/40 bg-brand-500/15 text-brand-200" : "border-brand-200 bg-brand-50 text-brand-700"
                }`}
              >
                {t.badge}
              </span>
              <span className={`flex items-center gap-1.5 text-xs ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                <span className="h-2 w-2 rounded-full bg-emerald-500 motion-safe:animate-pulse" aria-hidden="true" />
                {t.rotating}
              </span>
            </div>
            <h1 className="mt-1 truncate font-display text-lg font-bold">{event.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsDarkMode((value) => !value)}
            aria-label={isDarkMode ? t.toLightMode : t.toDarkMode}
            title={isDarkMode ? t.toLightMode : t.toDarkMode}
            className={`rounded-xl border p-2.5 transition-colors ${focusRing} ${
              isDarkMode
                ? "border-slate-700 bg-slate-900 text-accent-300 hover:bg-slate-800"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isDarkMode ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${focusRing} ${
              isDarkMode
                ? "border-brand-500/40 bg-brand-600/20 text-brand-100 hover:bg-brand-600/30"
                : "border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100"
            }`}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" aria-hidden="true" /> : <Maximize2 className="h-4 w-4" aria-hidden="true" />}
            <span>{isFullscreen ? t.exitFullscreen : t.enterFullscreen}</span>
          </button>
        </div>
      </header>

      {(syncError || !event.checkInOpen) && (
        <div className="space-y-2 px-6 pt-4">
          {!event.checkInOpen && (
            <p className="flex items-start gap-2 rounded-xl border border-accent-300 bg-accent-50 px-4 py-2.5 text-sm text-accent-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {t.closedNotice}
            </p>
          )}
          {syncError && (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {syncError}
            </p>
          )}
        </div>
      )}

      <main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-center gap-8 p-6 lg:grid-cols-12">
        <section className="flex flex-col items-center space-y-6 text-center lg:col-span-7">
          <div className="flex items-center gap-3" role="timer" aria-label={t.countdownLabel(shownSeconds)}>
            <div className="relative flex h-11 w-11 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 40 40" aria-hidden="true">
                <circle
                  cx="20"
                  cy="20"
                  r={RING_RADIUS}
                  className={isDarkMode ? "stroke-slate-800" : "stroke-slate-200"}
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="20"
                  cy="20"
                  r={RING_RADIUS}
                  className="stroke-brand-500 transition-all duration-1000 ease-linear"
                  strokeWidth="3"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={RING_CIRCUMFERENCE * (1 - shownSeconds / ROTATION_SECONDS)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute font-mono text-xs font-bold" aria-hidden="true">
                {shownSeconds}
              </span>
            </div>
            <span className={`text-sm font-semibold ${isDarkMode ? "text-brand-200" : "text-brand-700"}`} aria-hidden="true">
              {t.nextCodeIn(shownSeconds)}
            </span>
          </div>

          <div
            className={`relative rounded-3xl border p-6 shadow-2xl transition-colors ${
              isDarkMode ? "border-brand-500/30 bg-slate-900/90" : "border-slate-200 bg-white"
            }`}
          >
            <div className="absolute -left-1.5 -top-1.5 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-brand-500" aria-hidden="true" />
            <div className="absolute -right-1.5 -top-1.5 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-brand-500" aria-hidden="true" />
            <div className="absolute -bottom-1.5 -left-1.5 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-brand-500" aria-hidden="true" />
            <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-brand-500" aria-hidden="true" />
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL generated in the browser
              <img src={qrDataUrl} alt={t.qrAlt} className="mx-auto h-72 w-72 object-contain sm:h-80 sm:w-80" />
            ) : (
              <div className={`flex h-72 w-72 items-center justify-center text-sm sm:h-80 sm:w-80 ${mutedText}`}>{t.qrLoading}</div>
            )}
          </div>

          <div className="space-y-2">
            <p className={`max-w-md text-sm ${mutedText}`}>{t.manualCodeLabel}</p>
            <div
              className={`inline-block rounded-2xl border px-8 py-3.5 font-mono text-4xl font-black tracking-widest shadow-inner sm:text-5xl ${
                isDarkMode ? "border-brand-500/40 bg-ink-950 text-brand-200" : "border-slate-300 bg-slate-100 text-brand-700"
              }`}
            >
              {formattedCode}
            </div>
          </div>

          <p className={`flex max-w-md items-start gap-2 text-left text-sm ${mutedText}`}>
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden="true" />
            <span>{t.antiCheat}</span>
          </p>
        </section>

        <section className="flex h-full flex-col space-y-4 lg:col-span-5" aria-labelledby="presenter-attendees-heading">
          <div className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-5 ${surface}`}>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                aria-hidden="true"
              >
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h2 id="presenter-attendees-heading" className={`text-xs font-semibold uppercase tracking-wide ${mutedText}`}>
                  {t.attendeesLabel}
                </h2>
                <p className={`text-xl font-bold ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`} aria-live="polite">
                  {t.attendeesCount(attendees.length)}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 text-sm ${mutedText}`}>
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">{t.venueLabel}: </span>
              {event.venue}
            </span>
          </div>

          <div className={`max-h-[440px] flex-1 overflow-y-auto rounded-2xl border p-4 ${surface}`}>
            <p className={`border-b pb-2 text-xs font-semibold uppercase tracking-wide ${mutedText} ${isDarkMode ? "border-slate-800" : "border-slate-200"}`}>
              {t.liveFeed}
            </p>
            {attendees.length === 0 ? (
              <div className={`space-y-2 py-12 text-center text-sm ${mutedText}`}>
                <Users className="mx-auto h-8 w-8 opacity-40" aria-hidden="true" />
                <p className="font-semibold">{t.emptyTitle}</p>
                <p>{t.emptyBody}</p>
              </div>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {attendees.map((attendee) => {
                  const name = attendee.userName || t.unknownAttendee;
                  return (
                    <li
                      key={attendee.id}
                      className={`flex items-center justify-between gap-3 rounded-xl border p-3 text-sm ${
                        isDarkMode ? "border-slate-800 bg-ink-950/70" : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                            isDarkMode ? "bg-brand-500/20 text-brand-200" : "bg-brand-100 text-brand-700"
                          }`}
                          aria-hidden="true"
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className={`truncate font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>{name}</p>
                          <p className={`text-xs ${mutedText}`}>
                            <time dateTime={attendee.checkedInAt}>
                              {t.checkedInAt(
                                formatDate(attendee.checkedInAt, locale, {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  timeZone: EVENT_TIME_ZONE,
                                })
                              )}
                            </time>
                          </p>
                        </div>
                      </div>
                      <span className={`flex shrink-0 items-center gap-1.5 text-xs font-semibold ${isDarkMode ? "text-emerald-300" : "text-emerald-700"}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                        {t.confirmed}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </main>

      <footer
        className={`border-t px-6 py-3 text-center text-xs ${
          isDarkMode ? "border-slate-800 bg-ink-950/50 text-slate-400" : "border-slate-200 bg-white text-slate-500"
        }`}
      >
        {t.footer}
      </footer>
    </div>
  );
}

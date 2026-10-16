"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Award, CheckCircle2, QrCode } from "lucide-react";
import confetti from "canvas-confetti";
import { useLocale } from "@/lib/i18n/locale-context";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";
import { normalizeCheckInCode, type CheckInResult, type EventItem } from "@/lib/events/event-types";
import { checkInWithTOTPAction } from "@/lib/events/event-actions";
import PortalDialog from "./PortalDialog";
import { hintClass, inputClass, labelClass, primaryButton, secondaryButton } from "./styles";

interface CheckInModalProps {
  event: EventItem;
  /** Code from a scanned QR link; prefilled but never submitted automatically. */
  initialCode?: string;
  onClose: () => void;
  onCheckedIn: () => void;
}

function formatCode(code: string): string {
  return code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
}

export default function CheckInModal({ event, initialCode, onClose, onCheckedIn }: CheckInModalProps) {
  const { locale } = useLocale();
  const t = eventsHackathonsText[locale];
  const [code, setCode] = useState(initialCode ? formatCode(initialCode) : "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<{ data: CheckInResult; message: string } | null>(null);
  const inputId = `checkin-code-${event.id}`;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    const normalized = normalizeCheckInCode(code);
    if (!normalized) {
      setErrorMsg(t.errors.codeFormat);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    const res = await checkInWithTOTPAction(event.id, normalized);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    const data = res.data ?? { alreadyCheckedIn: false, certificateCode: null };
    setResult({ data, message: res.message ?? "" });
    if (!data.alreadyCheckedIn) {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, disableForReducedMotion: true });
    }
    onCheckedIn();
  };

  return (
    <PortalDialog
      title={t.checkIn.title}
      description={event.title}
      icon={<QrCode className="h-4 w-4" />}
      closeLabel={t.common.closeDialog}
      onClose={onClose}
      size="md"
    >
      <div className="p-5">
        {result ? (
          <div className="space-y-4 py-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 border-emerald-50 bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {result.data.alreadyCheckedIn ? t.checkIn.alreadyTitle : t.checkIn.successTitle}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {result.data.certificateCode ? t.checkIn.successBody : result.message}
              </p>
            </div>

            {result.data.certificateCode && (
              <div className="inline-block rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <span className="block text-xs text-slate-500">{t.checkIn.certificateCodeLabel}</span>
                <span className="font-mono text-base font-bold text-brand-700">{result.data.certificateCode}</span>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              {result.data.certificateCode && (
                <Link href="/portal/sertifikalarim" onClick={onClose} className={`${primaryButton} w-full`}>
                  <Award className="h-4 w-4" aria-hidden="true" />
                  <span>{t.checkIn.goToCertificates}</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
              <button type="button" onClick={onClose} className={`${secondaryButton} w-full`}>
                {t.common.close}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <p className="rounded-xl border border-accent-200 bg-accent-50 p-3 text-sm text-accent-800">{t.checkIn.intro}</p>

            {errorMsg && (
              <div
                id={errorId}
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor={inputId} className={labelClass}>
                {t.checkIn.codeLabel}
              </label>
              <input
                id={inputId}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                autoFocus
                maxLength={7}
                value={code}
                onChange={(changeEvent) => setCode(changeEvent.target.value.replace(/[^\d\s]/g, ""))}
                placeholder={t.checkIn.codePlaceholder}
                aria-describedby={errorMsg ? `${hintId} ${errorId}` : hintId}
                aria-invalid={Boolean(errorMsg)}
                className={`${inputClass} py-3 text-center font-mono text-2xl font-bold tracking-widest`}
              />
              <p id={hintId} className={hintClass}>
                {t.checkIn.codeHint}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button type="button" onClick={onClose} className={secondaryButton}>
                {t.common.cancel}
              </button>
              <button type="submit" disabled={isSubmitting} className={primaryButton}>
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>{isSubmitting ? t.checkIn.submitting : t.checkIn.submit}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </PortalDialog>
  );
}

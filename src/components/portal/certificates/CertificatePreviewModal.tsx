"use client";

import React, { useEffect, useRef, useState } from "react";
import { Award, Check, Copy, Download, ExternalLink, Share2 } from "lucide-react";
import ClubLogo from "@/components/shared/ClubLogo";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate } from "@/lib/i18n/format";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";
import type { CertificateItem } from "@/lib/events/event-types";
import { generateLinkedInCertUrl } from "@/lib/certificates/linkedin";
import PortalDialog from "@/components/portal/events/PortalDialog";
import { linkedInButton, primaryButton, secondaryButton } from "@/components/portal/events/styles";

interface CertificatePreviewModalProps {
  cert: CertificateItem;
  onClose: () => void;
}

/**
 * On-screen preview of the certificate. The certificate wording mirrors the official English PDF;
 * the labels around it follow the portal language.
 */
export default function CertificatePreviewModal({ cert, onClose }: CertificatePreviewModalProps) {
  const { locale } = useLocale();
  const t = eventsHackathonsText[locale];
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  const pdfUrl = `/api/certificates/${encodeURIComponent(cert.certificateCode)}/pdf`;
  const verifyPath = `/dogrula?code=${encodeURIComponent(cert.certificateCode)}`;
  const issueDate = formatDate(`${cert.issueDate}T00:00:00Z`, locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const copyVerifyLink = async () => {
    try {
      await navigator.clipboard.writeText(cert.verifyUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState("idle"), 2500);
  };

  return (
    <PortalDialog
      title={t.preview.title}
      description={t.preview.code(cert.certificateCode)}
      icon={<Award className="h-4 w-4" />}
      closeLabel={t.common.closeDialog}
      onClose={onClose}
      size="4xl"
    >
      <div className="flex max-h-[75vh] flex-col">
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
          <p className="mb-3 text-center text-xs text-slate-500">{t.preview.englishNote}</p>
          <div className="relative mx-auto w-full max-w-3xl space-y-6 rounded-2xl border-4 border-slate-900 bg-white p-6 text-center shadow-xl sm:p-10">
            <div className="pointer-events-none absolute inset-2.5 rounded-xl border-2 border-accent-500/60" aria-hidden="true" />

            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                International University of Sarajevo · FENS
              </p>
              <p className="font-display text-xl font-black tracking-tight text-slate-900 sm:text-2xl">IUS ENGINEERING CLUB</p>
              <p className="pt-2">
                <span className="border-b border-accent-300 pb-0.5 font-serif text-sm font-bold uppercase tracking-widest text-accent-700">
                  Certificate of Achievement
                </span>
              </p>
            </div>

            <div className="space-y-1 pt-2">
              <p className="font-serif text-sm italic text-slate-500">This official credential is hereby conferred upon</p>
              <p className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{cert.userName}</p>
              <p className="mx-auto max-w-lg pt-1 font-serif text-sm text-slate-600">
                for actively participating in and successfully fulfilling all technical requirements of the engineering event
              </p>
              <p className="font-display text-base font-bold text-brand-700 sm:text-lg">&ldquo;{cert.eventTitle}&rdquo;</p>
            </div>

            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-600">
              {cert.trainingHours !== null && cert.trainingHours > 0 && <li>{t.preview.trainingHours(cert.trainingHours)}</li>}
              <li>{t.preview.issued(issueDate)}</li>
              <li className="font-semibold text-accent-700">{t.preview.registered}</li>
            </ul>

            {cert.skills.length > 0 && (
              <ul className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {cert.skills.map((skill) => (
                  <li key={skill} className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {skill}
                  </li>
                ))}
              </ul>
            )}

            <div className="grid grid-cols-3 items-end gap-2 border-t border-slate-100 pt-6 text-center">
              <div className="space-y-0.5">
                <p className="mx-auto w-28 border-b border-slate-400 pb-1 font-serif text-xs font-bold text-slate-800 sm:w-36 sm:text-sm">
                  Prof. Dr. Leila Miller
                </p>
                <p className="text-xs text-slate-500">{t.preview.advisorRole}</p>
              </div>
              <div className="flex flex-col items-center justify-center">
                <ClubLogo size={48} variant="color" alt={t.preview.sealAlt} />
                <span className="mt-1 font-mono text-xs font-semibold text-accent-800">{cert.certificateCode}</span>
              </div>
              <div className="space-y-0.5">
                <p className="mx-auto w-28 border-b border-slate-400 pb-1 font-serif text-xs font-bold text-slate-800 sm:w-36 sm:text-sm">
                  Kaan Mete Şenyıldız
                </p>
                <p className="text-xs text-slate-500">{t.preview.presidentRole}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={copyVerifyLink} className={`${secondaryButton} px-3`}>
              {copyState === "copied" ? (
                <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4 text-slate-500" aria-hidden="true" />
              )}
              <span aria-live="polite">
                {copyState === "copied" ? t.preview.copied : copyState === "failed" ? t.preview.copyFailed : t.preview.copyLink}
              </span>
            </button>
            <a href={verifyPath} target="_blank" rel="noopener noreferrer" className={`${secondaryButton} px-3`}>
              <ExternalLink className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span>{t.preview.openVerify}</span>
              <span className="sr-only">{t.common.opensInNewTab}</span>
            </a>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a href={generateLinkedInCertUrl(cert)} target="_blank" rel="noopener noreferrer" className={linkedInButton}>
              <Share2 className="h-4 w-4" aria-hidden="true" />
              <span>{t.preview.linkedIn}</span>
              <span className="sr-only">{t.common.opensInNewTab}</span>
            </a>
            <a href={pdfUrl} download={`${cert.certificateCode}.pdf`} className={primaryButton}>
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>{t.preview.downloadPdf}</span>
            </a>
          </div>
        </div>
      </div>
    </PortalDialog>
  );
}

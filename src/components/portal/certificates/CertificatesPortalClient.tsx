"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Award, Calendar, CalendarCheck, Clock, Download, Eye, Search, Share2, ShieldCheck } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate } from "@/lib/i18n/format";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";
import type { CertificateItem } from "@/lib/events/event-types";
import { generateLinkedInCertUrl } from "@/lib/certificates/linkedin";
import EmptyState from "@/components/portal/events/EmptyState";
import {
  cardClass,
  chipClass,
  inputClass,
  linkedInButton,
  primaryButton,
  secondaryButton,
} from "@/components/portal/events/styles";
import CertificatePreviewModal from "./CertificatePreviewModal";

interface CertificatesPortalClientProps {
  certificates: CertificateItem[];
}

export default function CertificatesPortalClient({ certificates }: CertificatesPortalClientProps) {
  const { locale } = useLocale();
  const t = eventsHackathonsText[locale];
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const formatIssueDate = (date: string) =>
    formatDate(`${date}T00:00:00Z`, locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  const filteredCertificates = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase(locale);
    if (!query) return certificates;
    return certificates.filter(
      (cert) =>
        cert.eventTitle.toLocaleLowerCase(locale).includes(query) ||
        cert.certificateCode.toLocaleLowerCase(locale).includes(query) ||
        cert.skills.some((skill) => skill.toLocaleLowerCase(locale).includes(query))
    );
  }, [certificates, searchQuery, locale]);

  const totalHours = certificates.reduce((sum, cert) => sum + (cert.trainingHours ?? 0), 0);
  const latest = certificates.reduce<string | null>(
    (max, cert) => (max === null || cert.issueDate > max ? cert.issueDate : max),
    null
  );

  const metrics = [
    {
      label: t.certificates.metricTotal,
      value: String(certificates.length),
      icon: <Award className="h-5 w-5" />,
      tone: "border-brand-200 bg-brand-50 text-brand-600",
    },
    {
      label: t.certificates.metricHours,
      value: totalHours > 0 ? t.certificates.hoursValue(totalHours) : t.certificates.metricNone,
      icon: <Clock className="h-5 w-5" />,
      tone: "border-accent-200 bg-accent-50 text-accent-700",
    },
    {
      label: t.certificates.metricLatest,
      value: latest ? formatIssueDate(latest) : t.certificates.metricNone,
      icon: <CalendarCheck className="h-5 w-5" />,
      tone: "border-emerald-200 bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <header className={`${cardClass} flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center`}>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-900">{t.certificates.title}</h1>
            <span className={`${chipClass} rounded-full border-accent-200 bg-accent-50 text-accent-800`}>
              {t.certificates.count(certificates.length)}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{t.certificates.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dogrula" className={secondaryButton}>
            <ShieldCheck className="h-4 w-4 text-slate-500" aria-hidden="true" />
            <span>{t.certificates.verifyPage}</span>
          </Link>
          <Link href="/portal/etkinlikler" className={primaryButton}>
            <Calendar className="h-4 w-4" aria-hidden="true" />
            <span>{t.certificates.browseEvents}</span>
          </Link>
        </div>
      </header>

      {certificates.length === 0 ? (
        <EmptyState
          icon={<Award className="h-6 w-6" />}
          title={t.certificates.emptyTitle}
          body={t.certificates.emptyBody}
          action={
            <Link href="/portal/etkinlikler" className={primaryButton}>
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>{t.certificates.emptyAction}</span>
            </Link>
          }
        />
      ) : (
        <>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className={`${cardClass} flex items-center gap-3 p-4`}>
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${metric.tone}`} aria-hidden="true">
                  {metric.icon}
                </div>
                <div className="min-w-0">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{metric.label}</dt>
                  <dd className="truncate text-lg font-bold text-slate-900">{metric.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          <div className="relative">
            <label htmlFor="certificate-search" className="sr-only">
              {t.certificates.searchLabel}
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="certificate-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.certificates.searchPlaceholder}
              className={`${inputClass} py-2.5 pl-10`}
            />
          </div>

          {filteredCertificates.length === 0 ? (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title={t.certificates.noResultsTitle}
              body={t.certificates.noResultsBody}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {filteredCertificates.map((cert) => (
                <li key={cert.id}>
                  <article className={`${cardClass} relative flex h-full flex-col overflow-hidden p-5 transition-shadow hover:shadow-md`}>
                    <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r/srgb from-accent-400 via-brand-600 to-accent-400" aria-hidden="true" />

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <span className={`${chipClass} border-accent-200 bg-accent-50 font-mono font-bold text-accent-800`}>
                        {cert.certificateCode}
                      </span>
                      {cert.trainingHours !== null && cert.trainingHours > 0 && (
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                          <Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          {t.certificates.trainingHours(cert.trainingHours)}
                        </span>
                      )}
                    </div>

                    <h2 className="mt-3 text-base font-bold leading-snug text-slate-900">{cert.eventTitle}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      <time dateTime={cert.issueDate}>{t.certificates.issuedOn(formatIssueDate(cert.issueDate))}</time>
                    </p>

                    {cert.skills.length > 0 && (
                      <ul className="mt-3 flex flex-wrap gap-1.5">
                        {cert.skills.map((skill) => (
                          <li key={skill} className={`${chipClass} border-slate-200 bg-slate-50 text-slate-700`}>
                            {skill}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => setSelectedCert(cert)}
                        aria-label={t.certificates.previewAria(cert.eventTitle)}
                        className={`${secondaryButton} px-3`}
                      >
                        <Eye className="h-4 w-4 text-slate-500" aria-hidden="true" />
                        <span>{t.certificates.preview}</span>
                      </button>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={generateLinkedInCertUrl(cert)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={t.certificates.linkedInAria(cert.eventTitle)}
                          className={linkedInButton}
                        >
                          <Share2 className="h-4 w-4" aria-hidden="true" />
                          <span>{t.certificates.linkedIn}</span>
                        </a>
                        <a
                          href={`/api/certificates/${encodeURIComponent(cert.certificateCode)}/pdf`}
                          download={`${cert.certificateCode}.pdf`}
                          aria-label={t.certificates.downloadAria(cert.eventTitle)}
                          className={`${primaryButton} px-3`}
                        >
                          <Download className="h-4 w-4" aria-hidden="true" />
                          <span>{t.certificates.downloadPdf}</span>
                        </a>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {selectedCert && <CertificatePreviewModal cert={selectedCert} onClose={() => setSelectedCert(null)} />}
    </div>
  );
}

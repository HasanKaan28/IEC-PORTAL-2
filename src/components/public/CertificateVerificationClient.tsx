"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Award, Building, Calendar, CheckCircle2, Download, Loader2, Search, Share2, ShieldAlert, User } from "lucide-react";
import type { PublicCertificate } from "@/lib/events/event-types";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate } from "@/lib/i18n/format";
import { publicPagesText } from "@/lib/i18n/public/pages";

type VerifyState =
  | { kind: "idle" }
  | { kind: "verified"; cert: PublicCertificate }
  | { kind: "not-found"; code: string }
  | { kind: "error" };

function linkedInUrl(cert: PublicCertificate): string {
  const issued = new Date(cert.issueDate);
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: `${cert.eventTitle}, IUS Engineering Club`,
    organizationName: "International University of Sarajevo (IUS)",
    issueYear: String(issued.getUTCFullYear()),
    issueMonth: String(issued.getUTCMonth() + 1),
    certUrl: cert.verifyUrl,
    certId: cert.certificateCode,
  });
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

export default function CertificateVerificationClient() {
  const searchParams = useSearchParams();
  const urlCode = searchParams.get("code") ?? "";
  const { locale } = useLocale();
  const t = publicPagesText[locale].verify;

  const [code, setCode] = useState(urlCode);
  const [verifying, setVerifying] = useState(false);
  const [state, setState] = useState<VerifyState>({ kind: "idle" });

  const verify = useCallback(async (raw: string) => {
    const value = raw.trim().toUpperCase();
    if (value.length < 4) return;
    setVerifying(true);
    try {
      const response = await fetch(`/api/certificates/verify?code=${encodeURIComponent(value)}`, { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as { verified?: boolean; cert?: PublicCertificate } | null;
      if (data?.verified && data.cert) setState({ kind: "verified", cert: data.cert });
      else if (response.status >= 500) setState({ kind: "error" });
      else setState({ kind: "not-found", code: value });
    } catch {
      setState({ kind: "error" });
    }
    setVerifying(false);
  }, []);

  useEffect(() => {
    if (urlCode.trim().length >= 4) void verify(urlCode);
  }, [urlCode, verify]);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void verify(code);
  };

  const labelClass = "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3 text-center">
        <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl">{t.title}</h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-300">{t.intro}</p>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-ink-900/80 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <form onSubmit={onSubmit}>
          <label htmlFor="certificate-code" className="mb-2 block text-sm font-medium text-slate-300">
            {t.codeLabel}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="certificate-code"
              type="text"
              required
              minLength={4}
              maxLength={40}
              autoComplete="off"
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder={t.codePlaceholder}
              className="w-full flex-1 rounded-2xl border border-slate-700/80 bg-ink-950 px-4 py-3.5 font-mono text-sm uppercase tracking-wider text-white placeholder-slate-500 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/30"
            />
            <button
              type="submit"
              disabled={verifying}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-60"
            >
              {verifying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
              <span>{verifying ? t.verifying : t.submit}</span>
            </button>
          </div>
        </form>

        <div aria-live="polite">
          {state.kind === "verified" && (
            <div className="mt-8 space-y-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-ink-950 p-6">
              <div className="flex items-center gap-3 border-b border-emerald-500/20 pb-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-base font-bold text-white">{t.verified}</h2>
                  <p className="font-mono text-xs text-emerald-400">
                    {t.codePrefix}: {state.cert.certificateCode}
                  </p>
                </div>
              </div>

              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1 rounded-xl border border-slate-800 bg-ink-900/60 p-4">
                  <dt className={labelClass}>
                    <User className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.holder}
                  </dt>
                  <dd className="text-sm font-bold text-white">{state.cert.userName}</dd>
                </div>
                <div className="space-y-1 rounded-xl border border-slate-800 bg-ink-900/60 p-4">
                  <dt className={labelClass}>
                    <Award className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.event}
                  </dt>
                  <dd className="text-sm font-bold text-brand-300">{state.cert.eventTitle}</dd>
                </div>
                <div className="space-y-1 rounded-xl border border-slate-800 bg-ink-900/60 p-4">
                  <dt className={labelClass}>
                    <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.issued}
                  </dt>
                  <dd className="text-sm font-bold text-slate-200">{formatDate(state.cert.issueDate, locale)}</dd>
                  {state.cert.trainingHours !== null && (
                    <dd className="text-xs text-slate-400">{t.hours(state.cert.trainingHours)}</dd>
                  )}
                </div>
                <div className="space-y-1 rounded-xl border border-slate-800 bg-ink-900/60 p-4">
                  <dt className={labelClass}>
                    <Building className="h-3.5 w-3.5" aria-hidden="true" />
                    {t.issuer}
                  </dt>
                  <dd className="text-sm font-bold text-slate-200">IUS Engineering Club, FENS</dd>
                  <dd className="text-xs text-slate-400">International University of Sarajevo</dd>
                </div>
              </dl>

              {state.cert.skills.length > 0 && (
                <div className="space-y-2">
                  <p className={labelClass}>{t.skills}</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {state.cert.skills.map((skill) => (
                      <li key={skill} className="rounded-md border border-slate-700/80 bg-ink-900 px-2.5 py-0.5 text-xs text-slate-300">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 border-t border-emerald-500/20 pt-4">
                <a
                  href={`/api/certificates/${encodeURIComponent(state.cert.certificateCode)}/pdf`}
                  download
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-500"
                >
                  <Download className="h-4 w-4" aria-hidden="true" />
                  <span>{t.downloadPdf}</span>
                </a>
                <a
                  href={linkedInUrl(state.cert)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0a66c2] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#004182]"
                >
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  <span>{t.addLinkedIn}</span>
                </a>
              </div>
            </div>
          )}

          {state.kind === "not-found" && (
            <div className="mt-8 flex items-start gap-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-sm text-rose-200" role="alert">
              <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-rose-400" aria-hidden="true" />
              <div>
                <p className="font-bold text-white">{t.notFoundTitle}</p>
                <p className="mt-1 leading-relaxed">{t.notFoundBody(state.code)}</p>
              </div>
            </div>
          )}

          {state.kind === "error" && (
            <div className="mt-8 rounded-2xl border border-accent-500/30 bg-accent-500/10 p-6 text-sm text-accent-100" role="alert">
              {t.error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

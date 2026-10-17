"use client";

import React, { useMemo, useState } from "react";
import { Check, Copy, Mail, Monitor, Smartphone } from "lucide-react";
import { renderEmailTemplate, type EmailTemplateKey } from "@/lib/emails/email-templates";
import { useLocale } from "@/lib/i18n/locale-context";
import { adminText } from "@/lib/i18n/portal/admin";

const focusRing =
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

const TEMPLATE_KEYS: EmailTemplateKey[] = ["welcome", "application_approved", "event_reminder", "certificate_issued"];

export default function EmailTemplatesClient() {
  const { locale } = useLocale();
  const t = adminText[locale].emails;

  const [activeTemplate, setActiveTemplate] = useState<EmailTemplateKey>("welcome");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  // Neutral sample values; the template bodies are Turkish, so the sample event data is too.
  const rendered = useMemo(
    () =>
      renderEmailTemplate(activeTemplate, {
        recipientName: t.sampleName,
        recipientEmail: "uye@student.ius.edu.ba",
        actionUrl: "https://iec.ius.edu.ba/portal",
        eventTitle: "Gömülü Sistemler Atölyesi",
        eventDate: "24 Ekim 2026, 14:00",
        eventVenue: "A-Block Laboratuvar 102",
        certificateCode: "IEC-2026-0001",
        trainingHours: 6,
      }),
    [activeTemplate, t.sampleName]
  );

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(rendered.html);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    window.setTimeout(() => setCopyState("idle"), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-lg font-bold text-slate-900">{t.title}</h2>
            <span className="rounded-full border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
              {t.badge}
            </span>
          </div>
          <p className="mt-1 max-w-xl text-sm text-slate-500">{t.subtitle}</p>
          <p className="mt-1 text-xs text-slate-500">{t.languageNote}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label={t.widthLabel} className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode("desktop")}
              aria-pressed={viewMode === "desktop"}
              aria-label={t.desktop}
              title={t.desktop}
              className={`rounded-lg p-2 transition-colors ${focusRing} ${
                viewMode === "desktop" ? "bg-white text-brand-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Monitor className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("mobile")}
              aria-pressed={viewMode === "mobile"}
              aria-label={t.mobile}
              title={t.mobile}
              className={`rounded-lg p-2 transition-colors ${focusRing} ${
                viewMode === "mobile" ? "bg-white text-brand-600 shadow-xs" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            onClick={copyHtml}
            className={`inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 ${focusRing}`}
          >
            {copyState === "copied" ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
            <span aria-live="polite">
              {copyState === "copied" ? t.copied : copyState === "failed" ? t.copyFailed : t.copy}
            </span>
          </button>
        </div>
      </div>

      <div role="group" aria-label={t.templatesLabel} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TEMPLATE_KEYS.map((key) => {
          const isSelected = key === activeTemplate;
          const meta = t.templates[key];
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setActiveTemplate(key)}
              className={`rounded-2xl border bg-white p-4 text-left transition-colors ${focusRing} ${
                isSelected ? "border-brand-600 ring-2 ring-brand-500/15" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-900">{meta.label}</span>
                <Mail className={`h-4 w-4 shrink-0 ${isSelected ? "text-brand-600" : "text-slate-400"}`} aria-hidden="true" />
              </span>
              <span className="block text-xs leading-relaxed text-slate-500">{meta.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:gap-2">
        <span className="shrink-0 font-semibold text-brand-700">{t.subject}:</span>
        <span className="wrap-break-word text-slate-800">{rendered.subject}</span>
      </div>

      <div className="flex min-h-[640px] items-start justify-center overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100 p-3 sm:p-6">
        <div
          className={`overflow-hidden rounded-2xl shadow-lg transition-all duration-300 ${
            viewMode === "mobile" ? "w-full max-w-[390px]" : "w-full max-w-[650px]"
          }`}
        >
          {/* sandbox with no allowances: the preview can never run scripts or navigate the page */}
          <iframe
            srcDoc={rendered.html}
            sandbox=""
            title={`${t.previewTitle}: ${t.templates[activeTemplate].label}`}
            className="h-[620px] w-full rounded-2xl border-none bg-canvas"
          />
        </div>
      </div>
    </div>
  );
}

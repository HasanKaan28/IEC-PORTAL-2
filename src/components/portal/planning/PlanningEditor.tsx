"use client";

import React, { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { AlertCircle, CalendarRange, CheckCircle2, ExternalLink, Loader2, RotateCcw, Save } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate, formatDateTime } from "@/lib/i18n/format";
import { planningText } from "@/lib/i18n/portal/planning";
import { saveMonthlyPlanAction } from "@/lib/planning/plan-actions";
import {
  isPlanDate,
  PLAN_STATUSES,
  resolvePlanWeeks,
  type MonthlyPlan,
  type PlanStatus,
  type PlanStatusSetting,
  type PlanWeek,
} from "@/lib/planning/plan-types";

const STATUS_STYLES: Record<PlanStatus, string> = {
  done: "bg-emerald-100 text-emerald-800 border-emerald-200",
  active: "bg-accent-100 text-accent-800 border-accent-200",
  planned: "bg-slate-100 text-slate-600 border-slate-200",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

type Feedback = { kind: "success" | "error"; text: string } | null;

export default function PlanningEditor({ initialPlan, today }: { initialPlan: MonthlyPlan; today: string }) {
  const { locale } = useLocale();
  const t = planningText[locale];
  const [monthStart, setMonthStart] = useState(initialPlan.monthStart);
  const [weeks, setWeeks] = useState<PlanWeek[]>(initialPlan.weeks);
  const [saved, setSaved] = useState({ monthStart: initialPlan.monthStart, weeks: initialPlan.weeks });
  const [updatedAt, setUpdatedAt] = useState(initialPlan.updatedAt);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [pending, startTransition] = useTransition();

  const validStart = isPlanDate(monthStart);
  const resolved = useMemo(
    () => (validStart ? resolvePlanWeeks({ monthStart, weeks }, today) : null),
    [monthStart, weeks, today, validStart]
  );
  const dirty = monthStart !== saved.monthStart || JSON.stringify(weeks) !== JSON.stringify(saved.weeks);
  const statusLabel: Record<PlanStatus, string> = {
    done: t.page.statusOptions.done,
    active: t.page.statusOptions.active,
    planned: t.page.statusOptions.planned,
  };

  const updateWeek = (week: number, patch: Partial<PlanWeek>) => {
    setFeedback(null);
    setWeeks((current) => current.map((w) => (w.week === week ? { ...w, ...patch } : w)));
  };

  const shortDate = (day: string) => formatDate(day, locale, { day: "numeric", month: "short", timeZone: "UTC" });

  const save = () => {
    setFeedback(null);
    startTransition(async () => {
      const result = await saveMonthlyPlanAction({
        monthStart,
        weeks: weeks.map((w) => ({
          week: w.week,
          titleTr: w.titleTr,
          titleEn: w.titleEn ?? "",
          bodyTr: w.bodyTr ?? "",
          bodyEn: w.bodyEn ?? "",
          status: w.status,
        })),
      });
      if (result.success) {
        setSaved({ monthStart, weeks });
        setUpdatedAt(result.data?.updatedAt ?? new Date().toISOString());
        setFeedback({ kind: "success", text: result.message ?? t.page.saved });
      } else {
        setFeedback({ kind: "error", text: result.error });
      }
    });
  };

  const reset = () => {
    setMonthStart(saved.monthStart);
    setWeeks(saved.weeks);
    setFeedback(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-24">
      <header className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-gradient-to-br from-brand-100 via-accent-50 to-emerald-50 p-6 shadow-soft sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700">
            <CalendarRange className="h-4 w-4" aria-hidden="true" />
            {t.page.metaTitle}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-slate-900 sm:text-3xl">{t.page.title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{t.page.intro}</p>
          {updatedAt && <p className="mt-2 text-xs text-slate-500">{t.page.lastUpdated(formatDateTime(updatedAt, locale))}</p>}
        </div>
        <Link
          href="/hakkimizda#plan-title"
          target="_blank"
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:self-auto"
        >
          {t.page.viewOnSite}
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </Link>
      </header>

      {initialPlan.source === "default" && (
        <div className="flex items-start gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-4 text-sm text-accent-900" role="note">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{t.page.notSetUp}</p>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <label htmlFor="plan-start" className="block text-sm font-semibold text-slate-800">
          {t.page.startLabel}
        </label>
        <input
          id="plan-start"
          type="date"
          value={monthStart}
          onChange={(event) => {
            setFeedback(null);
            setMonthStart(event.target.value);
          }}
          aria-invalid={!validStart}
          aria-describedby="plan-start-hint"
          className={`${inputClass} mt-2 max-w-xs`}
        />
        <p id="plan-start-hint" className={`mt-2 text-xs ${validStart ? "text-slate-500" : "font-medium text-rose-600"}`}>
          {validStart ? t.page.startHint : t.errors.invalidDate}
        </p>
      </section>

      <ol className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {weeks.map((week) => {
          const info = resolved?.find((w) => w.week === week.week);
          const id = `plan-week-${week.week}`;
          return (
            <li key={week.week} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-semibold text-slate-900">{t.page.weekLabel(week.week)}</h2>
                {info && (
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {shortDate(info.startsOn)} - {shortDate(info.endsOn)}
                  </span>
                )}
              </div>

              <div>
                <label htmlFor={`${id}-title-tr`} className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t.page.titleTr}
                </label>
                <input
                  id={`${id}-title-tr`}
                  value={week.titleTr}
                  maxLength={120}
                  required
                  onChange={(event) => updateWeek(week.week, { titleTr: event.target.value })}
                  aria-invalid={!week.titleTr.trim()}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor={`${id}-body-tr`} className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t.page.bodyTr}
                </label>
                <textarea
                  id={`${id}-body-tr`}
                  value={week.bodyTr ?? ""}
                  maxLength={600}
                  rows={3}
                  onChange={(event) => updateWeek(week.week, { bodyTr: event.target.value })}
                  className={`${inputClass} resize-y`}
                />
              </div>

              <details className="group rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 open:bg-white">
                <summary className="cursor-pointer text-sm font-medium text-slate-700 marker:text-slate-400">{t.page.englishSection}</summary>
                <div className="mt-3 space-y-3">
                  <div>
                    <label htmlFor={`${id}-title-en`} className="mb-1.5 block text-sm font-medium text-slate-700">
                      {t.page.titleEn}
                    </label>
                    <input
                      id={`${id}-title-en`}
                      value={week.titleEn ?? ""}
                      maxLength={120}
                      onChange={(event) => updateWeek(week.week, { titleEn: event.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor={`${id}-body-en`} className="mb-1.5 block text-sm font-medium text-slate-700">
                      {t.page.bodyEn}
                    </label>
                    <textarea
                      id={`${id}-body-en`}
                      value={week.bodyEn ?? ""}
                      maxLength={600}
                      rows={3}
                      onChange={(event) => updateWeek(week.week, { bodyEn: event.target.value })}
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                  <p className="text-xs text-slate-500">{t.page.englishHint}</p>
                </div>
              </details>

              <div className="mt-auto flex flex-wrap items-end gap-3">
                <div className="min-w-[12rem] flex-1">
                  <label htmlFor={`${id}-status`} className="mb-1.5 block text-sm font-medium text-slate-700">
                    {t.page.statusLabel}
                  </label>
                  <select
                    id={`${id}-status`}
                    value={week.status}
                    onChange={(event) => updateWeek(week.week, { status: event.target.value as PlanStatusSetting })}
                    className={inputClass}
                  >
                    {PLAN_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {t.page.statusOptions[status]}
                      </option>
                    ))}
                  </select>
                </div>
                {info && (
                  <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[info.effectiveStatus]}`}>
                    {week.status === "auto" ? t.page.autoNow(statusLabel[info.effectiveStatus]) : statusLabel[info.effectiveStatus]}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className="sticky bottom-4 z-10 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className="min-h-[1.25rem] text-sm">
          {feedback?.kind === "success" && (
            <span className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {feedback.text}
            </span>
          )}
          {feedback?.kind === "error" && (
            <span className="flex items-center gap-2 text-rose-700" role="alert">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              {feedback.text}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={!dirty || pending}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t.page.reset}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!dirty || pending || !validStart || weeks.some((w) => !w.titleTr.trim())}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Save className="h-4 w-4" aria-hidden="true" />}
            {pending ? t.page.saving : t.page.save}
          </button>
        </div>
      </div>
    </div>
  );
}

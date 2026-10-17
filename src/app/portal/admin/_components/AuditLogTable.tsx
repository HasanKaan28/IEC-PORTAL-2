"use client";

import React, { useMemo, useState } from "react";
import { ScrollText, Search } from "lucide-react";
import type { AuditLogItem } from "@/lib/admin/admin-actions";
import { auditActionLabel, auditDetail, auditTargetLabel } from "@/lib/admin/audit-format";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDateTime } from "@/lib/i18n/format";
import { adminText } from "@/lib/i18n/portal/admin";
import { EmptyState, Notice, PageHeader, focusRing } from "./AdminUi";
import { MemberName } from "@/components/portal/MemberCard";

type FilterKey = "all" | "roles" | "blog" | "other";

function matchesFilter(action: string, filter: FilterKey): boolean {
  if (filter === "all") return true;
  if (filter === "roles") return action.startsWith("role.");
  if (filter === "blog") return action.startsWith("blog.");
  return !action.startsWith("role.") && !action.startsWith("blog.");
}

function actionTone(action: string): string {
  if (action.endsWith(".delete") || action.endsWith(".remove") || action.endsWith(".rejected")) {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  if (action.endsWith(".flag")) return "bg-accent-50 text-accent-800 border-accent-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

export default function AuditLogTable({ logs, loadError }: { logs: AuditLogItem[]; loadError: string | null }) {
  const { locale } = useLocale();
  const text = adminText[locale];
  const t = text.audit;

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const rows = useMemo(
    () =>
      logs.map((log) => ({
        log,
        actor: log.actorName ?? t.systemActor,
        actionLabel: auditActionLabel(log.action, locale),
        target: auditTargetLabel(log.targetType, locale),
        detail: auditDetail(log, locale),
      })),
    [logs, locale, t.systemActor]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase(locale);
    return rows.filter((row) => {
      if (!matchesFilter(row.log.action, filter)) return false;
      if (!q) return true;
      return [row.actor, row.actionLabel, row.log.action, row.target, row.detail].some((value) =>
        value.toLocaleLowerCase(locale).includes(q)
      );
    });
  }, [rows, search, filter, locale]);

  const filters: FilterKey[] = ["all", "roles", "blog", "other"];

  return (
    <div className="space-y-6">
      <PageHeader title={t.title} subtitle={t.subtitle} />

      {loadError && <Notice tone="error">{loadError}</Notice>}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div role="group" aria-label={t.filterLabel} className="flex flex-wrap gap-2">
          {filters.map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${focusRing} ${
                filter === key
                  ? "bg-brand-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.filters[key]}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-72">
          <label htmlFor="audit-search" className="sr-only">
            {t.searchLabel}
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          <input
            id="audit-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {logs.length === 0 ? (
          <EmptyState icon={ScrollText} message={t.empty} />
        ) : filtered.length === 0 ? (
          <EmptyState icon={Search} message={t.noResults} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500">
                  <th scope="col" className="px-4 py-3">{t.colTime}</th>
                  <th scope="col" className="px-4 py-3">{t.colActor}</th>
                  <th scope="col" className="px-4 py-3">{t.colAction}</th>
                  <th scope="col" className="px-4 py-3">{t.colTarget}</th>
                  <th scope="col" className="px-4 py-3">{t.colDetails}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(({ log, actor, actionLabel, target, detail }) => (
                  <tr key={log.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                      <time dateTime={log.createdAt} suppressHydrationWarning>
                        {formatDateTime(log.createdAt, locale)}
                      </time>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      <MemberName userId={log.actorId} name={actor} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium ${actionTone(log.action)}`}>
                        {actionLabel}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">{target}</td>
                    <td className="max-w-xs px-4 py-3 text-slate-700">
                      <span className="line-clamp-2 break-words" title={detail}>
                        {detail}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import React from "react";
import type { LucideIcon } from "lucide-react";

/** Small presentational pieces shared by admin pages (usable from server and client components). */

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-0.5 max-w-2xl text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function Notice({
  tone,
  children,
  onDismiss,
  dismissLabel,
}: {
  tone: "success" | "error" | "info";
  children: React.ReactNode;
  onDismiss?: () => void;
  dismissLabel?: string;
}) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-slate-200 bg-slate-50 text-slate-700",
  }[tone];
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${styles}`}
    >
      <div className="min-w-0">{children}</div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={dismissLabel}
          className={`shrink-0 rounded-md px-1.5 text-current opacity-70 hover:opacity-100 ${focusRing}`}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      ) : null}
    </div>
  );
}

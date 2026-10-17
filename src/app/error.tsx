"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { publicPagesText } from "@/lib/i18n/public/pages";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { locale } = useLocale();
  const t = publicPagesText[locale].error;

  useEffect(() => {
    console.error("[error boundary]", error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-6 text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-palette-wash"
      />
      <main className="relative z-10 w-full max-w-lg space-y-6 text-center">
        <p className="inline-flex items-center gap-2 rounded-full border border-accent-500/20 bg-accent-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-700">
          <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          {t.badge}
        </p>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-slate-800">{t.title}</h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500">{t.body}</p>
          {error?.digest && (
            <p className="inline-block rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-500">
              {t.code}: {error.digest}
            </p>
          )}
        </div>
        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700 sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            {t.retry}
          </button>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:w-auto"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            {t.home}
          </Link>
        </div>
      </main>
    </div>
  );
}

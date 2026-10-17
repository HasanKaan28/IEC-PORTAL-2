"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/locale-context";

export default function JoinCtaSection() {
  const { t } = useLocale();

  return (
    <section className="px-4 sm:px-6 pb-20 sm:pb-24 relative z-10">
      <div className="max-w-7xl mx-auto rounded-3xl border border-brand-500/30 bg-brand-50 p-8 sm:p-12">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-brand-700">{t.joinCta.badge}</p>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900 font-display tracking-tight">{t.joinCta.title}</h2>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">{t.joinCta.description}</p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <Link
              href="/basvuru"
              className="inline-flex justify-center px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors"
            >
              {t.common.apply}
            </Link>
            <Link
              href="/portal"
              className="inline-flex justify-center px-6 py-3 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-sm transition-colors"
            >
              {t.common.portalButton}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

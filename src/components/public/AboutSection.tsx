"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Compass, Code2, Users2, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";

const PILLAR_ICONS = [Compass, Code2, Users2, ShieldCheck];

export default function AboutSection() {
  const { t } = useLocale();

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 relative z-10 border-t border-brand-100/80">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-5 space-y-5">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-display tracking-tight leading-tight">
            {t.about.titleStart} <span className="text-brand-600">{t.about.titleHighlight}</span>
          </h2>
          <p className="text-slate-600 text-base leading-relaxed max-w-[60ch]">{t.about.paragraph1}</p>
          <p className="text-slate-600 text-base leading-relaxed max-w-[60ch]">{t.about.paragraph2}</p>
          <Link
            href="/hakkimizda"
            className="inline-flex items-center gap-2 pt-1 text-sm font-semibold text-brand-700 hover:text-slate-900 transition-colors"
          >
            <span>{t.about.link}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
          {t.about.pillars.map((pillar, index) => {
            const Icon = PILLAR_ICONS[index] ?? Compass;
            return (
              <li key={pillar.title} className="border-t border-slate-200 py-7">
                <Icon className="w-6 h-6 text-brand-600" aria-hidden="true" />
                <h3 className="mt-4 font-bold text-slate-900 text-lg font-display">{pillar.title}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{pillar.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

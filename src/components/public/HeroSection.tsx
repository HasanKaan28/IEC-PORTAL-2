"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Cpu, Users, Terminal } from "lucide-react";
import HeroBackground from "./HeroBackground";
import { useLocale } from "@/lib/i18n/locale-context";
import ClubLogo from "@/components/shared/ClubLogo";
import Tilt from "./Tilt";

export default function HeroSection() {
  const { t } = useLocale();

  const metrics = [
    { label: t.metrics.projectsLabel, value: t.metrics.projectsValue, note: t.metrics.projectsNote, Icon: Cpu, iconClass: "text-accent-700" },
    { label: t.metrics.membersLabel, value: t.metrics.membersValue, note: t.metrics.membersNote, Icon: Users, iconClass: "text-emerald-600" },
    { label: t.metrics.advisorLabel, value: t.metrics.advisorValue, note: t.metrics.advisorNote, Icon: Sparkles, iconClass: "text-brand-600" },
  ];

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
      <HeroBackground />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        <ClubLogo size={104} priority className="logo-spin mb-8" />

        <h1 className="text-4xl sm:text-6xl/none md:text-7xl/none font-extrabold tracking-tight font-display text-slate-900 max-w-4xl leading-[1.1]">
          {t.hero.titleStart}{" "}
          <span className="bg-linear-to-r/srgb from-brand-700 via-brand-500 to-accent-600 bg-clip-text text-transparent">
            {t.hero.titleHighlight}
          </span>
          {t.hero.titleEnd && <> {t.hero.titleEnd}</>}
        </h1>

        <p className="mt-6 text-base sm:text-lg/7 md:text-xl/7 text-slate-600 max-w-2xl leading-relaxed">
          {t.hero.description}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="#projeler"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm transition-colors shadow-glow active:scale-[0.98]"
          >
            <span>{t.hero.primaryCta}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          <Link
            href="/basvuru"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl border border-slate-200 bg-white hover:border-brand-300 hover:text-brand-700 text-slate-800 font-semibold text-sm transition-colors shadow-soft active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-accent-700" aria-hidden="true" />
            <span>{t.common.apply}</span>
          </Link>

          <Link
            href="/portal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors"
          >
            <Terminal className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <span>{t.hero.portalLink}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <dl aria-label={t.metrics.label} className="mt-16 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
          {metrics.map(({ label, value, note, Icon, iconClass }) => (
            <Tilt key={label} className="glass-panel p-4 rounded-xl">
              <dt className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500">{label}</span>
                <Icon className={`w-4 h-4 ${iconClass}`} aria-hidden="true" />
              </dt>
              <dd>
                <span className="block text-2xl font-bold font-display text-slate-900">{value}</span>
                <span className="block text-xs text-slate-500 mt-0.5">{note}</span>
              </dd>
            </Tilt>
          ))}
        </dl>
      </div>
    </section>
  );
}

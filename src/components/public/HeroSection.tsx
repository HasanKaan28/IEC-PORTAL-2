"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Cpu, Users, Terminal } from "lucide-react";
import HeroBackground from "./HeroBackground";
import { useLocale } from "@/lib/i18n/locale-context";

export default function HeroSection() {
  const { t } = useLocale();

  const metrics = [
    { label: t.metrics.projectsLabel, value: t.metrics.projectsValue, note: t.metrics.projectsNote, Icon: Cpu, iconClass: "text-cyan-400" },
    { label: t.metrics.foundersLabel, value: t.metrics.foundersValue, note: t.metrics.foundersNote, Icon: Users, iconClass: "text-emerald-400" },
    { label: t.metrics.advisorLabel, value: t.metrics.advisorValue, note: t.metrics.advisorNote, Icon: Sparkles, iconClass: "text-purple-400" },
  ];

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-28 pb-20 px-4 sm:px-6 overflow-hidden">
      <HeroBackground />

      <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-xs font-mono text-cyan-300 mb-6 backdrop-blur-md shadow-glow-cyan animate-pulse-subtle">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          <span>{t.hero.eyebrow}</span>
          <span className="w-1 h-1 rounded-full bg-cyan-400" aria-hidden="true" />
          <span className="text-slate-400">2026-2027</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight font-display text-white max-w-4xl leading-[1.1]">
          {t.hero.titleStart}{" "}
          <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
            {t.hero.titleHighlight}
          </span>
          {t.hero.titleEnd && <> {t.hero.titleEnd}</>}
        </h1>

        <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
          {t.hero.description}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 w-full sm:w-auto">
          <Link
            href="#projeler"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors shadow-glow active:scale-[0.98]"
          >
            <span>{t.hero.primaryCta}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>

          <Link
            href="/basvuru"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl border border-slate-700 bg-slate-900/70 hover:bg-slate-800/80 hover:border-slate-600 text-slate-200 font-semibold text-sm transition-colors backdrop-blur-md"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>{t.common.apply}</span>
          </Link>

          <Link
            href="/portal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-slate-300 hover:text-white font-medium text-sm transition-colors"
          >
            <Terminal className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span>{t.hero.portalLink}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <dl aria-label={t.metrics.label} className="mt-16 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
          {metrics.map(({ label, value, note, Icon, iconClass }) => (
            <div key={label} className="glass-panel p-4 rounded-xl border border-slate-800/80">
              <dt className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400">{label}</span>
                <Icon className={`w-4 h-4 ${iconClass}`} aria-hidden="true" />
              </dt>
              <dd>
                <span className="block text-2xl font-bold font-display text-white">{value}</span>
                <span className="block text-xs text-slate-400 mt-0.5">{note}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

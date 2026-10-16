"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroBackground from "./HeroBackground";
import { useLocale } from "@/lib/i18n/locale-context";

export default function HeroSection() {
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden px-4 sm:px-6 pt-12 pb-16 lg:pt-20 lg:pb-24 lg:min-h-[calc(100dvh-4rem)] flex items-center">
      <HeroBackground />

      <div className="relative z-10 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <div className="lg:col-span-6 xl:col-span-6">
          <p className="text-sm font-medium text-blue-300 mb-5">{t.hero.eyebrow}</p>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight font-display text-white leading-[1.08]">
            {t.hero.titleStart} <span className="text-blue-400">{t.hero.titleHighlight}</span>
            {t.hero.titleEnd && <> {t.hero.titleEnd}</>}
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-[56ch] leading-relaxed">
            {t.hero.description}
          </p>

          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <Link
              href="#projeler"
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-colors active:scale-[0.98]"
            >
              <span>{t.hero.primaryCta}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              href="/basvuru"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-slate-700 bg-slate-900/70 hover:bg-slate-800 hover:border-slate-600 text-slate-100 font-semibold text-sm transition-colors"
            >
              {t.common.apply}
            </Link>
          </div>
        </div>

        <figure className="lg:col-span-6">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
            <Image
              src="/assets/projects/hackathon_event_hero.jpg"
              alt={t.hero.imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <figcaption className="mt-3 text-xs text-slate-400">{t.hero.imageCaption}</figcaption>
        </figure>
      </div>
    </section>
  );
}

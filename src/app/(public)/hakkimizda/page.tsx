import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { ArrowRight, GraduationCap } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { getServerLocale } from "@/lib/i18n/server";
import { publicPagesText } from "@/lib/i18n/public/pages";
import { BOARD_PHOTOS } from "@/lib/data/board-photos";
import Tilt from "@/components/public/Tilt";
import DimensionLine from "@/components/public/blueprint/DimensionLine";
import { formatDate } from "@/lib/i18n/format";
import { planningText } from "@/lib/i18n/portal/planning";
import { getMonthlyPlan } from "@/lib/planning/plan-queries";
import { resolvePlanWeeks, todayInSarajevo, weekText } from "@/lib/planning/plan-types";

export async function generateMetadata(): Promise<Metadata> {
  const t = publicPagesText[await getServerLocale()].about;
  return { title: t.metaTitle, description: t.metaDescription };
}

const STATUS_STYLES = {
  done: "bg-emerald-500/15 text-emerald-700 border border-emerald-500/30",
  active: "bg-accent-500/15 text-accent-800 border border-accent-500/40",
  planned: "bg-slate-100 text-slate-500 border border-slate-300",
};

function initials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toLocaleUpperCase("tr-TR");
}

export default async function AboutPage() {
  const locale = await getServerLocale();
  const t = publicPagesText[locale].about;
  const plan = planningText[locale].about;
  const statusLabel = { done: plan.statusDone, active: plan.statusActive, planned: plan.statusPlanned };

  // The four-week plan is edited in the portal (Management > Planning); statuses follow the calendar.
  const monthlyPlan = await getMonthlyPlan();
  const planWeeks = resolvePlanWeeks(monthlyPlan, todayInSarajevo());
  const monthLabel = formatDate(monthlyPlan.monthStart, locale, { month: "long", year: "numeric", timeZone: "UTC" });
  const shortDate = (day: string) => formatDate(day, locale, { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-20">
          <header className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{t.title}</h1>
            <DimensionLine className="mx-auto mt-5 w-40" />
            <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base/6">{t.intro}</p>
          </header>

          <section className="reveal-3d glass-panel drafting-frame flex flex-col items-center gap-8 rounded-3xl bg-linear-to-r/srgb from-brand-100/80 via-accent-50/70 to-emerald-100/70 p-8 md:flex-row">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br/srgb from-brand-500 to-brand-700 text-white shadow-glow">
              <GraduationCap className="h-10 w-10" aria-hidden="true" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-accent-700">{t.advisorEyebrow}</p>
              <h2 className="font-display text-2xl font-bold text-slate-900">Prof. Dr. Leila Miller</h2>
              <p className="mt-1 text-sm text-slate-600">Faculty of Engineering and Natural Sciences (FENS)</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">{t.advisorNote}</p>
            </div>
          </section>

          <section aria-labelledby="board-title">
            <h2 id="board-title" className="text-center font-display text-2xl font-bold text-slate-900 sm:text-3xl">
              {t.boardTitle}
            </h2>
            <DimensionLine className="mx-auto mb-10 mt-4 w-32" />
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {t.board.map((member) => {
                const photo = BOARD_PHOTOS[member.name] ?? null;
                return (
                  <li key={member.name} className="reveal-3d">
                    <Tilt className="glass-panel group flex h-full flex-col overflow-hidden rounded-2xl transition-shadow duration-300 hover:shadow-glow">
                    <div className="relative aspect-4/5 w-full overflow-hidden bg-linear-to-br/srgb from-brand-200 via-accent-100 to-emerald-200">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={`${member.name}, ${member.role}`}
                          fill
                          sizes="(min-width: 1280px) 220px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center font-display text-5xl font-bold tracking-tight text-brand-800/70"
                        >
                          {initials(member.name)}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-base font-bold text-slate-900">{member.name}</h3>
                      <p className="mt-0.5 text-sm font-semibold text-brand-700">{member.role}</p>
                      <p className="mt-1 text-xs text-slate-500">{member.dept}</p>
                      <p className="mt-3 text-sm leading-relaxed text-slate-600">{member.focus}</p>
                    </div>
                    </Tilt>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="plan-title" className="scroll-mt-24" id="plan">
            <div className="mb-10 text-center">
              <h2 id="plan-title" className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
                {plan.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{plan.subtitle(monthLabel)}</p>
            </div>
            <ol className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {planWeeks.map((week) => {
                const text = weekText(week, locale);
                const isCurrent = week.effectiveStatus === "active";
                return (
                  <li
                    key={week.week}
                    className={`reveal-3d glass-panel flex flex-col rounded-2xl p-6 ${isCurrent ? "ring-2 ring-accent-400/70" : ""}`}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold text-accent-700">{plan.week(week.week)}</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[week.effectiveStatus]}`}>
                        {statusLabel[week.effectiveStatus]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {shortDate(week.startsOn)} - {shortDate(week.endsOn)}
                    </p>
                    <h3 className="mt-1 text-base font-bold text-slate-900">{text.title}</h3>
                    {text.body && <p className="mt-2 text-sm leading-relaxed text-slate-500">{text.body}</p>}
                  </li>
                );
              })}
            </ol>
          </section>

          <section className="border-t border-slate-200 pt-10 text-center">
            <h2 className="text-xl font-bold text-slate-900">{t.ctaTitle}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t.ctaBody}</p>
            <Link
              href="/basvuru"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-400"
            >
              <span>{t.ctaButton}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

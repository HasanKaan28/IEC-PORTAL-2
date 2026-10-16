"use client";

import React from "react";
import { PROJECTS_DATA } from "@/lib/data/projects";
import { useLocale } from "@/lib/i18n/locale-context";

const FOUNDING_MEMBER_COUNT = 12;
const CORE_PILLAR_COUNT = 4;
const FACULTY_ADVISOR = "Prof. Dr. Leila Miller";

export default function ClubMetrics() {
  const { t } = useLocale();

  const metrics = [
    { value: String(PROJECTS_DATA.length), label: t.metrics.projects },
    { value: String(FOUNDING_MEMBER_COUNT), label: t.metrics.founders },
    { value: String(CORE_PILLAR_COUNT), label: t.metrics.pillars },
    { value: FACULTY_ADVISOR, label: t.metrics.advisor, isText: true },
  ];

  return (
    <section aria-label={t.metrics.label} className="relative z-10 border-y border-slate-800/80 bg-[#0a0d14] px-4 sm:px-6">
      <dl className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-slate-800/80 lg:divide-x">
        {metrics.map((metric) => (
          <div key={metric.label} className="py-7 lg:px-8 first:lg:pl-0">
            <dt className="text-sm text-slate-400">{metric.label}</dt>
            <dd
              className={`mt-1 font-display font-bold text-white tabular-nums ${
                metric.isText ? "text-lg sm:text-xl" : "text-3xl sm:text-4xl"
              }`}
            >
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

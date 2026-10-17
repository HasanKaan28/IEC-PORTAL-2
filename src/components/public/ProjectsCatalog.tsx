"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Search, SearchX, Sparkles } from "lucide-react";
import ProjectGallery from "@/components/public/ProjectGallery";
import { PROJECTS_DATA, type ProjectItem } from "@/lib/data/projects";
import { useLocale } from "@/lib/i18n/locale-context";
import { publicPagesText } from "@/lib/i18n/public/pages";

type FilterId = "all" | "hardware" | "software" | "events" | "ai";

const FILTERS: FilterId[] = ["all", "hardware", "software", "events", "ai"];

/** Category matching uses the English label, which is stable across both languages. */
function matchesFilter(project: ProjectItem, filter: FilterId): boolean {
  const category = project.category.en;
  switch (filter) {
    case "hardware":
      return category.includes("Hardware");
    case "software":
      return category.includes("Software");
    case "events":
      return category.includes("Hackathon") || category.includes("Summit");
    case "ai":
      return category.includes("AI");
    default:
      return true;
  }
}

export default function ProjectsCatalog() {
  const { locale } = useLocale();
  const t = publicPagesText[locale].projects;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterId>("all");

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-GB");
    return PROJECTS_DATA.filter((project) => {
      if (!matchesFilter(project, filter)) return false;
      if (!needle) return true;
      const haystack = [
        project.title.tr,
        project.title.en,
        project.tagline.tr,
        project.tagline.en,
        project.problem.tr,
        project.problem.en,
        ...project.specs.flatMap((spec) => [spec.value.tr, spec.value.en]),
      ]
        .join(" ")
        .toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-GB");
      return haystack.includes(needle);
    });
  }, [query, filter, locale]);

  return (
    <div className="mx-auto max-w-7xl">
      <header className="mx-auto mb-12 max-w-3xl text-center">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{t.title}</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base/6">{t.intro}</p>
      </header>

      <div className="glass-panel mb-10 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4 lg:flex-row">
        <div className="relative w-full lg:max-w-md">
          <label htmlFor="project-search" className="sr-only">
            {t.searchLabel}
          </label>
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            id="project-search"
            type="search"
            placeholder={t.searchPlaceholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/30"
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto" role="group" aria-label={t.filtersLabel}>
          {FILTERS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              aria-pressed={filter === id}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-400/60 ${
                filter === id
                  ? "bg-brand-600 text-white"
                  : "border border-slate-200 bg-white/70 text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.filters[id]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-panel flex flex-col items-center rounded-3xl border border-slate-200 px-6 py-16 text-center">
          <SearchX className="h-10 w-10 text-slate-500" aria-hidden="true" />
          <p className="mt-4 text-sm text-slate-600">{t.empty}</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="mt-4 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-brand-500 hover:text-slate-900"
          >
            {t.clear}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map((project) => (
            <article
              key={project.id}
              className="reveal-3d glass-panel grid grid-cols-1 items-center gap-8 rounded-3xl border border-slate-200 p-6 transition-colors hover:border-slate-300 sm:p-8 lg:grid-cols-12"
            >
              <div className="relative overflow-hidden rounded-2xl border border-slate-200 lg:col-span-5">
                <ProjectGallery
                  images={project.gallery}
                  alt={project.title[locale]}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="h-64 sm:h-72"
                />
                {/* iOS Liquid Glass chips (see .liquid-glass in globals.css). */}
                <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
                  <span className="liquid-glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold">
                    <span
                      className="h-2 w-2 rounded-full ring-1 ring-white/70"
                      style={{ backgroundColor: project.accentColor }}
                      aria-hidden="true"
                    />
                    {project.badge[locale]}
                  </span>
                  {project.isFlagship && (
                    <span className="liquid-glass liquid-glass-honey flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold">
                      <Sparkles className="h-3 w-3" aria-hidden="true" />
                      {t.featured}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4 lg:col-span-7">
                <p className="text-sm font-medium text-accent-700">{project.category[locale]}</p>
                <h2 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{project.title[locale]}</h2>
                <p className="text-sm font-medium leading-relaxed text-slate-600">{project.tagline[locale]}</p>

                <div className="grid grid-cols-1 gap-3 pt-1 text-sm sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-rose-700">{t.problem}</h3>
                    <p className="leading-relaxed text-slate-500">{project.problem[locale]}</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">{t.solution}</h3>
                    <p className="leading-relaxed text-slate-500">{project.solution[locale]}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-slate-500">{t.stack}:</span>
                    {project.specs.map((spec) => (
                      <span key={spec.label.en} className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {spec.value[locale]}
                      </span>
                    ))}
                  </div>
                  <Link
                    href="/basvuru"
                    className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-400"
                  >
                    {t.join}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

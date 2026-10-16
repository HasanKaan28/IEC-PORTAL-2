"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PROJECTS_DATA, type ProjectItem } from "@/lib/data/projects";
import { useLocale } from "@/lib/i18n/locale-context";
import type { Dictionary } from "@/lib/i18n/translations";
import ProjectDetailDialog from "./ProjectDetailDialog";
import ProjectGallery from "./ProjectGallery";

type CategoryId = "all" | "hardware" | "software" | "hackathon" | "ai";

// Category matching uses the Turkish source labels, which are the canonical values in PROJECTS_DATA.
const CATEGORY_MATCHERS: Record<CategoryId, (project: ProjectItem) => boolean> = {
  all: () => true,
  hardware: (project) => project.category.tr.includes("Donanım"),
  software: (project) => project.category.tr.includes("Yazılım"),
  hackathon: (project) => project.category.tr.includes("Hackathon") || project.category.tr.includes("Zirve"),
  ai: (project) => project.category.tr.includes("Zekâ"),
};

function categoryLabels(t: Dictionary): Array<{ id: CategoryId; label: string }> {
  return [
    { id: "all", label: t.projects.categoryAll },
    { id: "hardware", label: t.projects.categoryHardware },
    { id: "software", label: t.projects.categorySoftware },
    { id: "hackathon", label: t.projects.categoryHackathon },
    { id: "ai", label: t.projects.categoryAi },
  ];
}

export default function ProjectsShowcase() {
  const { locale, t } = useLocale();
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const filteredProjects = PROJECTS_DATA.filter(CATEGORY_MATCHERS[activeCategory]);
  const featuresLeadProject = activeCategory === "all" && filteredProjects.length >= 3;

  return (
    <section id="projeler" className="scroll-mt-20 py-20 sm:py-24 px-4 sm:px-6 relative z-10 bg-[#070a11]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-display tracking-tight">{t.projects.title}</h2>
          <p className="text-slate-300 text-base mt-3 max-w-[60ch]">{t.projects.description}</p>
        </div>

        <div role="group" aria-label={t.projects.filterLabel} className="flex flex-wrap items-center gap-2 mb-8">
          {categoryLabels(t).map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                aria-pressed={isActive}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  isActive
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:border-slate-600"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {filteredProjects.length === 0 ? (
          <p className="py-16 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            {t.projects.empty}
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => {
              const isLead = featuresLeadProject && index === 0;
              return (
                <li
                  key={project.id}
                  className={`group flex flex-col rounded-2xl overflow-hidden border border-slate-800 bg-[#0a0d14] hover:border-slate-600 transition-colors ${
                    isLead ? "md:col-span-2" : ""
                  }`}
                >
                  <ProjectGallery
                    images={project.gallery}
                    alt={project.title[locale]}
                    sizes={isLead ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                    className={isLead ? "aspect-[16/9] lg:aspect-[21/9]" : "aspect-[16/9]"}
                  />

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <p className="text-xs text-slate-400">
                      {project.category[locale]}
                      {project.isFlagship && <span className="text-blue-300"> · {t.projects.flagship}</span>}
                    </p>
                    <h3 className={`mt-1.5 font-bold text-white font-display ${isLead ? "text-xl sm:text-2xl" : "text-lg"}`}>
                      {project.title[locale]}
                    </h3>
                    <p className="text-sm text-slate-300 mt-2 leading-relaxed line-clamp-2">{project.tagline[locale]}</p>

                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {project.specs.map((spec) => (
                        <li
                          key={spec.label.tr}
                          className="text-xs px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                        >
                          {spec.value[locale]}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-5 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedProject(project)}
                        className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 hover:text-white transition-colors"
                        aria-haspopup="dialog"
                      >
                        <span>{t.projects.viewDetails}</span>
                        <span className="sr-only">: {project.title[locale]}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-12">
          <Link
            href="/projeler"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-100 text-sm font-semibold transition-colors"
          >
            <span>{t.projects.viewAll}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>

      {selectedProject && (
        <ProjectDetailDialog project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </section>
  );
}

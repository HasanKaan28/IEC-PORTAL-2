"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers, Sparkles, ExternalLink, X, CheckCircle2 } from "lucide-react";
import { PROJECTS_DATA, ProjectItem } from "@/lib/data/projects";

export default function ProjectsShowcase() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);

  const categories = [
    { id: "all", label: "Tüm İnovasyonlar" },
    { id: "hardware", label: "Donanım & IoT" },
    { id: "software", label: "Yazılım & Web" },
    { id: "hackathon", label: "Hackathon & Etkinlik" },
    { id: "ai", label: "Yapay Zekâ" },
  ];

  const filteredProjects = PROJECTS_DATA.filter((project) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "hardware") return project.category.tr.includes("Donanım");
    if (activeCategory === "software") return project.category.tr.includes("Yazılım");
    if (activeCategory === "hackathon") return project.category.tr.includes("Hackathon") || project.category.tr.includes("Zirve");
    if (activeCategory === "ai") return project.category.tr.includes("Zekâ");
    return true;
  });

  return (
    <section id="projeler" className="py-24 px-4 sm:px-6 relative z-10 border-t border-slate-900 bg-[#070a11]/90">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-400 mb-3">
              <Layers className="w-3.5 h-3.5" />
              <span>KAMPÜS MÜHENDİSLİK PORTFÖYÜ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              Amiral Gemisi Projelerimiz
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
              FENS amfilerinden teknoloji ekosistemine uzanan donanım, yapay zekâ ve yazılım inovasyonlarımız.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-blue-600 text-white shadow-glow"
                    : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="group glass-panel rounded-2xl overflow-hidden border border-slate-800/80 hover:border-slate-700 transition-all duration-300 hover:shadow-glow flex flex-col justify-between"
            >
              <div>
                {/* Image Preview with Accent Overlay */}
                <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
                  <Image
                    src={project.image}
                    alt={project.title.tr}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0d14] via-[#0a0d14]/40 to-transparent" />
                  
                  {/* Category Pill */}
                  <span
                    className="absolute top-3 left-3 text-[10px] font-mono px-2.5 py-1 rounded-md backdrop-blur-md border text-white font-medium"
                    style={{
                      backgroundColor: `${project.accentColor}25`,
                      borderColor: `${project.accentColor}60`,
                    }}
                  >
                    {project.badge.tr}
                  </span>

                  {/* Flagship Indicator */}
                  {project.isFlagship && (
                    <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 backdrop-blur-md">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Amiral Gemisi</span>
                    </span>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5">
                  <div className="text-[11px] font-mono text-slate-400 mb-1">
                    {project.category.tr}
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                    {project.title.tr}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {project.tagline.tr}
                  </p>

                  {/* Specs Pill List */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.specs.map((spec, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono"
                      >
                        {spec.value.tr}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="p-5 pt-0 border-t border-slate-800/40 flex items-center justify-between text-xs mt-4">
                <span className="text-[11px] font-mono text-slate-400">
                  {project.budget.tr}
                </span>
                <button
                  onClick={() => setSelectedProject(project)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <span>Detayları Gör</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Projects CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/projeler"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all"
          >
            <span>Tüm Projeleri ve Teknik Mimarileri İncele</span>
            <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          </Link>
        </div>
      </div>

      {/* Detail Modal Dialog */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-2xl bg-[#0a0d14] border border-slate-700 rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto text-left shadow-2xl">
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-2">
              <span>{selectedProject.category.tr}</span>
              <span>•</span>
              <span>{selectedProject.badge.tr}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white font-display">
              {selectedProject.title.tr}
            </h3>

            <p className="text-sm text-slate-300 mt-2 font-medium">
              {selectedProject.tagline.tr}
            </p>

            <div className="mt-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-rose-300 block mb-1 uppercase tracking-wider text-[10px]">
                  Karşılaşılan Problem & İhtiyaç
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedProject.problem.tr}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="font-semibold text-emerald-300 block mb-1 uppercase tracking-wider text-[10px]">
                  Mühendislik Çözümümüz
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {selectedProject.solution.tr}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Proje Sorumlusu</span>
                  <span className="text-xs font-medium text-white">{selectedProject.ownership.tr}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block">Finansal Mimari</span>
                  <span className="text-xs font-medium text-white">{selectedProject.budget.tr}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Zorluk Derecesi: <strong className="text-white">{selectedProject.difficulty}/5</strong>
              </span>
              <Link
                href="/basvuru"
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow"
              >
                Bu Projede Görev Al
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import ProjectGallery from "@/components/public/ProjectGallery";
import { PROJECTS_DATA, ProjectItem } from "@/lib/data/projects";
import { Search, Sparkles } from "lucide-react";

export default function ProjectsCatalogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filtered = PROJECTS_DATA.filter((p) => {
    const matchesSearch =
      p.title.tr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.tr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.problem.tr.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === "all") return matchesSearch;
    if (selectedCategory === "hardware") return matchesSearch && p.category.tr.includes("Donanım");
    if (selectedCategory === "software") return matchesSearch && p.category.tr.includes("Yazılım");
    if (selectedCategory === "events") return matchesSearch && (p.category.tr.includes("Hackathon") || p.category.tr.includes("Zirve"));
    if (selectedCategory === "ai") return matchesSearch && p.category.tr.includes("Zekâ");
    return matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-ink-950">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              Projelerimiz
            </h1>
            <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
              Üyelerimizin üzerinde çalıştığı donanım ve yazılım projeleri ile planladığımız etkinlikler.
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-10 flex flex-col sm:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl border border-slate-800">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Proje adı, teknoloji veya anahtar kelime ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {[
                { id: "all", label: "Tümü" },
                { id: "hardware", label: "Donanım & IoT" },
                { id: "software", label: "Yazılım" },
                { id: "events", label: "Hackathon & Zirve" },
                { id: "ai", label: "Yapay Zekâ" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === tab.id
                      ? "bg-brand-600 text-white"
                      : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Projects List */}
          <div className="space-y-8">
            {filtered.map((project) => (
              <div
                key={project.id}
                className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80 hover:border-slate-700 transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                {/* Visual Preview */}
                <div className="lg:col-span-5 relative rounded-2xl overflow-hidden border border-slate-800">
                  <ProjectGallery
                    images={project.gallery}
                    alt={project.title.tr}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="h-64 sm:h-72"
                  />
                  <div className="pointer-events-none absolute top-3 left-3 flex gap-2">
                    <span
                      className="px-2.5 py-1 rounded text-[10px] font-mono font-semibold text-white backdrop-blur-md border"
                      style={{
                        backgroundColor: `${project.accentColor}30`,
                        borderColor: `${project.accentColor}60`,
                      }}
                    >
                      {project.badge.tr}
                    </span>
                    {project.isFlagship && (
                      <span className="px-2.5 py-1 rounded text-[10px] font-mono font-semibold text-amber-300 bg-amber-500/20 border border-amber-500/40 backdrop-blur-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Öne çıkan
                      </span>
                    )}
                  </div>
                </div>

                {/* Technical Deep Dive */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="text-xs font-mono text-accent-400">
                    {project.category.tr}
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                    {project.title.tr}
                  </h2>

                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    {project.tagline.tr}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                      <span className="font-semibold text-rose-300 block mb-1 text-[11px] uppercase tracking-wider font-mono">
                        Problem
                      </span>
                      <p className="text-slate-400 leading-relaxed">
                        {project.problem.tr}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                      <span className="font-semibold text-emerald-300 block mb-1 text-[11px] uppercase tracking-wider font-mono">
                        Çözüm
                      </span>
                      <p className="text-slate-400 leading-relaxed">
                        {project.solution.tr}
                      </p>
                    </div>
                  </div>

                  {/* Specs & Ownership Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Teknik Yığın:</span>
                      <div className="flex flex-wrap gap-1">
                        {project.specs.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 font-mono text-[11px]"
                          >
                            {s.value.tr}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href="/basvuru"
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-glow transition-all"
                      >
                        Projeye Katıl
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

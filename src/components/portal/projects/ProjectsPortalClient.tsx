"use client";

import React, { useState, useMemo } from "react";
import {
  FolderGit2,
  Users,
  ExternalLink,
  Github,
  CheckCircle2,
  Clock,
  Sparkles,
  Inbox,
  ArrowRight,
  Plus,
} from "lucide-react";
import { PortalProjectItem, ProjectJoinRequestItem } from "@/lib/projects/project-types";
import ProjectJoinModal from "./ProjectJoinModal";
import ProjectJoinRequestsDrawer from "./ProjectJoinRequestsDrawer";
import CreateProjectModal from "./CreateProjectModal";

interface ProjectsPortalClientProps {
  initialProjects: PortalProjectItem[];
  initialRequests: ProjectJoinRequestItem[];
}

export default function ProjectsPortalClient({
  initialProjects,
  initialRequests,
}: ProjectsPortalClientProps) {
  const [projects, setProjects] = useState<PortalProjectItem[]>(initialProjects);
  const [requests, setRequests] = useState<ProjectJoinRequestItem[]>(initialRequests);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeJoinProject, setActiveJoinProject] = useState<PortalProjectItem | null>(null);
  const [isRequestsDrawerOpen, setIsRequestsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleProjectCreated = (newProj: PortalProjectItem) => {
    setProjects((prev) => [newProj, ...prev]);
    showToast("Yeni proje başarıyla eklendi.");
  };

  const categories = [
    { id: "all", label: "Tüm Projeler" },
    { id: "Gömülü Sistemler", label: "Gömülü Sistemler" },
    { id: "Web & Mobil", label: "Web & Mobil" },
    { id: "Yapay Zekâ", label: "Yapay Zekâ" },
    { id: "Havacılık & Robotik", label: "Havacılık & Robotik" },
  ];

  const filteredProjects = useMemo(() => {
    if (selectedCategory === "all") return projects;
    return projects.filter(
      (p) => p.category.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [projects, selectedCategory]);

  const pendingRequestsCount = requests.filter((r) => r.status === "pending").length;

  const handleJoinSuccess = (projectId: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === projectId ? { ...p, userStatus: "pending" } : p))
    );
    showToast("Katılım başvurunuz proje liderine iletildi.");
  };

  const handleRequestReviewed = (requestId: string, newStatus: "approved" | "rejected") => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r))
    );
    showToast(newStatus === "approved" ? "Aday takıma kabul edildi." : "Başvuru reddedildi.");
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Kulüp Projeleri & Çalışma Grupları
            </h1>
            <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
              {projects.length} Aktif Proje
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Gömülü donanım, yapay zekâ, mobil ve otonom İHA alanlarında geliştirilen öğrenci projelerine katılın veya rol alın.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Proje Ekle</span>
          </button>
          <button
            onClick={() => setIsRequestsDrawerOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <Inbox className="w-4 h-4 text-slate-500" />
            <span>Gelen Başvurular</span>
            {pendingRequestsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-mono text-[10px] flex items-center justify-center font-bold">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? "bg-brand-600 text-white shadow-xs font-semibold"
                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
          >
            <div className="space-y-3">
              {/* Category & Status */}
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                  {project.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-medium ${
                    project.status === "in_progress"
                      ? "text-amber-700 bg-amber-50 border border-amber-200"
                      : "text-brand-700 bg-brand-50 border border-brand-200"
                  }`}
                >
                  {project.status === "in_progress" ? "Geliştiriliyor" : "Planlama"}
                </span>
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug">
                  {project.title}
                </h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                  {project.description}
                </p>
              </div>

              {/* Open Positions Pills */}
              {project.openPositions.length > 0 && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-slate-400 font-mono block">
                    ARANAN YETENEKLER:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {project.openPositions.map((pos) => (
                      <span
                        key={pos}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700"
                      >
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs">
                {/* Lead Profile */}
                {project.leadName ? (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-50 border border-brand-200 overflow-hidden flex items-center justify-center text-brand-700 font-bold text-[10px]">
                      {project.leadAvatar ? (
                        <img
                          src={project.leadAvatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        project.leadName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-[11px]">
                        {project.leadName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {project.leadRole || "Proje Lideri"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-[10px] font-mono font-bold">
                      ?
                    </div>
                    <div>
                      <div className="font-medium text-slate-600 text-[11px]">
                        Lider Atanmadı
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Kulüp Projesi
                      </div>
                    </div>
                  </div>
                )}

                {/* Member count */}
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                  <Users className="w-3.5 h-3.5" />
                  <span>{project.membersCount > 0 ? `${project.membersCount} Üye` : "0 Üye"}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-1.5">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="GitHub Reposu"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Canlı Demo / Web"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-brand-600 hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {project.userStatus === "lead" ? (
                  <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                    Proje Liderisiniz
                  </span>
                ) : project.userStatus === "member" ? (
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    Takım Üyesisiniz
                  </span>
                ) : project.userStatus === "pending" ? (
                  <span className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                    Başvurunuz İnceleniyor
                  </span>
                ) : (
                  <button
                    onClick={() => setActiveJoinProject(project)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Projeye Katıl</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create New Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleProjectCreated}
      />

      {/* Join Project Application Modal */}
      <ProjectJoinModal
        project={activeJoinProject}
        isOpen={Boolean(activeJoinProject)}
        onClose={() => setActiveJoinProject(null)}
        onSuccess={handleJoinSuccess}
      />

      {/* Join Requests Review Drawer */}
      <ProjectJoinRequestsDrawer
        isOpen={isRequestsDrawerOpen}
        onClose={() => setIsRequestsDrawerOpen(false)}
        requests={requests}
        onRequestReviewed={handleRequestReviewed}
      />
    </div>
  );
}

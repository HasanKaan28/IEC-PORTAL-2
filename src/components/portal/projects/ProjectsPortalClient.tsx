"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ExternalLink, FolderGit2, Github, Inbox, Plus, Users } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { tasksProjectsText } from "@/lib/i18n/portal/tasks-projects";
import type {
  JoinRequestStatus,
  PortalProjectItem,
  PortalProjectStatus,
  ProjectJoinRequestItem,
  ProjectViewer,
} from "@/lib/projects/project-types";
import ProjectJoinModal from "./ProjectJoinModal";
import ProjectJoinRequestsDrawer from "./ProjectJoinRequestsDrawer";
import CreateProjectModal from "./CreateProjectModal";
import {
  EmptyState,
  ToastRegion,
  UserAvatar,
  focusRing,
  primaryButtonClass,
  safeExternalUrl,
  secondaryButtonClass,
  useToast,
  type ToastTone,
} from "@/components/portal/tasks/shared-ui";

interface ProjectsPortalClientProps {
  initialProjects: PortalProjectItem[];
  initialRequests: ProjectJoinRequestItem[];
  viewer: ProjectViewer;
}

const STATUS_STYLES: Record<PortalProjectStatus, string> = {
  concept: "border-slate-200 bg-slate-50 text-slate-700",
  in_progress: "border-accent-200 bg-accent-50 text-accent-800",
  completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function safeColor(value: string | null): string | undefined {
  return value && /^#[0-9a-f]{3,8}$/i.test(value) ? value : undefined;
}

export default function ProjectsPortalClient({ initialProjects, initialRequests, viewer }: ProjectsPortalClientProps) {
  const { locale } = useLocale();
  const t = tasksProjectsText[locale];

  // Fresh server props (after revalidation or a locale switch) replace optimistic local state.
  const [projects, setProjects] = useState<PortalProjectItem[]>(initialProjects);
  const [requests, setRequests] = useState<ProjectJoinRequestItem[]>(initialRequests);
  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);
  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [joinProjectId, setJoinProjectId] = useState<string | null>(null);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast, showToast, dismiss } = useToast();
  const notify = useCallback((message: string, tone: ToastTone = "success") => showToast(message, tone), [showToast]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(projects.map((project) => project.category).filter(Boolean)));
    return unique.sort((a, b) => a.localeCompare(b, locale === "tr" ? "tr-TR" : "en-GB"));
  }, [projects, locale]);

  const activeCategory = categories.includes(selectedCategory) ? selectedCategory : "all";
  const filteredProjects =
    activeCategory === "all" ? projects : projects.filter((project) => project.category === activeCategory);

  const pendingRequestsCount = requests.filter((request) => request.status === "pending").length;
  const joinProject = projects.find((project) => project.id === joinProjectId) ?? null;

  const handleJoinSuccess = (projectId: string) => {
    setProjects((previous) =>
      previous.map((project) => (project.id === projectId ? { ...project, userStatus: "pending" } : project))
    );
    setJoinProjectId(null);
    notify(t.projects.toast.joinSent);
  };

  const handleRequestReviewed = (requestId: string, status: Exclude<JoinRequestStatus, "pending">, note: string) => {
    const request = requests.find((item) => item.id === requestId);
    setRequests((previous) =>
      previous.map((item) => (item.id === requestId ? { ...item, status, reviewerNote: note || null } : item))
    );
    if (status === "approved" && request) {
      setProjects((previous) =>
        previous.map((project) =>
          project.id === request.projectId ? { ...project, membersCount: project.membersCount + 1 } : project
        )
      );
    }
    notify(status === "approved" ? t.projects.toast.approved : t.projects.toast.rejected);
  };

  const handleProjectCreated = () => {
    setIsCreateOpen(false);
    notify(t.projects.toast.created);
  };

  const tabClass = (active: boolean) =>
    `whitespace-nowrap rounded-xl px-3.5 py-1.5 text-sm font-medium transition-colors ${focusRing} ${
      active
        ? "bg-brand-600 text-white shadow-sm"
        : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
    }`;

  return (
    <div className="space-y-6">
      <ToastRegion toast={toast} onDismiss={dismiss} dismissLabel={t.common.dismissToast} />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-900">{t.projects.heading}</h1>
            <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
              {t.projects.countBadge(projects.length)}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{t.projects.intro}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {viewer.canReview && (
            <button type="button" onClick={() => setIsRequestsOpen(true)} className={secondaryButtonClass}>
              <Inbox className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span>{t.projects.incomingRequests}</span>
              {pendingRequestsCount > 0 && (
                <span
                  className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-xs font-bold text-white"
                  aria-label={t.projects.pendingBadge(pendingRequestsCount)}
                >
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}
          {viewer.canCreate && (
            <button type="button" onClick={() => setIsCreateOpen(true)} className={primaryButtonClass}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{t.projects.newProject}</span>
            </button>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title={t.projects.emptyTitle}
          text={viewer.canCreate ? t.projects.emptyTextCreator : t.projects.emptyText}
          action={
            viewer.canCreate ? (
              <button type="button" onClick={() => setIsCreateOpen(true)} className={primaryButtonClass}>
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>{t.projects.newProject}</span>
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          {categories.length > 1 && (
            <div role="group" aria-label={t.projects.categoryFilterLabel} className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                aria-pressed={activeCategory === "all"}
                onClick={() => setSelectedCategory("all")}
                className={tabClass(activeCategory === "all")}
              >
                {t.projects.allCategories}
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={activeCategory === category}
                  onClick={() => setSelectedCategory(category)}
                  className={tabClass(activeCategory === category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {filteredProjects.length === 0 ? (
            <EmptyState icon={FolderGit2} title={t.projects.noResults} compact />
          ) : (
            <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredProjects.map((project) => {
                const github = safeExternalUrl(project.githubUrl);
                const demo = safeExternalUrl(project.demoUrl);
                const accent = safeColor(project.accentColor);

                return (
                  <li key={project.id}>
                    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                      <div
                        className="h-1.5 w-full bg-brand-500"
                        style={accent ? { backgroundColor: accent } : undefined}
                        aria-hidden="true"
                      />
                      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="max-w-[65%] truncate rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">
                              {project.category}
                            </span>
                            <span className={`rounded-md border px-2 py-0.5 font-medium ${STATUS_STYLES[project.status]}`}>
                              {t.projectStatus[project.status]}
                            </span>
                          </div>

                          <div>
                            <h2 className="font-display text-base font-bold leading-snug text-slate-900">{project.title}</h2>
                            {project.description && (
                              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3 border-t border-slate-100 pt-4">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <div className="flex min-w-0 items-center gap-2">
                              <UserAvatar name={project.leadName} src={project.leadAvatar} size="md" />
                              <div className="min-w-0">
                                <div className="truncate font-semibold text-slate-800">
                                  {project.leadId === viewer.id
                                    ? t.common.you
                                    : project.leadName || t.projects.noLead}
                                </div>
                                <div className="text-xs text-slate-500">{t.projects.leadLabel}</div>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
                              <Users className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>{t.projects.memberCount(project.membersCount)}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {github && (
                                <a
                                  href={github}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={t.projects.githubLink(project.title)}
                                  title={t.projects.githubLink(project.title)}
                                  className={`rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 ${focusRing}`}
                                >
                                  <Github className="h-4 w-4" aria-hidden="true" />
                                </a>
                              )}
                              {demo && (
                                <a
                                  href={demo}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label={t.projects.demoLink(project.title)}
                                  title={t.projects.demoLink(project.title)}
                                  className={`rounded-lg border border-slate-200 p-1.5 text-slate-500 transition-colors hover:bg-slate-50 hover:text-brand-700 ${focusRing}`}
                                >
                                  <ExternalLink className="h-4 w-4" aria-hidden="true" />
                                </a>
                              )}
                            </div>

                            {project.userStatus === "lead" ? (
                              <span className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700">
                                {t.projects.youLead}
                              </span>
                            ) : project.userStatus === "member" ? (
                              <span className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                                {t.projects.youMember}
                              </span>
                            ) : project.userStatus === "pending" ? (
                              <span className="rounded-xl border border-accent-200 bg-accent-50 px-3 py-1.5 text-xs font-semibold text-accent-800">
                                {t.projects.pending}
                              </span>
                            ) : project.status === "completed" ? (
                              <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-500">
                                {t.projects.closed}
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setJoinProjectId(project.id)}
                                aria-label={t.projects.joinAria(project.title)}
                                className={`${primaryButtonClass} px-3.5 py-1.5`}
                              >
                                <span>{t.projects.join}</span>
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {isCreateOpen && <CreateProjectModal onClose={() => setIsCreateOpen(false)} onCreated={handleProjectCreated} />}

      {joinProject && (
        <ProjectJoinModal project={joinProject} onClose={() => setJoinProjectId(null)} onSuccess={handleJoinSuccess} />
      )}

      {isRequestsOpen && (
        <ProjectJoinRequestsDrawer
          requests={requests}
          viewer={viewer}
          onClose={() => setIsRequestsOpen(false)}
          onReviewed={handleRequestReviewed}
          notify={notify}
        />
      )}
    </div>
  );
}

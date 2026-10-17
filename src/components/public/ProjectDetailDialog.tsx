"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { ProjectItem } from "@/lib/data/projects";
import { useLocale } from "@/lib/i18n/locale-context";
import ProjectGallery from "./ProjectGallery";

interface ProjectDetailDialogProps {
  project: ProjectItem;
  onClose: () => void;
}

export default function ProjectDetailDialog({ project, onClose }: ProjectDetailDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const { locale, t } = useLocale();
  const titleId = `project-dialog-title-${project.id}`;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const active = document.activeElement;
    if (!triggerRef.current && active instanceof HTMLElement && !dialog.contains(active)) {
      triggerRef.current = active;
    }
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    // No dialog.close() here: its "close" event would call onClose again. Unmounting removes the dialog from the top layer.
    return () => {
      document.documentElement.style.overflow = previousOverflow;
      const trigger = triggerRef.current;
      if (trigger?.isConnected) trigger.focus();
    };
  }, []);

  const closeWhenBackdropClicked = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={closeWhenBackdropClicked}
      className="w-[calc(100%-2rem)] max-w-2xl max-h-[90dvh] p-0 rounded-2xl border border-slate-200 bg-white text-left text-slate-700 shadow-soft backdrop:bg-slate-900/30 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-6 sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 transition-colors"
          aria-label={t.common.close}
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>

        <p className="text-sm text-brand-700 pr-12">
          {project.category[locale]} · {project.badge[locale]}
        </p>

        <h2 id={titleId} className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 font-display pr-12">
          {project.title[locale]}
        </h2>

        <p className="text-base text-slate-600 mt-2">{project.tagline[locale]}</p>

        <ProjectGallery
          images={project.gallery}
          alt={project.title[locale]}
          sizes="(max-width: 768px) 100vw, 640px"
          className="mt-5 aspect-[16/9] rounded-xl border border-slate-200"
        />

        <div className="mt-6 space-y-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-1">{t.projects.problem}</h3>
            <p className="text-slate-600 leading-relaxed">{project.problem[locale]}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-1">{t.projects.solution}</h3>
            <p className="text-slate-600 leading-relaxed">{project.solution[locale]}</p>
          </div>

          <dl className="p-3 rounded-lg bg-canvas border border-slate-200">
            <dt className="text-xs text-slate-500">{t.projects.owner}</dt>
            <dd className="text-sm font-medium text-slate-900 mt-0.5">{project.ownership[locale]}</dd>
          </dl>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-slate-500">
            {t.projects.difficulty}: <strong className="text-slate-900 tabular-nums">{project.difficulty}/5</strong>
          </span>
          <Link
            href="/basvuru"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold transition-colors"
          >
            {t.projects.joinProject}
          </Link>
        </div>
      </div>
    </dialog>
  );
}

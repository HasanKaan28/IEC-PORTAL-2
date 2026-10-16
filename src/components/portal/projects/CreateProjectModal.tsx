"use client";

import React, { useId, useState } from "react";
import { FolderGit2, Loader2, Plus, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { tasksProjectsText } from "@/lib/i18n/portal/tasks-projects";
import { PROJECT_CATEGORY_KEYS, type ProjectCategoryKey } from "@/lib/projects/project-types";
import { createProjectAction } from "@/lib/projects/project-actions";
import {
  DialogFrame,
  FormError,
  iconButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/portal/tasks/shared-ui";

interface CreateProjectModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const TITLE_MAX = 120;
const SUMMARY_MAX = 300;

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export default function CreateProjectModal({ onClose, onCreated }: CreateProjectModalProps) {
  const { locale } = useLocale();
  const t = tasksProjectsText[locale];
  const ids = useId();

  const [titleTr, setTitleTr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [summaryTr, setSummaryTr] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [category, setCategory] = useState<ProjectCategoryKey>("hardware");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // The field in the active language comes first; the other one is optional.
  const primaryIsTr = locale === "tr";

  const validate = (): string | null => {
    const titles = [titleTr.trim(), titleEn.trim()].filter(Boolean);
    if (titles.length === 0 || titles.some((value) => value.length < 3)) return t.errors.projectTitleRequired;
    const summaries = [summaryTr.trim(), summaryEn.trim()].filter(Boolean);
    if (summaries.length === 0 || summaries.some((value) => value.length < 10)) return t.errors.projectSummaryRequired;
    for (const url of [githubUrl.trim(), demoUrl.trim()]) {
      if (url && !isHttpsUrl(url)) return t.errors.urlInvalid;
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const problem = validate();
    if (problem) {
      setErrorMessage(problem);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    const result = await createProjectAction({
      titleTr: titleTr.trim(),
      titleEn: titleEn.trim(),
      summaryTr: summaryTr.trim(),
      summaryEn: summaryEn.trim(),
      category,
      githubUrl: githubUrl.trim(),
      demoUrl: demoUrl.trim(),
    });
    setIsSubmitting(false);

    if (result.success) onCreated();
    else setErrorMessage(result.error);
  };

  const titleId = `${ids}-heading`;
  const labelClass = "mb-1 block text-xs font-semibold text-slate-700";

  const titleFields = [
    { lang: "tr", label: t.createProject.titleTrLabel, value: titleTr, set: setTitleTr },
    { lang: "en", label: t.createProject.titleEnLabel, value: titleEn, set: setTitleEn },
  ];
  const summaryFields = [
    { lang: "tr", label: t.createProject.summaryTrLabel, value: summaryTr, set: setSummaryTr },
    { lang: "en", label: t.createProject.summaryEnLabel, value: summaryEn, set: setSummaryEn },
  ];
  if (!primaryIsTr) {
    titleFields.reverse();
    summaryFields.reverse();
  }

  return (
    <DialogFrame onClose={onClose} labelledBy={titleId}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50/60 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-600">
            <FolderGit2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 id={titleId} className="font-display text-base font-bold text-slate-900">
              {t.createProject.heading}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{t.createProject.intro}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={t.common.closeDialog} className={iconButtonClass}>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5" noValidate>
        <FormError message={errorMessage} />
        <p id={`${ids}-lang-hint`} className="rounded-xl border border-accent-200 bg-accent-50 p-3 text-xs text-accent-800">
          {t.createProject.languageHint}
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {titleFields.map((field, index) => (
            <div key={field.lang}>
              <label htmlFor={`${ids}-title-${field.lang}`} className={labelClass}>
                {field.label}
              </label>
              <input
                id={`${ids}-title-${field.lang}`}
                data-autofocus={index === 0 ? true : undefined}
                type="text"
                lang={field.lang}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
                placeholder={index === 0 ? t.createProject.titlePlaceholder : undefined}
                maxLength={TITLE_MAX}
                aria-describedby={`${ids}-lang-hint`}
                className={inputClass}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {summaryFields.map((field, index) => (
            <div key={field.lang}>
              <label htmlFor={`${ids}-summary-${field.lang}`} className={labelClass}>
                {field.label}
              </label>
              <textarea
                id={`${ids}-summary-${field.lang}`}
                lang={field.lang}
                rows={3}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
                placeholder={index === 0 ? t.createProject.summaryPlaceholder : undefined}
                maxLength={SUMMARY_MAX}
                aria-describedby={`${ids}-lang-hint`}
                className={`${inputClass} resize-y`}
              />
            </div>
          ))}
        </div>

        <div>
          <label htmlFor={`${ids}-category`} className={labelClass}>
            {t.createProject.categoryLabel}
          </label>
          <select
            id={`${ids}-category`}
            value={category}
            onChange={(event) => setCategory(event.target.value as ProjectCategoryKey)}
            className={`${inputClass} cursor-pointer`}
          >
            {PROJECT_CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {t.projectCategories[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${ids}-github`} className={labelClass}>
              {t.createProject.githubLabel} <span className="font-normal text-slate-500">({t.common.optional})</span>
            </label>
            <input
              id={`${ids}-github`}
              type="url"
              inputMode="url"
              value={githubUrl}
              onChange={(event) => setGithubUrl(event.target.value)}
              placeholder="https://github.com/..."
              maxLength={300}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor={`${ids}-demo`} className={labelClass}>
              {t.createProject.demoLabel} <span className="font-normal text-slate-500">({t.common.optional})</span>
            </label>
            <input
              id={`${ids}-demo`}
              type="url"
              inputMode="url"
              value={demoUrl}
              onChange={(event) => setDemoUrl(event.target.value)}
              placeholder="https://..."
              maxLength={300}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} disabled={isSubmitting} className={secondaryButtonClass}>
            {t.common.cancel}
          </button>
          <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{isSubmitting ? t.createProject.submitting : t.createProject.submit}</span>
          </button>
        </div>
      </form>
    </DialogFrame>
  );
}

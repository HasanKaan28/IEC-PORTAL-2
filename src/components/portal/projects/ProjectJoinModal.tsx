"use client";

import React, { useId, useState } from "react";
import { FolderGit2, Loader2, Send, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { tasksProjectsText } from "@/lib/i18n/portal/tasks-projects";
import type { PortalProjectItem } from "@/lib/projects/project-types";
import { requestJoinProjectAction } from "@/lib/projects/project-actions";
import {
  DialogFrame,
  FormError,
  iconButtonClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from "@/components/portal/tasks/shared-ui";

interface ProjectJoinModalProps {
  project: PortalProjectItem;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
}

const MESSAGE_MIN = 10;
const MESSAGE_MAX = 1000;

export default function ProjectJoinModal({ project, onClose, onSuccess }: ProjectJoinModalProps) {
  const { locale } = useLocale();
  const t = tasksProjectsText[locale];
  const ids = useId();

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (trimmed.length < MESSAGE_MIN) {
      setErrorMessage(t.errors.joinMessageMin);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    const result = await requestJoinProjectAction(project.id, trimmed);
    setIsSubmitting(false);

    if (result.success) onSuccess(project.id);
    else setErrorMessage(result.error);
  };

  const titleId = `${ids}-heading`;

  return (
    <DialogFrame onClose={onClose} labelledBy={titleId}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50/60 p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-600">
            <FolderGit2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-base font-bold text-slate-900">
              {t.joinModal.heading}
            </h2>
            <p className="mt-0.5 truncate text-sm text-slate-500">{project.title}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={t.common.closeDialog} className={iconButtonClass}>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5" noValidate>
        <FormError message={errorMessage} />

        <dl className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm sm:grid-cols-2">
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">{t.joinModal.leadLabel}</dt>
            <dd className="truncate font-medium text-slate-800">{project.leadName || t.projects.noLead}</dd>
          </div>
          <div className="min-w-0">
            <dt className="text-xs text-slate-500">{t.joinModal.categoryLabel}</dt>
            <dd className="truncate font-medium text-slate-800">{project.category}</dd>
          </div>
        </dl>

        <div>
          <label htmlFor={`${ids}-message`} className="mb-1 block text-xs font-semibold text-slate-700">
            {t.joinModal.messageLabel} <span className="font-normal text-slate-500">({t.common.required})</span>
          </label>
          <p id={`${ids}-hint`} className="mb-2 text-xs text-slate-500">
            {t.joinModal.messageHint}
          </p>
          <textarea
            id={`${ids}-message`}
            data-autofocus
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder={t.joinModal.messagePlaceholder}
            rows={5}
            maxLength={MESSAGE_MAX}
            required
            aria-required="true"
            aria-describedby={`${ids}-hint ${ids}-count`}
            className={`${inputClass} resize-y leading-relaxed`}
          />
          <p id={`${ids}-count`} className="mt-1 text-right text-xs text-slate-500">
            {t.common.characterCount(message.length, MESSAGE_MAX)}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            {t.common.cancel}
          </button>
          <button type="submit" disabled={isSubmitting || message.trim().length === 0} className={primaryButtonClass}>
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{isSubmitting ? t.joinModal.submitting : t.joinModal.submit}</span>
          </button>
        </div>
      </form>
    </DialogFrame>
  );
}

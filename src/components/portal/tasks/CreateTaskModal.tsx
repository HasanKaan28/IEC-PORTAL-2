"use client";

import React, { useId, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { tasksProjectsText } from "@/lib/i18n/portal/tasks-projects";
import { ROLE_LABELS } from "@/lib/rbac/permissions";
import {
  TASK_PRIORITIES,
  type AssignableMember,
  type TaskPriority,
  type TaskProjectOption,
  type TaskStatus,
  type TaskViewer,
} from "@/lib/tasks/task-types";
import { createTaskAction } from "@/lib/tasks/task-actions";
import { DialogFrame, FormError, iconButtonClass, inputClass, primaryButtonClass, secondaryButtonClass } from "./shared-ui";

interface CreateTaskModalProps {
  onClose: () => void;
  onCreated: () => void;
  members: AssignableMember[];
  projects: TaskProjectOption[];
  viewer: TaskViewer;
}

const TITLE_MAX = 200;
const DESCRIPTION_MAX = 5000;

export default function CreateTaskModal({ onClose, onCreated, members, projects, viewer }: CreateTaskModalProps) {
  const { locale } = useLocale();
  const t = tasksProjectsText[locale];
  const ids = useId();

  const [title, setTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [status, setStatus] = useState<TaskStatus>("todo");
  // Members without assignment rights usually create tasks for themselves.
  const [assigneeId, setAssigneeId] = useState(viewer.canAssign ? "" : viewer.id);
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const self = members.find((member) => member.id === viewer.id);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < 3) {
      setErrorMessage(t.errors.taskTitleMin);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    const result = await createTaskAction({
      title: trimmedTitle,
      description: description.trim(),
      projectId: projectId || null,
      assigneeId: assigneeId || null,
      priority,
      status,
      dueDate: dueDate || null,
    });
    setIsSubmitting(false);

    if (result.success) onCreated();
    else setErrorMessage(result.error);
  };

  const titleId = `${ids}-heading`;
  const labelClass = "mb-1 block text-xs font-semibold text-slate-700";

  return (
    <DialogFrame onClose={onClose} labelledBy={titleId}>
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50/60 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-brand-200 bg-brand-50 text-brand-600">
            <Plus className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <h2 id={titleId} className="font-display text-base font-bold text-slate-900">
              {t.createTask.heading}
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">{t.createTask.intro}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} aria-label={t.common.closeDialog} className={iconButtonClass}>
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 p-5" noValidate>
        <FormError message={errorMessage} />

        <div>
          <label htmlFor={`${ids}-title`} className={labelClass}>
            {t.createTask.titleLabel} <span className="font-normal text-slate-500">({t.common.required})</span>
          </label>
          <input
            id={`${ids}-title`}
            data-autofocus
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t.createTask.titlePlaceholder}
            maxLength={TITLE_MAX}
            required
            aria-required="true"
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${ids}-project`} className={labelClass}>
              {t.createTask.projectLabel}
            </label>
            <select
              id={`${ids}-project`}
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">{t.common.noProject}</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`${ids}-assignee`} className={labelClass}>
              {t.createTask.assigneeLabel}
            </label>
            <select
              id={`${ids}-assignee`}
              value={assigneeId}
              onChange={(event) => setAssigneeId(event.target.value)}
              aria-describedby={viewer.canAssign ? undefined : `${ids}-assign-hint`}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="">{t.common.unassigned}</option>
              {viewer.canAssign ? (
                members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.id === viewer.id
                      ? `${member.name} (${t.common.you})`
                      : `${member.name} (${ROLE_LABELS[member.role][locale]})`}
                  </option>
                ))
              ) : (
                <option value={viewer.id}>{self ? `${self.name} (${t.common.you})` : t.createTask.assignToMe}</option>
              )}
            </select>
            {!viewer.canAssign && (
              <p id={`${ids}-assign-hint`} className="mt-1 text-xs text-slate-500">
                {t.createTask.assignHint}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label htmlFor={`${ids}-priority`} className={labelClass}>
              {t.createTask.priorityLabel}
            </label>
            <select
              id={`${ids}-priority`}
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              className={`${inputClass} cursor-pointer`}
            >
              {TASK_PRIORITIES.map((value) => (
                <option key={value} value={value}>
                  {t.taskPriority[value]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={`${ids}-status`} className={labelClass}>
              {t.createTask.statusLabel}
            </label>
            <select
              id={`${ids}-status`}
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="todo">{t.taskStatus.todo}</option>
              <option value="in_progress">{t.taskStatus.in_progress}</option>
            </select>
          </div>

          <div>
            <label htmlFor={`${ids}-due`} className={labelClass}>
              {t.createTask.dueDateLabel}
            </label>
            <input
              id={`${ids}-due`}
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor={`${ids}-description`} className={labelClass}>
            {t.createTask.descriptionLabel} <span className="font-normal text-slate-500">({t.common.optional})</span>
          </label>
          <textarea
            id={`${ids}-description`}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t.createTask.descriptionPlaceholder}
            rows={4}
            maxLength={DESCRIPTION_MAX}
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className={secondaryButtonClass}>
            {t.common.cancel}
          </button>
          <button type="submit" disabled={isSubmitting} className={primaryButtonClass}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
            <span>{isSubmitting ? t.createTask.submitting : t.createTask.submit}</span>
          </button>
        </div>
      </form>
    </DialogFrame>
  );
}

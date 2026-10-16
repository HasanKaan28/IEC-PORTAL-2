"use client";

import React, { useId, useState } from "react";
import { Check, Inbox, Loader2, X, XCircle } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate } from "@/lib/i18n/format";
import { tasksProjectsText } from "@/lib/i18n/portal/tasks-projects";
import type { JoinRequestStatus, ProjectJoinRequestItem, ProjectViewer } from "@/lib/projects/project-types";
import { reviewProjectJoinRequestAction } from "@/lib/projects/project-actions";
import {
  DialogFrame,
  EmptyState,
  UserAvatar,
  focusRing,
  iconButtonClass,
  inputClass,
  secondaryButtonClass,
  type ToastTone,
} from "@/components/portal/tasks/shared-ui";

interface ProjectJoinRequestsDrawerProps {
  requests: ProjectJoinRequestItem[];
  viewer: ProjectViewer;
  onClose: () => void;
  onReviewed: (requestId: string, status: Exclude<JoinRequestStatus, "pending">, note: string) => void;
  notify: (message: string, tone?: ToastTone) => void;
}

const NOTE_MAX = 500;

const STATUS_BADGE: Record<JoinRequestStatus, string> = {
  pending: "border-accent-200 bg-accent-50 text-accent-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function ProjectJoinRequestsDrawer({
  requests,
  viewer,
  onClose,
  onReviewed,
  notify,
}: ProjectJoinRequestsDrawerProps) {
  const { locale } = useLocale();
  const t = tasksProjectsText[locale];
  const ids = useId();
  const titleId = `${ids}-heading`;

  const [filter, setFilter] = useState<"pending" | "all">("pending");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const pendingCount = requests.filter((request) => request.status === "pending").length;
  const visible = filter === "pending" ? requests.filter((request) => request.status === "pending") : requests;

  const handleReview = async (request: ProjectJoinRequestItem, status: Exclude<JoinRequestStatus, "pending">) => {
    const note = (notes[request.id] ?? "").trim();
    setBusyId(request.id);
    const result = await reviewProjectJoinRequestAction(request.id, status, note || undefined);
    setBusyId(null);
    if (result.success) onReviewed(request.id, status, note);
    else notify(result.error, "error");
  };

  const tabClass = (active: boolean) =>
    `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${focusRing} ${
      active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
    }`;

  return (
    <DialogFrame onClose={onClose} labelledBy={titleId} variant="drawer">
      <div className="space-y-3 border-b border-slate-200 bg-slate-50/60 p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Inbox className="h-5 w-5 text-brand-600" aria-hidden="true" />
            <h2 id={titleId} className="font-display text-lg font-bold text-slate-900">
              {t.requestsDrawer.heading}
            </h2>
          </div>
          <button type="button" onClick={onClose} aria-label={t.common.closePanel} className={iconButtonClass}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm text-slate-500">
          {viewer.canReviewAll ? t.requestsDrawer.introAll : t.requestsDrawer.intro}
        </p>
        <div
          role="group"
          aria-label={t.requestsDrawer.filterLabel}
          className="inline-flex items-center rounded-xl bg-slate-200/70 p-1"
        >
          <button
            type="button"
            aria-pressed={filter === "pending"}
            onClick={() => setFilter("pending")}
            className={tabClass(filter === "pending")}
          >
            {t.requestsDrawer.pendingTab(pendingCount)}
          </button>
          <button
            type="button"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
            className={tabClass(filter === "all")}
          >
            {t.requestsDrawer.allTab(requests.length)}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {visible.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={filter === "pending" ? t.requestsDrawer.emptyPending : t.requestsDrawer.emptyAll}
            compact
          />
        ) : (
          <ul className="space-y-4">
            {visible.map((request) => {
              const busy = busyId === request.id;
              const noteId = `${ids}-note-${request.id}`;
              const applicant = request.userName || "-";
              return (
                <li key={request.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <UserAvatar name={request.userName} src={request.userAvatar} size="md" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">{applicant}</p>
                        <p className="truncate text-xs text-slate-500">
                          {[request.userDepartment || t.requestsDrawer.noDepartment, request.classYear]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        <p className="mt-1 truncate text-xs font-medium text-brand-700">{request.projectTitle}</p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-md border px-2 py-0.5 text-xs font-medium ${STATUS_BADGE[request.status]}`}
                    >
                      {t.requestStatus[request.status]}
                    </span>
                  </div>

                  {request.message && (
                    <blockquote className="whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                      {request.message}
                    </blockquote>
                  )}

                  <p className="text-xs text-slate-500">
                    <time dateTime={request.createdAt}>
                      {t.requestsDrawer.appliedOn(formatDate(request.createdAt, locale))}
                    </time>
                  </p>

                  {request.status !== "pending" && request.reviewerNote && (
                    <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-600">
                      <span className="font-semibold text-slate-700">{t.requestsDrawer.reviewerNote}: </span>
                      {request.reviewerNote}
                    </p>
                  )}

                  {request.status === "pending" && (
                    <div className="space-y-3 border-t border-slate-100 pt-3">
                      <div>
                        <label htmlFor={noteId} className="mb-1 block text-xs font-semibold text-slate-600">
                          {t.requestsDrawer.noteLabel}{" "}
                          <span className="font-normal text-slate-500">({t.common.optional})</span>
                        </label>
                        <input
                          id={noteId}
                          type="text"
                          value={notes[request.id] ?? ""}
                          onChange={(event) => setNotes((previous) => ({ ...previous, [request.id]: event.target.value }))}
                          placeholder={t.requestsDrawer.notePlaceholder}
                          maxLength={NOTE_MAX}
                          disabled={busy}
                          className={inputClass}
                        />
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleReview(request, "rejected")}
                          disabled={busy}
                          aria-label={t.requestsDrawer.rejectAria(applicant)}
                          className={`inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60 ${focusRing}`}
                        >
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                          <span>{t.requestsDrawer.reject}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReview(request, "approved")}
                          disabled={busy}
                          aria-label={t.requestsDrawer.approveAria(applicant)}
                          className={`inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-60 ${focusRing}`}
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                          ) : (
                            <Check className="h-4 w-4" aria-hidden="true" />
                          )}
                          <span>{busy ? t.requestsDrawer.processing : t.requestsDrawer.approve}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 p-4">
        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          {t.common.close}
        </button>
      </div>
    </DialogFrame>
  );
}

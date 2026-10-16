"use client";

import React, { useEffect, useId, useState } from "react";
import { Loader2, MessageSquare, Paperclip, RefreshCw, Send, Trash2, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate, formatDateTime, formatRelative } from "@/lib/i18n/format";
import { tasksProjectsText } from "@/lib/i18n/portal/tasks-projects";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  canDeleteTask,
  canEditTask,
  isTaskOverdue,
  type AssignableMember,
  type TaskAttachmentItem,
  type TaskCommentItem,
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
  type TaskViewer,
} from "@/lib/tasks/task-types";
import {
  addTaskCommentAction,
  assignTaskAction,
  deleteTaskAction,
  getTaskAttachmentsAction,
  getTaskCommentsAction,
  updateTaskPriorityAction,
  updateTaskStatusAction,
} from "@/lib/tasks/task-actions";
import {
  DialogFrame,
  FormError,
  UserAvatar,
  focusRing,
  iconButtonClass,
  inputClass,
  primaryButtonClass,
  safeExternalUrl,
  secondaryButtonClass,
  type ToastTone,
} from "./shared-ui";

interface TaskDetailDrawerProps {
  task: TaskItem;
  viewer: TaskViewer;
  members: AssignableMember[];
  onClose: () => void;
  onTaskPatched: (taskId: string, patch: Partial<TaskItem>) => void;
  onTaskDeleted: (taskId: string) => void;
  notify: (message: string, tone?: ToastTone) => void;
}

const COMMENT_MAX = 2000;

function formatFileSize(bytes: number, locale: "tr" | "en"): string {
  const formatter = new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-GB", { maximumFractionDigits: 1 });
  if (bytes >= 1024 * 1024) return `${formatter.format(bytes / (1024 * 1024))} MB`;
  return `${formatter.format(Math.max(1, Math.round(bytes / 1024)))} KB`;
}

export default function TaskDetailDrawer({
  task,
  viewer,
  members,
  onClose,
  onTaskPatched,
  onTaskDeleted,
  notify,
}: TaskDetailDrawerProps) {
  const { locale } = useLocale();
  const t = tasksProjectsText[locale];
  const ids = useId();
  const titleId = `${ids}-title`;

  const [comments, setComments] = useState<TaskCommentItem[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachmentItem[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [reloadKey, setReloadKey] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingField, setPendingField] = useState<"status" | "priority" | "assignee" | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const editable = canEditTask(viewer, task);
  const deletable = canDeleteTask(viewer, task);
  const overdue = isTaskOverdue(task);

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    Promise.all([getTaskCommentsAction(task.id), getTaskAttachmentsAction(task.id)])
      .then(([commentsResult, attachmentsResult]) => {
        if (cancelled) return;
        if (!commentsResult.success) {
          setLoadState("error");
          return;
        }
        setComments(commentsResult.data ?? []);
        setAttachments(attachmentsResult.success ? attachmentsResult.data ?? [] : []);
        setLoadState("ready");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [task.id, reloadKey]);

  const handleStatusChange = async (status: TaskStatus) => {
    const previous = task.status;
    if (previous === status) return;
    onTaskPatched(task.id, { status });
    setPendingField("status");
    const result = await updateTaskStatusAction(task.id, status);
    setPendingField(null);
    if (result.success) notify(t.tasks.toast.statusUpdated);
    else {
      onTaskPatched(task.id, { status: previous });
      notify(result.error, "error");
    }
  };

  const handlePriorityChange = async (priority: TaskPriority) => {
    const previous = task.priority;
    if (previous === priority) return;
    onTaskPatched(task.id, { priority });
    setPendingField("priority");
    const result = await updateTaskPriorityAction(task.id, priority);
    setPendingField(null);
    if (result.success) notify(t.tasks.toast.priorityUpdated);
    else {
      onTaskPatched(task.id, { priority: previous });
      notify(result.error, "error");
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    const previous = {
      assigneeId: task.assigneeId,
      assigneeName: task.assigneeName,
      assigneeAvatar: task.assigneeAvatar,
    };
    const nextId = assigneeId || null;
    if (previous.assigneeId === nextId) return;
    const member = members.find((item) => item.id === nextId);
    onTaskPatched(task.id, {
      assigneeId: nextId,
      assigneeName: member?.name ?? null,
      assigneeAvatar: member?.avatar ?? null,
    });
    setPendingField("assignee");
    const result = await assignTaskAction(task.id, nextId);
    setPendingField(null);
    if (result.success) notify(t.tasks.toast.assigneeUpdated);
    else {
      onTaskPatched(task.id, previous);
      notify(result.error, "error");
    }
  };

  const handleAddComment = async (event: React.FormEvent) => {
    event.preventDefault();
    const content = newComment.trim();
    if (content.length < 2) {
      setCommentError(t.errors.commentMin);
      return;
    }
    setIsSubmitting(true);
    setCommentError(null);
    const result = await addTaskCommentAction(task.id, content);
    setIsSubmitting(false);

    if (result.success && result.data) {
      const comment = result.data;
      setComments((previous) => [...previous, comment]);
      setNewComment("");
      onTaskPatched(task.id, { commentsCount: task.commentsCount + 1 });
      notify(t.tasks.toast.commentAdded);
    } else if (!result.success) {
      setCommentError(result.error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteTaskAction(task.id);
    setIsDeleting(false);
    if (result.success) {
      onTaskDeleted(task.id);
    } else {
      setConfirmingDelete(false);
      notify(result.error, "error");
    }
  };

  const assigneeOptions = members.some((member) => member.id === task.assigneeId) || !task.assigneeId
    ? members
    : [
        ...members,
        { id: task.assigneeId, name: task.assigneeName ?? "", avatar: task.assigneeAvatar, role: "member" as const },
      ];

  const selectClass = `${inputClass} cursor-pointer py-1.5`;

  return (
    <DialogFrame onClose={onClose} labelledBy={titleId} variant="drawer">
      {/* Header */}
      <div className="space-y-3 border-b border-slate-200 bg-slate-50/60 p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="inline-flex max-w-[80%] items-center truncate rounded-md border border-brand-200 bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-700">
            {task.projectName ?? t.common.noProject}
          </span>
          <button type="button" onClick={onClose} aria-label={t.common.closePanel} className={iconButtonClass}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <h2 id={titleId} className="font-display text-lg font-bold leading-snug text-slate-900">
          {task.title}
        </h2>
      </div>

      {/* Body */}
      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-3">
            <div>
              <label htmlFor={`${ids}-status`} className="mb-1 block text-xs font-semibold text-slate-600">
                {t.taskDrawer.statusLabel}
              </label>
              <select
                id={`${ids}-status`}
                value={task.status}
                disabled={!editable || pendingField === "status"}
                onChange={(event) => handleStatusChange(event.target.value as TaskStatus)}
                className={selectClass}
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t.taskStatus[status]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${ids}-priority`} className="mb-1 block text-xs font-semibold text-slate-600">
                {t.taskDrawer.priorityLabel}
              </label>
              <select
                id={`${ids}-priority`}
                value={task.priority}
                disabled={!editable || pendingField === "priority"}
                onChange={(event) => handlePriorityChange(event.target.value as TaskPriority)}
                className={selectClass}
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {t.taskPriority[priority]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${ids}-assignee`} className="mb-1 block text-xs font-semibold text-slate-600">
                {t.taskDrawer.assigneeLabel}
              </label>
              <select
                id={`${ids}-assignee`}
                value={task.assigneeId ?? ""}
                disabled={!viewer.canAssign || pendingField === "assignee"}
                onChange={(event) => handleAssigneeChange(event.target.value)}
                className={`${selectClass} truncate`}
              >
                <option value="">{t.common.unassigned}</option>
                {assigneeOptions.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.id === viewer.id ? `${member.name} (${t.common.you})` : member.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {!editable && <p className="text-xs text-slate-500">{t.taskDrawer.readOnlyHint}</p>}
          {editable && !viewer.canAssign && <p className="text-xs text-slate-500">{t.taskDrawer.assignReadOnlyHint}</p>}
        </div>

        <section aria-labelledby={`${ids}-description`} className="space-y-2">
          <h3 id={`${ids}-description`} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t.taskDrawer.descriptionHeading}
          </h3>
          <p className="whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-700">
            {task.description || <span className="text-slate-400">{t.taskDrawer.noDescription}</span>}
          </p>
        </section>

        <section aria-labelledby={`${ids}-details`} className="space-y-2">
          <h3 id={`${ids}-details`} className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {t.taskDrawer.detailsHeading}
          </h3>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 p-3">
              <dt className="text-xs text-slate-500">{t.taskDrawer.createdBy}</dt>
              <dd className="mt-0.5 truncate font-medium text-slate-800">
                {task.creatorId === viewer.id ? t.common.you : task.creatorName || "-"}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <dt className="text-xs text-slate-500">{t.taskDrawer.createdAt}</dt>
              <dd className="mt-0.5 font-medium text-slate-800">
                <time dateTime={task.createdAt}>{formatDate(task.createdAt, locale)}</time>
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <dt className="text-xs text-slate-500">{t.taskDrawer.dueDate}</dt>
              <dd className={`mt-0.5 font-medium ${overdue ? "text-rose-600" : "text-slate-800"}`}>
                {task.dueDate ? (
                  <>
                    <time dateTime={task.dueDate}>{formatDate(task.dueDate, locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</time>
                    {overdue && <span className="ml-1 text-xs font-semibold">({t.tasks.overdue})</span>}
                  </>
                ) : (
                  <span className="text-slate-400">{t.tasks.noDueDate}</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        {attachments.length > 0 && (
          <section aria-labelledby={`${ids}-attachments`} className="space-y-2">
            <h3
              id={`${ids}-attachments`}
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
            >
              <Paperclip className="h-3.5 w-3.5" aria-hidden="true" />
              {t.taskDrawer.attachmentsHeading(attachments.length)}
            </h3>
            <ul className="space-y-1.5">
              {attachments.map((attachment) => {
                const href = safeExternalUrl(attachment.fileUrl);
                return (
                  <li
                    key={attachment.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-sm"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Paperclip className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                      <span className="truncate font-medium text-slate-800">{attachment.fileName}</span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatFileSize(attachment.fileSize, locale)}
                      </span>
                    </div>
                    {href && (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t.taskDrawer.openAttachment(attachment.fileName)}
                        className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 ${focusRing}`}
                      >
                        {t.taskDrawer.open}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <section aria-labelledby={`${ids}-comments`} className="space-y-4 border-t border-slate-200 pt-5">
          <h3
            id={`${ids}-comments`}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
          >
            <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
            {t.taskDrawer.commentsHeading(loadState === "ready" ? comments.length : task.commentsCount)}
          </h3>

          {loadState === "loading" && (
            <p className="flex items-center gap-2 py-4 text-sm text-slate-500" role="status">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t.taskDrawer.commentsLoading}
            </p>
          )}

          {loadState === "error" && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <span>{t.taskDrawer.commentsError}</span>
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold hover:bg-rose-100 ${focusRing}`}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                {t.common.retry}
              </button>
            </div>
          )}

          {loadState === "ready" &&
            (comments.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-sm text-slate-500">
                {t.taskDrawer.noComments}
              </p>
            ) : (
              <ul className="space-y-3">
                {comments.map((comment) => (
                  <li key={comment.id} className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-3.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex min-w-0 items-center gap-2">
                        <UserAvatar name={comment.userName} src={comment.userAvatar} />
                        <span className="truncate text-sm font-semibold text-slate-900">
                          {comment.userId === viewer.id ? t.common.you : comment.userName || "-"}
                        </span>
                      </div>
                      <time
                        dateTime={comment.createdAt}
                        title={formatDateTime(comment.createdAt, locale)}
                        className="shrink-0 text-slate-500"
                      >
                        {formatRelative(comment.createdAt, locale)}
                      </time>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{comment.content}</p>
                  </li>
                ))}
              </ul>
            ))}

          <form onSubmit={handleAddComment} className="space-y-2 pt-1" noValidate>
            <label htmlFor={`${ids}-comment`} className="block text-xs font-semibold text-slate-600">
              {t.taskDrawer.commentLabel}
            </label>
            <textarea
              id={`${ids}-comment`}
              value={newComment}
              onChange={(event) => {
                setNewComment(event.target.value);
                if (commentError) setCommentError(null);
              }}
              placeholder={t.taskDrawer.commentPlaceholder}
              rows={3}
              maxLength={COMMENT_MAX}
              aria-describedby={`${ids}-comment-count`}
              className={`${inputClass} resize-none`}
            />
            <FormError message={commentError} />
            <div className="flex items-center justify-between gap-2">
              <span id={`${ids}-comment-count`} className="text-xs text-slate-500">
                {t.common.characterCount(newComment.length, COMMENT_MAX)}
              </span>
              <button
                type="submit"
                disabled={isSubmitting || newComment.trim().length === 0}
                className={primaryButtonClass}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                <span>{isSubmitting ? t.taskDrawer.sending : t.taskDrawer.sendComment}</span>
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 p-4">
        {deletable ? (
          confirmingDelete ? (
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.taskDrawer.deleteConfirm}>
              <span className="text-sm font-medium text-rose-700">{t.taskDrawer.deleteConfirm}</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className={`inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60 ${focusRing}`}
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isDeleting ? t.taskDrawer.deleting : t.taskDrawer.deleteConfirmYes}
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                disabled={isDeleting}
                className={`rounded-xl px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-200/60 ${focusRing}`}
              >
                {t.common.cancel}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 ${focusRing}`}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              {t.taskDrawer.deleteTask}
            </button>
          )
        ) : (
          <span />
        )}

        <button type="button" onClick={onClose} className={secondaryButtonClass}>
          {t.common.close}
        </button>
      </div>
    </DialogFrame>
  );
}

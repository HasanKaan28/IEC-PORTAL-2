"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Clock, MessageSquare, Paperclip } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate } from "@/lib/i18n/format";
import { tasksProjectsText } from "@/lib/i18n/portal/tasks-projects";
import {
  TASK_STATUSES,
  canEditTask,
  isTaskOverdue,
  type TaskItem,
  type TaskStatus,
  type TaskViewer,
} from "@/lib/tasks/task-types";
import { PriorityBadge, TASK_STATUS_STYLES, UserAvatar, focusRing } from "./shared-ui";
import { MemberName } from "@/components/portal/MemberCard";

interface TaskKanbanBoardProps {
  tasks: TaskItem[];
  viewer: TaskViewer;
  onSelectTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
}

function neighbourStatus(current: TaskStatus, step: -1 | 1): TaskStatus | null {
  const index = TASK_STATUSES.indexOf(current) + step;
  return index >= 0 && index < TASK_STATUSES.length ? TASK_STATUSES[index] : null;
}

export default function TaskKanbanBoard({ tasks, viewer, onSelectTask, onUpdateStatus }: TaskKanbanBoardProps) {
  const { locale } = useLocale();
  const t = tasksProjectsText[locale];

  return (
    <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4">
      {TASK_STATUSES.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);
        const headingId = `task-column-${status}`;

        return (
          <section
            key={status}
            aria-labelledby={headingId}
            className="flex min-h-[320px] flex-col rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
          >
            <div className="mb-3 flex items-center justify-between px-1 py-1">
              <h2 id={headingId} className="flex items-center gap-2 font-display text-sm font-semibold text-slate-800">
                <span className={`h-2.5 w-2.5 rounded-full ${TASK_STATUS_STYLES[status].dot}`} aria-hidden="true" />
                {t.taskStatus[status]}
              </h2>
              <span
                className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600"
                aria-label={t.tasks.columnCount(columnTasks.length)}
              >
                {columnTasks.length}
              </span>
            </div>

            {columnTasks.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
                {t.tasks.columnEmpty}
              </p>
            ) : (
              <ul className="flex-1 space-y-3">
                {columnTasks.map((task) => {
                  const previous = neighbourStatus(task.status, -1);
                  const next = neighbourStatus(task.status, 1);
                  const editable = canEditTask(viewer, task);
                  const overdue = isTaskOverdue(task);

                  return (
                    <li key={task.id}>
                      <article className="group relative space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:border-brand-300 hover:shadow-md">
                        <div className="flex items-center justify-between gap-2">
                          <PriorityBadge priority={task.priority} label={t.taskPriority[task.priority]} />
                          <span className="max-w-[60%] truncate text-xs text-slate-500">
                            {task.projectName ?? t.common.noProject}
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold leading-snug text-slate-900">
                          <button
                            type="button"
                            onClick={() => onSelectTask(task.id)}
                            aria-label={t.tasks.openDetails(task.title)}
                            className={`line-clamp-2 rounded text-left transition-colors group-hover:text-brand-700 after:absolute after:inset-0 after:rounded-xl after:content-[''] ${focusRing}`}
                          >
                            {task.title}
                          </button>
                        </h3>

                        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
                          <div className="flex min-w-0 items-center gap-1.5">
                            <UserAvatar name={task.assigneeName} src={task.assigneeAvatar} />
                            <span className="truncate font-medium text-slate-700">
                              {task.assigneeId === viewer.id ? (
                                t.common.you
                              ) : task.assigneeId ? (
                                // Sits above the card-wide title link so the name opens the member card.
                                <MemberName userId={task.assigneeId} name={task.assigneeName || "-"} className="relative z-10" />
                              ) : (
                                t.common.unassigned
                              )}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            {task.commentsCount > 0 && (
                              <span className="flex items-center gap-0.5" aria-label={t.tasks.commentCount(task.commentsCount)}>
                                <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                                <span aria-hidden="true">{task.commentsCount}</span>
                              </span>
                            )}
                            {task.attachmentsCount > 0 && (
                              <span className="flex items-center gap-0.5" aria-hidden="true">
                                <Paperclip className="h-3.5 w-3.5" />
                                {task.attachmentsCount}
                              </span>
                            )}
                            {task.dueDate && (
                              <span
                                className={`flex items-center gap-0.5 ${overdue ? "font-semibold text-rose-600" : ""}`}
                                title={overdue ? t.tasks.overdue : undefined}
                              >
                                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                                {overdue && <span className="sr-only">{`${t.tasks.overdue}: `}</span>}
                                {formatDate(task.dueDate, locale, { day: "numeric", month: "short", timeZone: "UTC" })}
                              </span>
                            )}
                          </div>
                        </div>

                        {editable && (previous || next) && (
                          <div className="relative z-10 flex items-center justify-between gap-2 pt-1">
                            {previous ? (
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(task.id, previous)}
                                aria-label={t.tasks.moveTo(task.title, t.taskStatus[previous])}
                                className={`inline-flex items-center gap-0.5 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200 ${focusRing}`}
                              >
                                <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
                                <span>{t.tasks.moveBack}</span>
                              </button>
                            ) : (
                              <span />
                            )}
                            {next && (
                              <button
                                type="button"
                                onClick={() => onUpdateStatus(task.id, next)}
                                aria-label={t.tasks.moveTo(task.title, t.taskStatus[next])}
                                className={`ml-auto inline-flex items-center gap-0.5 rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100 ${focusRing}`}
                              >
                                <span>{t.tasks.moveForward}</span>
                                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                              </button>
                            )}
                          </div>
                        )}
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

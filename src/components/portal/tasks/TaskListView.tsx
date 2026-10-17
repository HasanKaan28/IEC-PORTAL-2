"use client";

import React from "react";
import { ChevronRight, Clock, MessageSquare } from "lucide-react";
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
import { PriorityBadge, StatusBadge, TASK_STATUS_STYLES, UserAvatar, focusRing } from "./shared-ui";
import { MemberName } from "@/components/portal/MemberCard";

interface TaskListViewProps {
  tasks: TaskItem[];
  viewer: TaskViewer;
  onSelectTask: (taskId: string) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export default function TaskListView({ tasks, viewer, onSelectTask, onUpdateStatus }: TaskListViewProps) {
  const { locale } = useLocale();
  const t = tasksProjectsText[locale];

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{t.tasks.table.caption}</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">
                {t.tasks.table.task}
              </th>
              <th scope="col" className="px-4 py-3">
                {t.tasks.table.status}
              </th>
              <th scope="col" className="px-4 py-3">
                {t.tasks.table.priority}
              </th>
              <th scope="col" className="px-4 py-3">
                {t.tasks.table.assignee}
              </th>
              <th scope="col" className="px-4 py-3">
                {t.tasks.table.due}
              </th>
              <th scope="col" className="px-4 py-3 text-center">
                {t.tasks.table.comments}
              </th>
              <th scope="col" className="px-4 py-3">
                <span className="sr-only">{t.taskDrawer.dialogLabel}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const editable = canEditTask(viewer, task);
              const overdue = isTaskOverdue(task);
              const statusId = `task-status-${task.id}`;

              return (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask(task.id)}
                  className="group cursor-pointer transition-colors hover:bg-slate-50/80"
                >
                  <td className="max-w-sm px-4 py-3.5">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelectTask(task.id);
                      }}
                      aria-label={t.tasks.openDetails(task.title)}
                      className={`line-clamp-1 rounded text-left font-semibold text-slate-900 transition-colors group-hover:text-brand-700 ${focusRing}`}
                    >
                      {task.title}
                    </button>
                    <div className="mt-0.5 truncate text-xs text-slate-500">
                      {task.projectName ?? t.common.noProject}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5" onClick={(event) => event.stopPropagation()}>
                    {editable ? (
                      <>
                        <label htmlFor={statusId} className="sr-only">
                          {t.tasks.statusSelectLabel(task.title)}
                        </label>
                        <select
                          id={statusId}
                          value={task.status}
                          onChange={(event) => onUpdateStatus(task.id, event.target.value as TaskStatus)}
                          className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${TASK_STATUS_STYLES[task.status].badge}`}
                        >
                          {TASK_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {t.taskStatus[status]}
                            </option>
                          ))}
                        </select>
                      </>
                    ) : (
                      <StatusBadge status={task.status} label={t.taskStatus[task.status]} />
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5">
                    <PriorityBadge priority={task.priority} label={t.taskPriority[task.priority]} />
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <UserAvatar name={task.assigneeName} src={task.assigneeAvatar} />
                      <span className={task.assigneeId ? "font-medium text-slate-800" : "text-slate-500"}>
                        {task.assigneeId === viewer.id ? (
                          t.common.you
                        ) : task.assigneeId ? (
                          <MemberName userId={task.assigneeId} name={task.assigneeName || "-"} />
                        ) : (
                          t.common.unassigned
                        )}
                      </span>
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-xs">
                    {task.dueDate ? (
                      <span className={`flex items-center gap-1.5 ${overdue ? "font-semibold text-rose-600" : "text-slate-600"}`}>
                        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>
                          {formatDate(task.dueDate, locale, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            timeZone: "UTC",
                          })}
                        </span>
                        {overdue && (
                          <span className="rounded-md bg-rose-50 px-1.5 py-0.5 text-xs font-semibold text-rose-700">
                            {t.tasks.overdue}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-slate-400">{t.tasks.noDueDate}</span>
                    )}
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-center text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1" aria-label={t.tasks.commentCount(task.commentsCount)}>
                      <MessageSquare className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      <span aria-hidden="true">{task.commentsCount}</span>
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3.5 text-right">
                    <ChevronRight
                      className="inline h-4 w-4 text-slate-400 transition-colors group-hover:text-brand-600"
                      aria-hidden="true"
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import {
  Clock,
  MessageSquare,
  Paperclip,
  Flame,
  ArrowUp,
  Minus,
  ArrowDown,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import { TaskItem, TaskStatus, TaskPriority } from "@/lib/tasks/task-types";

interface TaskKanbanBoardProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
}

const COLUMNS: Array<{
  id: TaskStatus;
  title: string;
  dotColor: string;
  badgeBg: string;
  badgeText: string;
}> = [
  {
    id: "todo",
    title: "Yapılacak",
    dotColor: "bg-slate-400",
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-600",
  },
  {
    id: "in_progress",
    title: "Devam Ediyor",
    dotColor: "bg-amber-500",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
  },
  {
    id: "in_review",
    title: "İncelemede",
    dotColor: "bg-brand-500",
    badgeBg: "bg-brand-50",
    badgeText: "text-brand-700",
  },
  {
    id: "done",
    title: "Tamamlandı",
    dotColor: "bg-emerald-500",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
  },
];

export default function TaskKanbanBoard({
  tasks,
  onSelectTask,
  onUpdateStatus,
}: TaskKanbanBoardProps) {
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600 fill-rose-500" />
            Acil
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
            <ArrowUp className="w-3 h-3 text-orange-600" />
            Yüksek
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
            <Minus className="w-3 h-3 text-amber-600" />
            Orta
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
            <ArrowDown className="w-3 h-3 text-slate-500" />
            Düşük
          </span>
        );
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === "todo") return "in_progress";
    if (current === "in_progress") return "in_review";
    if (current === "in_review") return "done";
    return null;
  };

  const getPrevStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === "done") return "in_review";
    if (current === "in_review") return "in_progress";
    if (current === "in_progress") return "todo";
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
      {COLUMNS.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);

        return (
          <div
            key={column.id}
            className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 min-h-[580px] flex flex-col"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-2 mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${column.dotColor}`} />
                <h3 className="text-xs font-bold text-slate-800 font-display">
                  {column.title}
                </h3>
              </div>
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${column.badgeBg} ${column.badgeText}`}
              >
                {columnTasks.length}
              </span>
            </div>

            {/* Task Cards in Column */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {columnTasks.length === 0 ? (
                <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-mono">
                  Görev yok
                </div>
              ) : (
                columnTasks.map((task) => {
                  const prev = getPrevStatus(task.status);
                  const next = getNextStatus(task.status);

                  return (
                    <div
                      key={task.id}
                      onClick={() => onSelectTask(task)}
                      className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-brand-300 transition-all cursor-pointer space-y-3 group"
                    >
                      {/* Priority and Project */}
                      <div className="flex items-center justify-between gap-2">
                        {getPriorityBadge(task.priority)}
                        {task.projectName && (
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                            {task.projectName}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-semibold text-slate-900 group-hover:text-brand-600 transition-colors leading-snug line-clamp-2">
                        {task.title}
                      </h4>

                      {/* Meta Footer */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-slate-500 text-[11px]">
                        {/* Assignee */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-[9px] font-bold text-brand-700">
                            {task.assigneeAvatar ? (
                              <img
                                src={task.assigneeAvatar}
                                alt={task.assigneeName || ""}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              (task.assigneeName || "A").charAt(0)
                            )}
                          </div>
                          <span className="text-[10px] font-medium text-slate-700 truncate max-w-[90px]">
                            {task.assigneeName || "Atanmamış"}
                          </span>
                        </div>

                        {/* Counts & Due Date */}
                        <div className="flex items-center gap-2 font-mono text-[10px]">
                          {task.commentsCount > 0 && (
                            <div className="flex items-center gap-0.5 text-slate-400">
                              <MessageSquare className="w-3 h-3" />
                              <span>{task.commentsCount}</span>
                            </div>
                          )}
                          {task.dueDate && (
                            <div className="flex items-center gap-0.5 text-slate-400">
                              <Clock className="w-3 h-3" />
                              <span>
                                {new Date(task.dueDate).toLocaleDateString("tr-TR", {
                                  day: "numeric",
                                  month: "short",
                                })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Move Trigger Buttons */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="pt-1 flex items-center justify-between opacity-80 group-hover:opacity-100"
                      >
                        {prev ? (
                          <button
                            onClick={() => onUpdateStatus(task.id, prev)}
                            title="Önceki Aşamaya Taşı"
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] flex items-center gap-0.5"
                          >
                            <ChevronLeft className="w-3 h-3" />
                            <span>Geri</span>
                          </button>
                        ) : <div />}

                        {next && (
                          <button
                            onClick={() => onUpdateStatus(task.id, next)}
                            title="Sonraki Aşamaya İlerlet"
                            className="p-1 px-1.5 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 text-[10px] flex items-center gap-0.5 font-medium ml-auto"
                          >
                            <span>İlerlet</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

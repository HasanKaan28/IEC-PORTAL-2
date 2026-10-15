"use client";

import React from "react";
import {
  Clock,
  MessageSquare,
  Flame,
  ArrowUp,
  Minus,
  ArrowDown,
  ChevronRight,
} from "lucide-react";
import { TaskItem, TaskStatus, TaskPriority } from "@/lib/tasks/task-types";

interface TaskListViewProps {
  tasks: TaskItem[];
  onSelectTask: (task: TaskItem) => void;
  onUpdateStatus: (taskId: string, newStatus: TaskStatus) => void;
}

export default function TaskListView({
  tasks,
  onSelectTask,
  onUpdateStatus,
}: TaskListViewProps) {
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            <Flame className="w-3 h-3 text-rose-600 fill-rose-500" />
            Acil
          </span>
        );
      case "high":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
            <ArrowUp className="w-3 h-3 text-orange-600" />
            Yüksek
          </span>
        );
      case "medium":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <Minus className="w-3 h-3 text-amber-600" />
            Orta
          </span>
        );
      case "low":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
            <ArrowDown className="w-3 h-3 text-slate-500" />
            Düşük
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
            <tr>
              <th className="py-3 px-4">GÖREV BAŞLIĞI & PROJE</th>
              <th className="py-3 px-4">DURUM</th>
              <th className="py-3 px-4">ÖNCELİK</th>
              <th className="py-3 px-4">SORUMLU</th>
              <th className="py-3 px-4">TESLİM TARİHİ</th>
              <th className="py-3 px-4 text-center">YORUM</th>
              <th className="py-3 px-4 text-right">DETAY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 font-mono">
                  Filtreye uygun görev bulunamadı.
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 max-w-sm">
                    <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {task.title}
                    </div>
                    {task.projectName && (
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                        {task.projectName}
                      </div>
                    )}
                  </td>

                  <td
                    className="py-3.5 px-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <select
                      value={task.status}
                      onChange={(e) =>
                        onUpdateStatus(task.id, e.target.value as TaskStatus)
                      }
                      className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border font-medium focus:outline-none cursor-pointer ${
                        task.status === "done"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : task.status === "in_review"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : task.status === "in_progress"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-slate-50 text-slate-700 border-slate-200"
                      }`}
                    >
                      <option value="todo">Yapılacak</option>
                      <option value="in_progress">Devam Ediyor</option>
                      <option value="in_review">İncelemede</option>
                      <option value="done">Tamamlandı</option>
                    </select>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {getPriorityBadge(task.priority)}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[9px] font-bold text-indigo-700">
                        {task.assigneeAvatar ? (
                          <img
                            src={task.assigneeAvatar}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          (task.assigneeName || "A").charAt(0)
                        )}
                      </div>
                      <span className="text-slate-800 font-medium">
                        {task.assigneeName || "Atanmamış"}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                    {task.dueDate ? (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {new Date(task.dueDate).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center whitespace-nowrap font-mono text-[11px] text-slate-500">
                    <div className="inline-flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.commentsCount}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className="text-slate-400 group-hover:text-indigo-600 transition-colors inline-flex items-center">
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

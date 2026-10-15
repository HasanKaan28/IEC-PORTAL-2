"use client";

import React, { useState, useMemo } from "react";
import {
  Kanban,
  List as ListIcon,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Clock,
} from "lucide-react";
import { TaskItem, TaskStatus, TaskPriority } from "@/lib/tasks/task-types";
import TaskKanbanBoard from "./TaskKanbanBoard";
import TaskListView from "./TaskListView";
import TaskDetailDrawer from "./TaskDetailDrawer";
import CreateTaskModal from "./CreateTaskModal";
import { updateTaskStatusAction } from "@/lib/tasks/task-actions";

interface TasksManagerClientProps {
  initialTasks: TaskItem[];
  members: Array<{ id: string; name: string; role: string; avatar?: string }>;
  projects: Array<{ id: string; title: string }>;
}

export default function TasksManagerClient({
  initialTasks,
  members,
  projects,
}: TasksManagerClientProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | "all">(
    "all"
  );
  const [selectedAssignee, setSelectedAssignee] = useState("all");

  const [activeTask, setActiveTask] = useState<TaskItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (selectedProject !== "all" && t.projectId !== selectedProject) {
        return false;
      }
      if (selectedPriority !== "all" && t.priority !== selectedPriority) {
        return false;
      }
      if (selectedAssignee !== "all" && t.assigneeId !== selectedAssignee) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const mTitle = t.title.toLowerCase().includes(q);
        const mDesc = t.description?.toLowerCase().includes(q);
        const mProj = t.projectName?.toLowerCase().includes(q);
        const mAss = t.assigneeName?.toLowerCase().includes(q);
        return mTitle || mDesc || mProj || mAss;
      }
      return true;
    });
  }, [tasks, selectedProject, selectedPriority, selectedAssignee, searchQuery]);

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    showToast("Görev durumu güncellendi.");
    await updateTaskStatusAction(taskId, newStatus);
  };

  const handleTaskUpdated = (updatedTask: TaskItem) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setActiveTask(updatedTask);
    showToast("Görev kaydedildi.");
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setActiveTask(null);
    showToast("Görev silindi.");
  };

  const handleTaskCreated = () => {
    // In real app revalidatePath updates data; for smooth client UI we can trigger feedback
    showToast("Yeni görev başarıyla oluşturuldu.");
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">
              IEC Görev Panosu
            </h1>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {filteredTasks.length} Aktif Görev
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Linear / Agile sprint prensipleriyle takım görevlerini, donanım adımlarını ve yazılım geliştirmelerini yönetin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "kanban"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
              <span>Liste</span>
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Görev</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Görev ara (başlık, sorumlu, proje)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Project Filter */}
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 font-medium cursor-pointer"
          >
            <option value="all">Tüm Projeler</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) =>
              setSelectedPriority(e.target.value as TaskPriority | "all")
            }
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 font-medium cursor-pointer"
          >
            <option value="all">Tüm Öncelikler</option>
            <option value="urgent">Acil</option>
            <option value="high">Yüksek</option>
            <option value="medium">Orta</option>
            <option value="low">Düşük</option>
          </select>

          {/* Assignee Filter */}
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 font-medium cursor-pointer"
          >
            <option value="all">Tüm Sorumlular</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          {(selectedProject !== "all" ||
            selectedPriority !== "all" ||
            selectedAssignee !== "all" ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedProject("all");
                setSelectedPriority("all");
                setSelectedAssignee("all");
                setSearchQuery("");
              }}
              className="px-2 py-1.5 text-indigo-600 hover:underline text-[11px] font-mono"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Main View: Kanban or List */}
      {viewMode === "kanban" ? (
        <TaskKanbanBoard
          tasks={filteredTasks}
          onSelectTask={setActiveTask}
          onUpdateStatus={handleStatusUpdate}
        />
      ) : (
        <TaskListView
          tasks={filteredTasks}
          onSelectTask={setActiveTask}
          onUpdateStatus={handleStatusUpdate}
        />
      )}

      {/* Detail Slide-Over Drawer */}
      <TaskDetailDrawer
        task={activeTask}
        onClose={() => setActiveTask(null)}
        onTaskUpdated={handleTaskUpdated}
        onTaskDeleted={handleTaskDeleted}
        members={members}
      />

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTaskCreated={handleTaskCreated}
        members={members}
        projects={projects}
      />
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, Kanban, List as ListIcon, Plus, Search, SearchX } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { tasksProjectsText } from "@/lib/i18n/portal/tasks-projects";
import {
  TASK_PRIORITIES,
  type AssignableMember,
  type TaskItem,
  type TaskPriority,
  type TaskProjectOption,
  type TaskStatus,
  type TaskViewer,
} from "@/lib/tasks/task-types";
import { updateTaskStatusAction } from "@/lib/tasks/task-actions";
import TaskKanbanBoard from "./TaskKanbanBoard";
import TaskListView from "./TaskListView";
import TaskDetailDrawer from "./TaskDetailDrawer";
import CreateTaskModal from "./CreateTaskModal";
import {
  EmptyState,
  ToastRegion,
  focusRing,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  useToast,
  type ToastTone,
} from "./shared-ui";

interface TasksManagerClientProps {
  initialTasks: TaskItem[];
  members: AssignableMember[];
  projects: TaskProjectOption[];
  viewer: TaskViewer;
}

type ViewMode = "board" | "list";
const VIEW_STORAGE_KEY = "iec_tasks_view";

export default function TasksManagerClient({ initialTasks, members, projects, viewer }: TasksManagerClientProps) {
  const { locale } = useLocale();
  const t = tasksProjectsText[locale];

  // Server data is the source of truth: after an action revalidates the page (or the locale
  // changes) fresh props arrive and replace any optimistic local state.
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const { toast, showToast, dismiss } = useToast();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
      if (saved === "board" || saved === "list") setViewMode(saved);
    } catch {
      // Storage can be unavailable (private mode); the default view is fine.
    }
  }, []);

  const changeView = (mode: ViewMode) => {
    setViewMode(mode);
    try {
      window.localStorage.setItem(VIEW_STORAGE_KEY, mode);
    } catch {
      // Ignore storage failures.
    }
  };

  const activeTask = useMemo(() => tasks.find((task) => task.id === activeTaskId) ?? null, [tasks, activeTaskId]);

  const hasFilters =
    projectFilter !== "all" || priorityFilter !== "all" || assigneeFilter !== "all" || searchQuery.trim() !== "";

  const filteredTasks = useMemo(() => {
    const intlLocale = locale === "tr" ? "tr-TR" : "en-GB";
    const query = searchQuery.trim().toLocaleLowerCase(intlLocale);
    return tasks.filter((task) => {
      if (projectFilter === "none" && task.projectId) return false;
      if (projectFilter !== "all" && projectFilter !== "none" && task.projectId !== projectFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (assigneeFilter === "me" && task.assigneeId !== viewer.id) return false;
      if (assigneeFilter === "unassigned" && task.assigneeId) return false;
      if (
        assigneeFilter !== "all" &&
        assigneeFilter !== "me" &&
        assigneeFilter !== "unassigned" &&
        task.assigneeId !== assigneeFilter
      ) {
        return false;
      }
      if (!query) return true;
      return [task.title, task.description, task.projectName, task.assigneeName]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLocaleLowerCase(intlLocale).includes(query));
    });
  }, [tasks, projectFilter, priorityFilter, assigneeFilter, searchQuery, locale, viewer.id]);

  const clearFilters = () => {
    setProjectFilter("all");
    setPriorityFilter("all");
    setAssigneeFilter("all");
    setSearchQuery("");
  };

  const patchTask = useCallback((taskId: string, patch: Partial<TaskItem>) => {
    setTasks((previous) => previous.map((task) => (task.id === taskId ? { ...task, ...patch } : task)));
  }, []);

  const notify = useCallback((message: string, tone: ToastTone = "success") => showToast(message, tone), [showToast]);

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    const previous = tasks.find((task) => task.id === taskId);
    if (!previous || previous.status === newStatus) return;

    patchTask(taskId, { status: newStatus });
    const result = await updateTaskStatusAction(taskId, newStatus);
    if (result.success) {
      notify(t.tasks.toast.statusUpdated);
    } else {
      patchTask(taskId, { status: previous.status });
      notify(result.error, "error");
    }
  };

  const handleTaskDeleted = (taskId: string) => {
    setTasks((previous) => previous.filter((task) => task.id !== taskId));
    setActiveTaskId(null);
    notify(t.tasks.toast.deleted);
  };

  const handleTaskCreated = () => {
    setIsCreateOpen(false);
    notify(t.tasks.toast.created);
  };

  const selectClass = `${inputClass} cursor-pointer py-2 sm:w-auto`;

  return (
    <div className="space-y-6">
      <ToastRegion toast={toast} onDismiss={dismiss} dismissLabel={t.common.dismissToast} />

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-bold text-slate-900">{t.tasks.heading}</h1>
            <span className="rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
              {t.tasks.countBadge(tasks.length)}
            </span>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{t.tasks.intro}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label={t.tasks.viewLabel}
            className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 text-sm"
          >
            {(
              [
                { mode: "board", label: t.tasks.viewBoard, icon: Kanban },
                { mode: "list", label: t.tasks.viewList, icon: ListIcon },
              ] as const
            ).map(({ mode, label, icon: Icon }) => (
              <button
                key={mode}
                type="button"
                aria-pressed={viewMode === mode}
                onClick={() => changeView(mode)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-colors ${focusRing} ${
                  viewMode === mode ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <button type="button" onClick={() => setIsCreateOpen(true)} className={primaryButtonClass}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{t.tasks.newTask}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      {tasks.length > 0 && (
        <section
          aria-label={t.tasks.filtersLabel}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between"
        >
          <div className="relative w-full lg:max-w-sm">
            <label htmlFor="task-search" className="sr-only">
              {t.tasks.searchLabel}
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="task-search"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t.tasks.searchPlaceholder}
              className={`${inputClass} pl-9`}
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <label htmlFor="task-filter-project" className="sr-only">
              {t.tasks.filterProjectLabel}
            </label>
            <select
              id="task-filter-project"
              value={projectFilter}
              onChange={(event) => setProjectFilter(event.target.value)}
              className={selectClass}
            >
              <option value="all">{t.tasks.allProjects}</option>
              <option value="none">{t.common.noProject}</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>

            <label htmlFor="task-filter-priority" className="sr-only">
              {t.tasks.filterPriorityLabel}
            </label>
            <select
              id="task-filter-priority"
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as TaskPriority | "all")}
              className={selectClass}
            >
              <option value="all">{t.tasks.allPriorities}</option>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {t.taskPriority[priority]}
                </option>
              ))}
            </select>

            <label htmlFor="task-filter-assignee" className="sr-only">
              {t.tasks.filterAssigneeLabel}
            </label>
            <select
              id="task-filter-assignee"
              value={assigneeFilter}
              onChange={(event) => setAssigneeFilter(event.target.value)}
              className={selectClass}
            >
              <option value="all">{t.tasks.allAssignees}</option>
              <option value="me">{t.tasks.assignedToMe}</option>
              <option value="unassigned">{t.common.unassigned}</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className={`rounded-lg px-2 py-1.5 text-sm font-medium text-brand-700 hover:bg-brand-50 ${focusRing}`}
              >
                {t.tasks.clearFilters}
              </button>
            )}
          </div>
        </section>
      )}

      {/* Content */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title={t.tasks.emptyTitle}
          text={t.tasks.emptyText}
          action={
            <button type="button" onClick={() => setIsCreateOpen(true)} className={primaryButtonClass}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>{t.tasks.newTask}</span>
            </button>
          }
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title={t.tasks.noResultsTitle}
          text={t.tasks.noResultsText}
          action={
            <button type="button" onClick={clearFilters} className={secondaryButtonClass}>
              {t.tasks.clearFilters}
            </button>
          }
        />
      ) : viewMode === "board" ? (
        <TaskKanbanBoard
          tasks={filteredTasks}
          viewer={viewer}
          onSelectTask={setActiveTaskId}
          onUpdateStatus={handleStatusUpdate}
        />
      ) : (
        <TaskListView
          tasks={filteredTasks}
          viewer={viewer}
          onSelectTask={setActiveTaskId}
          onUpdateStatus={handleStatusUpdate}
        />
      )}

      {activeTask && (
        <TaskDetailDrawer
          key={activeTask.id}
          task={activeTask}
          viewer={viewer}
          members={members}
          onClose={() => setActiveTaskId(null)}
          onTaskPatched={patchTask}
          onTaskDeleted={handleTaskDeleted}
          notify={notify}
        />
      )}

      {isCreateOpen && (
        <CreateTaskModal
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleTaskCreated}
          members={members}
          projects={projects}
          viewer={viewer}
        />
      )}
    </div>
  );
}

import type { UserRole } from "@/lib/rbac/permissions";

export const TASK_STATUSES = ["todo", "in_progress", "in_review", "done"] as const;
export const TASK_PRIORITIES = ["urgent", "high", "medium", "low"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export interface TaskItem {
  id: string;
  projectId: string | null;
  /** Project title in the request locale, or null for a general task. */
  projectName: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneeAvatar: string | null;
  creatorId: string;
  creatorName: string | null;
  commentsCount: number;
  attachmentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCommentItem {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  createdAt: string;
}

export interface TaskAttachmentItem {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string | null;
  uploaderName: string | null;
  createdAt: string;
}

export interface AssignableMember {
  id: string;
  name: string;
  avatar: string | null;
  /** Highest club role, for display only. */
  role: UserRole;
}

export interface TaskProjectOption {
  id: string;
  title: string;
}

/** What the signed-in user may do on the board. Built on the server from the session; UI gating only. */
export interface TaskViewer {
  id: string;
  canAssign: boolean;
  canManage: boolean;
}

export interface DashboardSummaryData {
  userTaskCount: number;
  todoCount: number;
  inProgressCount: number;
  inReviewCount: number;
  doneCount: number;
  userActiveProjectsCount: number;
  upcomingEventsCount: number;
  recentTasks: TaskItem[];
}

/** Assignee, creator or a tasks.manage holder may change status and priority. */
export function canEditTask(
  viewer: TaskViewer,
  task: { assigneeId: string | null; creatorId: string }
): boolean {
  return viewer.canManage || task.assigneeId === viewer.id || task.creatorId === viewer.id;
}

/** Only the creator or a tasks.manage holder may delete a task. */
export function canDeleteTask(viewer: TaskViewer, task: { creatorId: string }): boolean {
  return viewer.canManage || task.creatorId === viewer.id;
}

export function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value);
}

export function isTaskPriority(value: string): value is TaskPriority {
  return (TASK_PRIORITIES as readonly string[]).includes(value);
}

/**
 * Due dates are calendar days. They are stored at 12:00 UTC so the same day shows in every
 * time zone, and a task counts as overdue once that day has fully passed.
 */
export function dueDateToIso(day: string): string {
  return `${day}T12:00:00.000Z`;
}

export function isTaskOverdue(task: { dueDate: string | null; status: TaskStatus }, now: number = Date.now()): boolean {
  if (!task.dueDate || task.status === "done") return false;
  const due = new Date(task.dueDate).getTime();
  return Number.isFinite(due) && due + 12 * 60 * 60 * 1000 < now;
}

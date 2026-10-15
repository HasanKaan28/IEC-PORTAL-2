export type TaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TaskItem {
  id: string;
  projectId?: string | null;
  projectName?: string | null;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  assigneeId?: string | null;
  assigneeName?: string | null;
  assigneeAvatar?: string | null;
  assigneeRole?: string | null;
  creatorId: string;
  creatorName: string;
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
  userRole: string;
  userAvatar?: string | null;
  content: string;
  createdAt: string;
}

export interface TaskAttachmentItem {
  id: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType?: string | null;
  uploaderName: string;
  createdAt: string;
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

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import type { SupportedLocale } from "@/lib/i18n/translations";
import { ROLE_HIERARCHY, type UserRole } from "@/lib/rbac/permissions";
import {
  isTaskPriority,
  isTaskStatus,
  type AssignableMember,
  type DashboardSummaryData,
  type TaskAttachmentItem,
  type TaskCommentItem,
  type TaskItem,
  type TaskPriority,
  type TaskProjectOption,
  type TaskStatus,
} from "./task-types";

/**
 * Read-only task queries for server components and actions. They use the user-scoped client, so
 * RLS applies, and return empty results (never sample data) when Supabase is not configured.
 */

const TASK_SELECT = `
  id, project_id, title, description, status, priority, due_date, assignee_id, creator_id, created_at, updated_at,
  project:project_id (title_tr, title_en),
  assignee:assignee_id (full_name, avatar_url),
  creator:creator_id (full_name),
  task_comments (count),
  task_attachments (count)
`;

interface TaskRow {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  due_date: string | null;
  assignee_id: string | null;
  creator_id: string;
  created_at: string;
  updated_at: string;
  project: { title_tr: string; title_en: string } | null;
  assignee: { full_name: string | null; avatar_url: string | null } | null;
  creator: { full_name: string | null } | null;
  task_comments: Array<{ count: number }> | null;
  task_attachments: Array<{ count: number }> | null;
}

function pickTitle(project: { title_tr: string; title_en: string } | null, locale: SupportedLocale): string | null {
  if (!project) return null;
  return (locale === "en" ? project.title_en : project.title_tr) || project.title_tr || project.title_en || null;
}

function mapTaskRow(row: TaskRow, locale: SupportedLocale): TaskItem {
  return {
    id: row.id,
    projectId: row.project_id,
    projectName: pickTitle(row.project, locale),
    title: row.title,
    description: row.description,
    status: (isTaskStatus(row.status) ? row.status : "todo") as TaskStatus,
    priority: (isTaskPriority(row.priority) ? row.priority : "medium") as TaskPriority,
    dueDate: row.due_date,
    assigneeId: row.assignee_id,
    assigneeName: row.assignee?.full_name ?? null,
    assigneeAvatar: row.assignee?.avatar_url ?? null,
    creatorId: row.creator_id,
    creatorName: row.creator?.full_name ?? null,
    commentsCount: row.task_comments?.[0]?.count ?? 0,
    attachmentsCount: row.task_attachments?.[0]?.count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export interface TaskFilters {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  projectId?: string | "all";
  assigneeId?: string | "all";
  query?: string;
}

export async function getTasks(filters?: TaskFilters, localeOverride?: SupportedLocale): Promise<TaskItem[]> {
  if (!isSupabaseConfigured()) return [];
  const locale = localeOverride ?? (await getServerLocale());

  try {
    const supabase = await createClient();
    let query = (supabase.from("tasks") as any)
      .select(TASK_SELECT)
      .order("created_at", { ascending: false })
      .limit(500);

    if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);
    if (filters?.priority && filters.priority !== "all") query = query.eq("priority", filters.priority);
    if (filters?.projectId && filters.projectId !== "all") query = query.eq("project_id", filters.projectId);
    if (filters?.assigneeId && filters.assigneeId !== "all") query = query.eq("assignee_id", filters.assigneeId);

    const { data, error } = await query;
    if (error) {
      console.error("[tasks] list query failed", error);
      return [];
    }

    let tasks = ((data as TaskRow[] | null) ?? []).map((row) => mapTaskRow(row, locale));

    const text = filters?.query?.trim().toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-GB");
    if (text) {
      tasks = tasks.filter((task) =>
        [task.title, task.description, task.projectName, task.assigneeName]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLocaleLowerCase(locale === "tr" ? "tr-TR" : "en-GB").includes(text))
      );
    }
    return tasks;
  } catch (error) {
    console.error("[tasks] list query failed", error);
    return [];
  }
}

export async function getTaskById(taskId: string): Promise<TaskItem | null> {
  if (!isSupabaseConfigured()) return null;
  const locale = await getServerLocale();
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("tasks") as any).select(TASK_SELECT).eq("id", taskId).maybeSingle();
    if (error || !data) return null;
    return mapTaskRow(data as TaskRow, locale);
  } catch {
    return null;
  }
}

export async function getTaskComments(taskId: string): Promise<TaskCommentItem[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await (supabase.from("task_comments") as any)
    .select("id, task_id, user_id, content, created_at, author:user_id (full_name, avatar_url)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true })
    .limit(300);
  if (error) throw error;

  type CommentRow = {
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    created_at: string;
    author: { full_name: string | null; avatar_url: string | null } | null;
  };

  return ((data as CommentRow[] | null) ?? []).map((row) => ({
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    userName: row.author?.full_name || "",
    userAvatar: row.author?.avatar_url ?? null,
    content: row.content,
    createdAt: row.created_at,
  }));
}

export async function getTaskAttachments(taskId: string): Promise<TaskAttachmentItem[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await (supabase.from("task_attachments") as any)
    .select("id, task_id, file_name, file_url, file_size, file_type, created_at, uploader:uploader_id (full_name)")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw error;

  type AttachmentRow = {
    id: string;
    task_id: string;
    file_name: string;
    file_url: string;
    file_size: number | string | null;
    file_type: string | null;
    created_at: string;
    uploader: { full_name: string | null } | null;
  };

  return ((data as AttachmentRow[] | null) ?? []).map((row) => ({
    id: row.id,
    taskId: row.task_id,
    fileName: row.file_name,
    fileUrl: row.file_url,
    fileSize: Number(row.file_size ?? 0),
    fileType: row.file_type,
    uploaderName: row.uploader?.full_name ?? null,
    createdAt: row.created_at,
  }));
}

function highestRole(roles: UserRole[]): UserRole {
  return roles.reduce<UserRole>(
    (best, role) => ((ROLE_HIERARCHY[role] ?? 0) > (ROLE_HIERARCHY[best] ?? 0) ? role : best),
    "member"
  );
}

export async function getAssignableMembers(): Promise<AssignableMember[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const [profilesResult, rolesResult] = await Promise.all([
      (supabase.from("profiles") as any).select("id, full_name, avatar_url").order("full_name").limit(1000),
      (supabase.from("user_roles") as any).select("user_id, role"),
    ]);
    if (profilesResult.error) {
      console.error("[tasks] member query failed", profilesResult.error);
      return [];
    }

    const rolesByUser = new Map<string, UserRole[]>();
    for (const row of (rolesResult.data as Array<{ user_id: string; role: UserRole }> | null) ?? []) {
      const list = rolesByUser.get(row.user_id) ?? [];
      list.push(row.role);
      rolesByUser.set(row.user_id, list);
    }

    return ((profilesResult.data as Array<{ id: string; full_name: string | null; avatar_url: string | null }> | null) ?? []).map(
      (profile) => ({
        id: profile.id,
        name: profile.full_name || "",
        avatar: profile.avatar_url,
        role: highestRole(rolesByUser.get(profile.id) ?? []),
      })
    );
  } catch (error) {
    console.error("[tasks] member query failed", error);
    return [];
  }
}

export async function getAvailableProjects(localeOverride?: SupportedLocale): Promise<TaskProjectOption[]> {
  if (!isSupabaseConfigured()) return [];
  const locale = localeOverride ?? (await getServerLocale());
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("projects") as any)
      .select("id, title_tr, title_en")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) {
      console.error("[tasks] project options query failed", error);
      return [];
    }
    return ((data as Array<{ id: string; title_tr: string; title_en: string }> | null) ?? []).map((project) => ({
      id: project.id,
      title: pickTitle(project, locale) ?? "",
    }));
  } catch (error) {
    console.error("[tasks] project options query failed", error);
    return [];
  }
}

const EMPTY_SUMMARY: DashboardSummaryData = {
  userTaskCount: 0,
  todoCount: 0,
  inProgressCount: 0,
  inReviewCount: 0,
  doneCount: 0,
  userActiveProjectsCount: 0,
  upcomingEventsCount: 0,
  recentTasks: [],
};

/**
 * Dashboard numbers for the signed-in user: tasks assigned to them, projects they belong to that
 * are not completed, and upcoming club events. recentTasks are their most recently updated open tasks.
 */
export async function getDashboardSummaryData(): Promise<DashboardSummaryData> {
  const user = await getSessionUser();
  if (!user) return EMPTY_SUMMARY;
  const locale = await getServerLocale();

  try {
    const supabase = await createClient();
    const [tasksResult, membershipsResult, eventsResult] = await Promise.all([
      (supabase.from("tasks") as any)
        .select(TASK_SELECT)
        .eq("assignee_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(500),
      (supabase.from("project_members") as any).select("project_id, project:project_id (status)").eq("user_id", user.id),
      (supabase.from("events") as any)
        .select("id", { count: "exact", head: true })
        .gte("date_time", new Date().toISOString()),
    ]);

    const tasks = ((tasksResult.data as TaskRow[] | null) ?? []).map((row) => mapTaskRow(row, locale));
    const memberships =
      (membershipsResult.data as Array<{ project_id: string; project: { status: string } | null }> | null) ?? [];

    return {
      userTaskCount: tasks.length,
      todoCount: tasks.filter((task) => task.status === "todo").length,
      inProgressCount: tasks.filter((task) => task.status === "in_progress").length,
      inReviewCount: tasks.filter((task) => task.status === "in_review").length,
      doneCount: tasks.filter((task) => task.status === "done").length,
      userActiveProjectsCount: memberships.filter((row) => row.project && row.project.status !== "completed").length,
      upcomingEventsCount: (eventsResult.count as number | null) ?? 0,
      recentTasks: tasks.filter((task) => task.status !== "done").slice(0, 4),
    };
  } catch (error) {
    console.error("[tasks] dashboard summary failed", error);
    return EMPTY_SUMMARY;
  }
}

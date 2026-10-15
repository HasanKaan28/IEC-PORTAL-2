import { createClient } from "@/lib/supabase/server";
import {
  TaskItem,
  TaskCommentItem,
  TaskAttachmentItem,
  TaskStatus,
  TaskPriority,
  DashboardSummaryData,
} from "./task-types";
import {
  initialTasks,
  initialTaskComments,
  initialTaskAttachments,
} from "./task-data";

export const memoryTasks: TaskItem[] = [...initialTasks];
export const memoryTaskComments: TaskCommentItem[] = [...initialTaskComments];
export const memoryTaskAttachments: TaskAttachmentItem[] = [...initialTaskAttachments];

export async function getTasks(filters?: {
  status?: TaskStatus | "all";
  priority?: TaskPriority | "all";
  projectId?: string | "all";
  assigneeId?: string | "all";
  query?: string;
}): Promise<TaskItem[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("tasks")
      .select("*, projects:project_id(title), profiles:assignee_id(full_name, avatar_url)")
      .order("created_at", { ascending: false });

    if (filters?.status && filters.status !== "all") {
      q = q.eq("status", filters.status);
    }
    if (filters?.priority && filters.priority !== "all") {
      q = q.eq("priority", filters.priority);
    }
    if (filters?.projectId && filters.projectId !== "all") {
      q = q.eq("project_id", filters.projectId);
    }
    if (filters?.assigneeId && filters.assigneeId !== "all") {
      q = q.eq("assignee_id", filters.assigneeId);
    }

    const { data } = await q;

    if (data && (data as any[]).length > 0) {
      const tasks: TaskItem[] = (data as any[]).map((t: any) => ({
        id: t.id,
        projectId: t.project_id,
        projectName: t.projects?.title || "Genel Görev",
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.due_date,
        assigneeId: t.assignee_id,
        assigneeName: t.profiles?.full_name || "Atanmamış",
        assigneeAvatar: t.profiles?.avatar_url,
        assigneeRole: "Üye",
        creatorId: t.creator_id,
        creatorName: "Proje Lideri",
        commentsCount: 0,
        attachmentsCount: 0,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));

      return filterInMemory(tasks, filters);
    }
  } catch {
    // Fallback
  }

  return filterInMemory(memoryTasks, filters);
}

function filterInMemory(
  tasks: TaskItem[],
  filters?: {
    status?: TaskStatus | "all";
    priority?: TaskPriority | "all";
    projectId?: string | "all";
    assigneeId?: string | "all";
    query?: string;
  }
): TaskItem[] {
  let result = [...tasks];

  if (filters?.status && filters.status !== "all") {
    result = result.filter((t) => t.status === filters.status);
  }
  if (filters?.priority && filters.priority !== "all") {
    result = result.filter((t) => t.priority === filters.priority);
  }
  if (filters?.projectId && filters.projectId !== "all") {
    result = result.filter((t) => t.projectId === filters.projectId);
  }
  if (filters?.assigneeId && filters.assigneeId !== "all") {
    result = result.filter((t) => t.assigneeId === filters.assigneeId);
  }
  if (filters?.query && filters.query.trim() !== "") {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.projectName && t.projectName.toLowerCase().includes(q)) ||
        (t.assigneeName && t.assigneeName.toLowerCase().includes(q))
    );
  }

  return result;
}

export async function getTaskById(taskId: string): Promise<TaskItem | null> {
  const found = memoryTasks.find((t) => t.id === taskId);
  return found || null;
}

export async function getTaskComments(
  taskId: string
): Promise<TaskCommentItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("task_comments")
      .select("*, profiles:user_id(full_name, avatar_url)")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (data && (data as any[]).length > 0) {
      return (data as any[]).map((c: any) => ({
        id: c.id,
        taskId: c.task_id,
        userId: c.user_id,
        userName: c.profiles?.full_name || "Mühendis",
        userRole: "Üye",
        userAvatar: c.profiles?.avatar_url,
        content: c.content,
        createdAt: c.created_at,
      }));
    }
  } catch {
    // Fallback
  }

  return memoryTaskComments.filter((c) => c.taskId === taskId);
}

export async function getTaskAttachments(
  taskId: string
): Promise<TaskAttachmentItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("task_attachments")
      .select("*, profiles:uploader_id(full_name)")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    if (data && (data as any[]).length > 0) {
      return (data as any[]).map((a: any) => ({
        id: a.id,
        taskId: a.task_id,
        fileName: a.file_name,
        fileUrl: a.file_url,
        fileSize: Number(a.file_size || 0),
        fileType: a.file_type,
        uploaderName: a.profiles?.full_name || "Mühendis",
        createdAt: a.created_at,
      }));
    }
  } catch {
    // Fallback
  }

  return memoryTaskAttachments.filter((a) => a.taskId === taskId);
}

export async function getDashboardSummaryData(): Promise<DashboardSummaryData> {
  const allTasks = await getTasks();

  return {
    userTaskCount: allTasks.length,
    todoCount: allTasks.filter((t) => t.status === "todo").length,
    inProgressCount: allTasks.filter((t) => t.status === "in_progress").length,
    inReviewCount: allTasks.filter((t) => t.status === "in_review").length,
    doneCount: allTasks.filter((t) => t.status === "done").length,
    userActiveProjectsCount: 4,
    upcomingEventsCount: 2,
    recentTasks: allTasks.slice(0, 4),
  };
}

export async function getAssignableMembers(): Promise<
  Array<{ id: string; name: string; role: string; avatar?: string }>
> {
  try {
    const supabase = await createClient();
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, role, avatar_url");

    if (profiles && profiles.length > 0) {
      return profiles.map((p: any) => ({
        id: p.id,
        name: p.full_name || "Kulüp Üyesi",
        role: p.role || "Üye",
        avatar: p.avatar_url,
      }));
    }
  } catch {
    // Fallback
  }

  return [];
}

export async function getAvailableProjects(): Promise<
  Array<{ id: string; title: string }>
> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("projects").select("id, title");
    if (data && data.length > 0) {
      return data;
    }
  } catch {
    // Fallback
  }

  return [
    { id: "proj-1", title: "IUS PowerHub — Akıllı Şarj İstasyonu" },
    { id: "proj-2", title: "DevHack 2027 — 24 Saatlik Saraybosna Hackathonu" },
    { id: "proj-3", title: "IUS Kampüs Asistanı — Mobil Uygulama" },
    { id: "proj-5", title: "Güz Dönemi Başlangıç Etkinlikleri" },
    { id: "proj-6", title: "Kulüp İdari ve Resmi Başvurular" },
  ];
}

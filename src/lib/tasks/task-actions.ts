"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { TaskItem, TaskCommentItem, TaskAttachmentItem, TaskStatus, TaskPriority } from "./task-types";
import {
  memoryTasks,
  memoryTaskComments,
  getAssignableMembers,
  getAvailableProjects,
  getTaskComments,
  getTaskAttachments,
} from "./task-queries";

export async function getTaskCommentsAction(taskId: string): Promise<TaskCommentItem[]> {
  return getTaskComments(taskId);
}

export async function getTaskAttachmentsAction(taskId: string): Promise<TaskAttachmentItem[]> {
  return getTaskAttachments(taskId);
}

export async function createTaskAction(data: {
  projectId?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status?: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
}) {
  if (!data.title || data.title.trim().length < 3) {
    return { success: false, error: "Görev başlığı en az 3 karakter olmalıdır." };
  }

  const members = await getAssignableMembers();
  const projects = await getAvailableProjects();

  const assignedMember = members.find((m) => m.id === data.assigneeId);
  const selectedProject = projects.find((p) => p.id === data.projectId);

  const newTask: TaskItem = {
    id: `tsk-${Date.now()}`,
    projectId: data.projectId || null,
    projectName: selectedProject?.title || "Genel Görev",
    title: data.title.trim(),
    description: data.description?.trim() || null,
    status: data.status || "todo",
    priority: data.priority,
    dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    assigneeId: data.assigneeId || null,
    assigneeName: assignedMember?.name || "Atanmamış",
    assigneeAvatar: assignedMember?.avatar || null,
    assigneeRole: assignedMember?.role || "Üye",
    creatorId: "usr-admin",
    creatorName: "Kaan Mete Şenyıldız",
    commentsCount: 0,
    attachmentsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const admin = createAdminClient();
    await (admin.from("tasks") as any).insert({
      project_id: newTask.projectId,
      title: newTask.title,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      due_date: newTask.dueDate,
      assignee_id: newTask.assigneeId,
      creator_id: "a0000000-0000-0000-0000-000000000001",
    });
  } catch {
    // Fallback
  }

  memoryTasks.unshift(newTask);

  revalidatePath("/portal");
  revalidatePath("/portal/gorevler");
  return { success: true, task: newTask };
}

export async function updateTaskStatusAction(taskId: string, newStatus: TaskStatus) {
  try {
    const admin = createAdminClient();
    await (admin.from("tasks") as any)
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", taskId);
  } catch {
    // Fallback
  }

  const task = memoryTasks.find((t) => t.id === taskId);
  if (task) {
    task.status = newStatus;
    task.updatedAt = new Date().toISOString();
  }

  revalidatePath("/portal");
  revalidatePath("/portal/gorevler");
  return { success: true };
}

export async function updateTaskPriorityAction(taskId: string, priority: TaskPriority) {
  try {
    const admin = createAdminClient();
    await (admin.from("tasks") as any)
      .update({ priority, updated_at: new Date().toISOString() })
      .eq("id", taskId);
  } catch {
    // Fallback
  }

  const task = memoryTasks.find((t) => t.id === taskId);
  if (task) {
    task.priority = priority;
    task.updatedAt = new Date().toISOString();
  }

  revalidatePath("/portal/gorevler");
  return { success: true };
}

export async function assignTaskAction(taskId: string, assigneeId: string) {
  const members = await getAssignableMembers();
  const member = members.find((m) => m.id === assigneeId);

  try {
    const admin = createAdminClient();
    await (admin.from("tasks") as any)
      .update({ assignee_id: assigneeId, updated_at: new Date().toISOString() })
      .eq("id", taskId);
  } catch {
    // Fallback
  }

  const task = memoryTasks.find((t) => t.id === taskId);
  if (task && member) {
    task.assigneeId = assigneeId;
    task.assigneeName = member.name;
    task.assigneeAvatar = member.avatar || null;
    task.assigneeRole = member.role;
    task.updatedAt = new Date().toISOString();
  }

  revalidatePath("/portal/gorevler");
  return { success: true };
}

export async function addTaskCommentAction(taskId: string, content: string) {
  if (!content || content.trim().length < 2) {
    return { success: false, error: "Yorum en az 2 karakter olmalıdır." };
  }

  let currentUserName = "Kaan Mete Şenyıldız";
  let currentUserRole = "Kurucu Başkan";

  const cookieStore = await cookies();
  const hasDemo = cookieStore.get("iec_demo_session")?.value === "true";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: prof } = (await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()) as any;
      if (prof?.full_name) currentUserName = prof.full_name;
    }
  } catch {
    // Fallback
  }

  const newComment: TaskCommentItem = {
    id: `tc-${Date.now()}`,
    taskId,
    userId: "usr-current",
    userName: currentUserName,
    userRole: currentUserRole,
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    content: content.trim(),
    createdAt: new Date().toISOString(),
  };

  try {
    const admin = createAdminClient();
    await (admin.from("task_comments") as any).insert({
      task_id: taskId,
      user_id: "a0000000-0000-0000-0000-000000000001",
      content: content.trim(),
    });
  } catch {
    // Fallback
  }

  memoryTaskComments.push(newComment);

  const task = memoryTasks.find((t) => t.id === taskId);
  if (task) {
    task.commentsCount = (task.commentsCount || 0) + 1;
  }

  revalidatePath("/portal/gorevler");
  return { success: true, comment: newComment };
}

export async function deleteTaskAction(taskId: string) {
  try {
    const admin = createAdminClient();
    await (admin.from("tasks") as any).delete().eq("id", taskId);
  } catch {
    // Fallback
  }

  const idx = memoryTasks.findIndex((t) => t.id === taskId);
  if (idx >= 0) {
    memoryTasks.splice(idx, 1);
  }

  revalidatePath("/portal");
  revalidatePath("/portal/gorevler");
  return { success: true };
}

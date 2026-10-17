"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import {
  GuardError,
  guardedAction,
  requirePageAccess,
  requirePermission,
  userCan,
  type ActionResult,
  type SessionUser,
} from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { tasksProjectsText, type TasksProjectsText } from "@/lib/i18n/portal/tasks-projects";
import { recordAudit } from "./audit";
import { getTaskAttachments, getTaskComments } from "./task-queries";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  canDeleteTask,
  canEditTask,
  dueDateToIso,
  type TaskAttachmentItem,
  type TaskCommentItem,
  type TaskPriority,
  type TaskStatus,
  type TaskViewer,
} from "./task-types";

/**
 * Task mutations. Every action is a public endpoint, so each one authenticates the caller,
 * validates input with zod and checks permission and ownership against the stored row before
 * writing. Identity always comes from the session, never from client-supplied ids or names.
 *
 * Writes go through the user-scoped client when RLS already allows them (the caller created or
 * is assigned the task). Permission-based writes (task managers, assigners) need the service-role
 * client, which is only created after those checks pass.
 */

type ErrorText = TasksProjectsText["errors"];

async function errorText(): Promise<ErrorText> {
  return tasksProjectsText[await getServerLocale()].errors;
}

function viewerFor(user: SessionUser): TaskViewer {
  return {
    id: user.id,
    canAssign: userCan(user, "tasks.assign"),
    canManage: userCan(user, "tasks.manage"),
  };
}

function firstError(error: z.ZodError, fallback: string): string {
  return error.errors[0]?.message || fallback;
}

const emptyToNull = (value: unknown) => (value === "" || value === undefined ? null : value);

function isValidDay(day: string): boolean {
  const date = new Date(`${day}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return false;
  const year = date.getUTCFullYear();
  return date.toISOString().slice(0, 10) === day && year >= 2000 && year <= 2100;
}

interface TaskOwnership {
  id: string;
  assigneeId: string | null;
  creatorId: string;
}

async function loadTaskOwnership(taskId: string): Promise<TaskOwnership | null> {
  const supabase = await createClient();
  const { data, error } = await (supabase.from("tasks") as any)
    .select("id, assignee_id, creator_id")
    .eq("id", taskId)
    .maybeSingle();
  if (error || !data) return null;
  const row = data as { id: string; assignee_id: string | null; creator_id: string };
  return { id: row.id, assigneeId: row.assignee_id, creatorId: row.creator_id };
}

/** User-scoped client when RLS covers the write, otherwise the service-role client (after checks). */
async function writeClient(rlsAllows: boolean, t: ErrorText) {
  if (rlsAllows) return createClient();
  if (!isSupabaseAdminConfigured()) throw new GuardError(t.serverNotConfigured);
  return createAdminClient();
}

async function profileExists(userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await (supabase.from("profiles") as any).select("id").eq("id", userId).maybeSingle();
  return Boolean(data);
}

async function projectExists(projectId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await (supabase.from("projects") as any).select("id").eq("id", projectId).maybeSingle();
  return Boolean(data);
}

function revalidateTaskViews() {
  revalidatePath("/portal/gorevler");
  revalidatePath("/portal");
}

/* ------------------------------------------------------------------------------------------ */
/* Reads used by the task drawer                                                              */
/* ------------------------------------------------------------------------------------------ */

export async function getTaskCommentsAction(taskId: string): Promise<ActionResult<TaskCommentItem[]>> {
  return guardedAction(async () => {
    await requirePageAccess("tasks");
    const t = await errorText();
    const parsed = z.string().uuid().safeParse(taskId);
    if (!parsed.success) return { success: false, error: t.invalidInput };
    try {
      return { success: true, data: await getTaskComments(parsed.data) };
    } catch (error) {
      console.error("[tasks] comments query failed", error);
      return { success: false, error: t.loadFailed };
    }
  });
}

export async function getTaskAttachmentsAction(taskId: string): Promise<ActionResult<TaskAttachmentItem[]>> {
  return guardedAction(async () => {
    await requirePageAccess("tasks");
    const t = await errorText();
    const parsed = z.string().uuid().safeParse(taskId);
    if (!parsed.success) return { success: false, error: t.invalidInput };
    try {
      return { success: true, data: await getTaskAttachments(parsed.data) };
    } catch (error) {
      console.error("[tasks] attachments query failed", error);
      return { success: false, error: t.loadFailed };
    }
  });
}

/* ------------------------------------------------------------------------------------------ */
/* Create                                                                                     */
/* ------------------------------------------------------------------------------------------ */

function createTaskSchema(t: ErrorText) {
  const invalid = { errorMap: () => ({ message: t.invalidInput }) };
  return z.object({
    title: z.string(invalid).trim().min(3, t.taskTitleMin).max(200, t.taskTitleMax),
    description: z.string(invalid).trim().max(5000, t.taskDescriptionMax).optional(),
    projectId: z.preprocess(emptyToNull, z.string().uuid(t.invalidInput).nullable()),
    assigneeId: z.preprocess(emptyToNull, z.string().uuid(t.invalidInput).nullable()),
    priority: z.enum(TASK_PRIORITIES, invalid),
    status: z.enum(["todo", "in_progress"], invalid).default("todo"),
    dueDate: z.preprocess(
      emptyToNull,
      z
        .string(invalid)
        .regex(/^\d{4}-\d{2}-\d{2}$/, t.dueDateInvalid)
        .refine(isValidDay, t.dueDateInvalid)
        .nullable()
    ),
  });
}

export async function createTaskAction(input: {
  title: string;
  description?: string;
  projectId?: string | null;
  assigneeId?: string | null;
  priority: TaskPriority;
  status?: TaskStatus;
  /** Calendar day as YYYY-MM-DD. */
  dueDate?: string | null;
}): Promise<ActionResult<{ id: string }>> {
  return guardedAction(async () => {
    const user = await requirePageAccess("tasks");
    const viewer = viewerFor(user);
    const t = await errorText();

    const parsed = createTaskSchema(t).safeParse(input ?? {});
    if (!parsed.success) return { success: false, error: firstError(parsed.error, t.invalidInput) };
    const data = parsed.data;

    // Members may create tasks for themselves; assigning to someone else needs tasks.assign.
    if (data.assigneeId && data.assigneeId !== user.id && !viewer.canAssign) {
      return { success: false, error: t.taskAssignForbidden };
    }
    if (data.assigneeId && !(await profileExists(data.assigneeId))) {
      return { success: false, error: t.memberNotFound };
    }
    if (data.projectId && !(await projectExists(data.projectId))) {
      return { success: false, error: t.projectNotFound };
    }

    // RLS allows inserting a task whose creator is the caller.
    const supabase = await createClient();
    const { data: inserted, error } = await (supabase.from("tasks") as any)
      .insert({
        title: data.title,
        description: data.description ? data.description : null,
        project_id: data.projectId,
        assignee_id: data.assigneeId,
        priority: data.priority,
        status: data.status,
        due_date: data.dueDate ? dueDateToIso(data.dueDate) : null,
        creator_id: user.id,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("[tasks] create failed", error);
      return { success: false, error: t.saveFailed };
    }

    revalidateTaskViews();
    return { success: true, data: { id: (inserted as { id: string }).id } };
  });
}

/* ------------------------------------------------------------------------------------------ */
/* Status, priority, assignment                                                               */
/* ------------------------------------------------------------------------------------------ */

async function updateOwnedTask(
  taskId: unknown,
  patch: Record<string, unknown>,
  patchSchema: z.ZodTypeAny
): Promise<ActionResult> {
  const user = await requirePageAccess("tasks");
  const t = await errorText();

  const idResult = z.string().uuid().safeParse(taskId);
  const patchResult = patchSchema.safeParse(patch);
  if (!idResult.success || !patchResult.success) return { success: false, error: t.invalidInput };

  const task = await loadTaskOwnership(idResult.data);
  if (!task) return { success: false, error: t.taskNotFound };
  if (!canEditTask(viewerFor(user), task)) return { success: false, error: t.taskEditForbidden };

  const isOwner = task.creatorId === user.id || task.assigneeId === user.id;
  const client = await writeClient(isOwner, t);
  const { data, error } = await (client.from("tasks") as any)
    .update({ ...patchResult.data, updated_at: new Date().toISOString() })
    .eq("id", task.id)
    .select("id");

  if (error || !data || (data as unknown[]).length === 0) {
    console.error("[tasks] update failed", error);
    return { success: false, error: t.saveFailed };
  }

  revalidateTaskViews();
  return { success: true };
}

export async function updateTaskStatusAction(taskId: string, newStatus: TaskStatus): Promise<ActionResult> {
  return guardedAction(() =>
    updateOwnedTask(taskId, { status: newStatus }, z.object({ status: z.enum(TASK_STATUSES) }).strict())
  );
}

export async function updateTaskPriorityAction(taskId: string, priority: TaskPriority): Promise<ActionResult> {
  return guardedAction(() =>
    updateOwnedTask(taskId, { priority }, z.object({ priority: z.enum(TASK_PRIORITIES) }).strict())
  );
}

/** Assign or unassign (assigneeId null). Requires tasks.assign. */
export async function assignTaskAction(taskId: string, assigneeId: string | null): Promise<ActionResult> {
  return guardedAction(async () => {
    const user = await requirePermission("tasks.assign");
    const t = await errorText();

    const parsed = z
      .object({
        taskId: z.string().uuid(),
        assigneeId: z.preprocess(emptyToNull, z.string().uuid().nullable()),
      })
      .safeParse({ taskId, assigneeId });
    if (!parsed.success) return { success: false, error: t.invalidInput };

    const task = await loadTaskOwnership(parsed.data.taskId);
    if (!task) return { success: false, error: t.taskNotFound };

    const nextAssignee = parsed.data.assigneeId;
    if (nextAssignee && !(await profileExists(nextAssignee))) {
      return { success: false, error: t.memberNotFound };
    }

    // RLS keeps the row writable for its creator whoever the new assignee is.
    const client = await writeClient(task.creatorId === user.id, t);
    const { data, error } = await (client.from("tasks") as any)
      .update({ assignee_id: nextAssignee, updated_at: new Date().toISOString() })
      .eq("id", task.id)
      .select("id");

    if (error || !data || (data as unknown[]).length === 0) {
      console.error("[tasks] assign failed", error);
      return { success: false, error: t.saveFailed };
    }

    revalidateTaskViews();
    return { success: true };
  });
}

/* ------------------------------------------------------------------------------------------ */
/* Comments                                                                                   */
/* ------------------------------------------------------------------------------------------ */

export async function addTaskCommentAction(taskId: string, content: string): Promise<ActionResult<TaskCommentItem>> {
  return guardedAction(async () => {
    const user = await requirePageAccess("tasks");
    const t = await errorText();

    const parsed = z
      .object({
        taskId: z.string().uuid(t.invalidInput),
        content: z
          .string({ errorMap: () => ({ message: t.invalidInput }) })
          .trim()
          .min(2, t.commentMin)
          .max(2000, t.commentMax),
      })
      .safeParse({ taskId, content });
    if (!parsed.success) return { success: false, error: firstError(parsed.error, t.invalidInput) };

    const task = await loadTaskOwnership(parsed.data.taskId);
    if (!task) return { success: false, error: t.taskNotFound };

    // RLS: comments can only be inserted with user_id = the caller.
    const supabase = await createClient();
    const { data, error } = await (supabase.from("task_comments") as any)
      .insert({ task_id: task.id, user_id: user.id, content: parsed.data.content })
      .select("id, created_at")
      .single();

    if (error || !data) {
      console.error("[tasks] comment insert failed", error);
      return { success: false, error: t.saveFailed };
    }

    const row = data as { id: string; created_at: string };
    revalidateTaskViews();
    return {
      success: true,
      data: {
        id: row.id,
        taskId: task.id,
        userId: user.id,
        userName: user.fullName,
        userAvatar: user.avatarUrl,
        content: parsed.data.content,
        createdAt: row.created_at,
      },
    };
  });
}

/* ------------------------------------------------------------------------------------------ */
/* Delete                                                                                     */
/* ------------------------------------------------------------------------------------------ */

export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  return guardedAction(async () => {
    const user = await requirePageAccess("tasks");
    const t = await errorText();

    const parsed = z.string().uuid().safeParse(taskId);
    if (!parsed.success) return { success: false, error: t.invalidInput };

    const task = await loadTaskOwnership(parsed.data);
    if (!task) return { success: false, error: t.taskNotFound };
    if (!canDeleteTask(viewerFor(user), task)) return { success: false, error: t.taskDeleteForbidden };

    const client = await writeClient(task.creatorId === user.id, t);
    const { data, error } = await (client.from("tasks") as any).delete().eq("id", task.id).select("id");

    if (error || !data || (data as unknown[]).length === 0) {
      console.error("[tasks] delete failed", error);
      return { success: false, error: t.saveFailed };
    }

    await recordAudit({ actorId: user.id, action: "task.delete", targetType: "task", targetId: task.id });
    revalidateTaskViews();
    return { success: true };
  });
}

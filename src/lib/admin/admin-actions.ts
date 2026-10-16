"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { canManageRole, ROLE_HIERARCHY, type UserRole } from "@/lib/rbac/permissions";
import { guardedAction, requirePermission, type ActionResult } from "@/lib/auth/session";
import { actionText, privilegedClient, writeAuditLog } from "@/lib/admin/server-utils";

/**
 * Admin console server actions. Each one is a public HTTP endpoint, so each checks the caller's
 * permission first (requirePermission) and only then touches the database. Reads use the
 * user-scoped client so row level security applies as a second layer; writes that need the
 * service role run only after authorization.
 */

export interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  department: string | null;
  classYear: string | null;
  roles: UserRole[];
  joinedAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: string;
}

const ALL_ROLES = [
  "super_admin",
  "admin",
  "leader",
  "project_lead",
  "task_manager",
  "blog_author",
  "member",
] as const satisfies readonly UserRole[];

const AUDIT_LOG_LIMIT = 200;

function sortRoles(roles: UserRole[]): UserRole[] {
  return [...new Set(roles)].sort((a, b) => (ROLE_HIERARCHY[b] ?? 0) - (ROLE_HIERARCHY[a] ?? 0));
}

function highestRank(roles: UserRole[]): number {
  return roles.reduce((max, role) => Math.max(max, ROLE_HIERARCHY[role] ?? 0), 0);
}

/** Members with their roles, for the role management page. Requires roles.manage. */
export async function getAdminUsersAction(): Promise<ActionResult<AdminUserItem[]>> {
  return guardedAction(async () => {
    await requirePermission("roles.manage");
    const supabase = await privilegedClient(); // emails are server-only columns

    const [profilesResult, rolesResult] = await Promise.all([
      (supabase.from("profiles") as any)
        .select("id, full_name, email, department, class_year, created_at")
        .order("full_name", { ascending: true })
        .limit(2000),
      (supabase.from("user_roles") as any).select("user_id, role"),
    ]);
    if (profilesResult.error) throw profilesResult.error;
    if (rolesResult.error) throw rolesResult.error;

    const rolesByUser = new Map<string, UserRole[]>();
    for (const row of (rolesResult.data ?? []) as Array<{ user_id: string; role: UserRole }>) {
      const list = rolesByUser.get(row.user_id) ?? [];
      list.push(row.role);
      rolesByUser.set(row.user_id, list);
    }

    const users = ((profilesResult.data ?? []) as Array<{
      id: string;
      full_name: string | null;
      email: string;
      department: string | null;
      class_year: string | null;
      created_at: string;
    }>).map((profile) => {
      const roles = rolesByUser.get(profile.id) ?? [];
      return {
        id: profile.id,
        fullName: profile.full_name || profile.email.split("@")[0],
        email: profile.email,
        department: profile.department,
        classYear: profile.class_year,
        roles: sortRoles(roles.length > 0 ? roles : ["member"]),
        joinedAt: profile.created_at,
      };
    });

    return { success: true, data: users };
  });
}

const toggleRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(ALL_ROLES),
  assign: z.boolean(),
});

/**
 * Grants or removes one role. Rules (mirroring the 2026-10-17 security migration):
 * roles.manage is required; super_admin and the base member role are never changed here;
 * nobody edits their own roles; the actor must outrank both the role and the target member;
 * every change is written to audit_logs attributed to the session user.
 */
export async function toggleUserRoleAction(
  userId: string,
  targetRole: UserRole,
  assign: boolean
): Promise<ActionResult<{ roles: UserRole[] }>> {
  return guardedAction(async () => {
    const actor = await requirePermission("roles.manage");
    const t = await actionText();

    const parsed = toggleRoleSchema.safeParse({ userId, role: targetRole, assign });
    if (!parsed.success) return { success: false, error: t.invalidInput };
    const input = parsed.data;

    if (input.role === "super_admin") return { success: false, error: t.superAdminLocked };
    if (input.role === "member") return { success: false, error: t.baseRoleLocked };
    if (input.userId === actor.id) return { success: false, error: t.selfEdit };
    if (!canManageRole(actor.roles, input.role)) return { success: false, error: t.roleForbidden };

    const admin = await privilegedClient();

    const { data: target, error: targetError } = await (admin.from("profiles") as any)
      .select("id, full_name, email")
      .eq("id", input.userId)
      .maybeSingle();
    if (targetError) throw targetError;
    if (!target) return { success: false, error: t.userNotFound };

    const { data: currentRows, error: rolesError } = await (admin.from("user_roles") as any)
      .select("role")
      .eq("user_id", input.userId);
    if (rolesError) throw rolesError;
    const currentRoles = ((currentRows ?? []) as Array<{ role: UserRole }>).map((r) => r.role);

    const actorIsSuperAdmin = actor.roles.includes("super_admin");
    if (currentRoles.includes("super_admin") && !actorIsSuperAdmin) {
      return { success: false, error: t.targetOutranks };
    }
    if (!actorIsSuperAdmin && highestRank(currentRoles) >= highestRank(actor.roles)) {
      return { success: false, error: t.targetOutranks };
    }

    const alreadyHas = currentRoles.includes(input.role);
    if (input.assign === alreadyHas) {
      return {
        success: true,
        data: { roles: sortRoles(currentRoles.length > 0 ? currentRoles : ["member"]) },
        message: input.assign ? t.roleAssigned : t.roleRemoved,
      };
    }

    if (input.assign) {
      const { error } = await (admin.from("user_roles") as any).insert({
        user_id: input.userId,
        role: input.role,
        assigned_by: actor.id,
      });
      if (error) throw error;
    } else {
      const { error } = await (admin.from("user_roles") as any)
        .delete()
        .eq("user_id", input.userId)
        .eq("role", input.role);
      if (error) throw error;
    }

    try {
      await writeAuditLog(admin, {
        actorId: actor.id,
        action: input.assign ? "role.assign" : "role.remove",
        targetType: "user",
        targetId: input.userId,
        details: {
          role: input.role,
          target_name: (target.full_name as string | null) ?? null,
          target_email: (target.email as string | null) ?? null,
        },
      });
    } catch (auditError) {
      // A role change without its audit row is not allowed: undo it and report failure.
      if (input.assign) {
        await (admin.from("user_roles") as any).delete().eq("user_id", input.userId).eq("role", input.role);
      } else {
        await (admin.from("user_roles") as any).insert({
          user_id: input.userId,
          role: input.role,
          assigned_by: actor.id,
        });
      }
      throw auditError;
    }

    const nextRoles = input.assign
      ? [...currentRoles, input.role]
      : currentRoles.filter((role) => role !== input.role);

    revalidatePath("/portal/admin");
    revalidatePath("/portal/admin/roller");
    revalidatePath("/portal/admin/denetim");

    return {
      success: true,
      data: { roles: sortRoles(nextRoles.length > 0 ? nextRoles : ["member"]) },
      message: input.assign ? t.roleAssigned : t.roleRemoved,
    };
  });
}

/** Latest audit_logs rows with the actor's name. Requires audit.view. */
export async function getAuditLogsAction(): Promise<ActionResult<AuditLogItem[]>> {
  return guardedAction(async () => {
    await requirePermission("audit.view");
    const supabase = await privilegedClient(); // actor emails are server-only columns

    const { data, error } = await (supabase.from("audit_logs") as any)
      .select("id, actor_id, action, target_type, target_id, details, created_at, actor:actor_id(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(AUDIT_LOG_LIMIT);
    if (error) throw error;

    const logs = ((data ?? []) as Array<{
      id: string;
      actor_id: string | null;
      action: string;
      target_type: string;
      target_id: string | null;
      details: unknown;
      created_at: string;
      actor: { full_name: string | null; email: string | null } | null;
    }>).map((row) => ({
      id: row.id,
      actorId: row.actor_id,
      actorName: row.actor?.full_name || row.actor?.email || null,
      action: row.action,
      targetType: row.target_type,
      targetId: row.target_id,
      details:
        row.details && typeof row.details === "object" && !Array.isArray(row.details)
          ? (row.details as Record<string, unknown>)
          : null,
      createdAt: row.created_at,
    }));

    return { success: true, data: logs };
  });
}

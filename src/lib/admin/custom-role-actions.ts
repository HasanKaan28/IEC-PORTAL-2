"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ALL_PERMISSIONS, ROLE_HIERARCHY, type Permission, type UserRole } from "@/lib/rbac/permissions";
import { CUSTOM_ROLE_COLORS, type CustomRoleColor } from "@/lib/rbac/permission-catalog";
import { guardedAction, requirePermission, requireSuperAdmin, type ActionResult } from "@/lib/auth/session";
import { privilegedClient, writeAuditLog } from "@/lib/admin/server-utils";
import { getServerLocale } from "@/lib/i18n/server";
import { customRolesText } from "@/lib/i18n/portal/custom-roles";

/**
 * Custom roles: a super admin bundles individual permissions into a named role and assigns it to
 * members. Rules:
 * - creating, editing and deleting roles needs super_admin;
 * - assigning needs roles.manage; a non-super-admin may only assign roles whose permissions they
 *   hold themselves, never a role containing roles.manage, and only to members they outrank;
 * - nobody changes their own roles; every change is written to audit_logs.
 * Writes use the service role after these checks; members can only read the role tables.
 */

export interface CustomRoleItem {
  id: string;
  name: string;
  description: string | null;
  color: CustomRoleColor;
  permissions: Permission[];
  memberIds: string[];
  createdAt: string;
  /** The default role: every member holds it automatically; it can be edited but not deleted or assigned. */
  isDefault: boolean;
}

const PERMISSION_ENUM = z.enum(ALL_PERMISSIONS as [Permission, ...Permission[]]);

async function text() {
  return customRolesText[await getServerLocale()].messages;
}

/** PostgREST / Postgres codes for "table does not exist" (migration not run yet). */
function isMissingTable(error: { code?: string } | null | undefined): boolean {
  return Boolean(error && (error.code === "PGRST205" || error.code === "42P01"));
}

function highestRank(roles: UserRole[]): number {
  return roles.reduce((max, role) => Math.max(max, ROLE_HIERARCHY[role] ?? 0), 0);
}

function revalidateRoleViews() {
  revalidatePath("/portal", "layout");
  revalidatePath("/portal/admin/roller");
  revalidatePath("/portal/admin/denetim");
}

type RoleRow = {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  custom_role_permissions: Array<{ permission: string }> | null;
  user_custom_roles: Array<{ user_id: string }> | null;
  is_default?: boolean | null;
};

function toItem(row: RoleRow): CustomRoleItem {
  const color = (CUSTOM_ROLE_COLORS as readonly string[]).includes(row.color) ? (row.color as CustomRoleColor) : "brand";
  const granted = new Set((row.custom_role_permissions ?? []).map((p) => p.permission));
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    color,
    permissions: ALL_PERMISSIONS.filter((permission) => granted.has(permission)),
    memberIds: row.is_default ? [] : (row.user_custom_roles ?? []).map((r) => r.user_id),
    createdAt: row.created_at,
    isDefault: Boolean(row.is_default),
  };
}

type AdminClient = Awaited<ReturnType<typeof privilegedClient>>;

const ROLE_SELECT_BASE =
  "id, name, description, color, created_at, custom_role_permissions(permission), user_custom_roles(user_id)";

/**
 * Selects custom roles including is_default; before the 2026-10-19 migration that column does not
 * exist (Postgres 42703), so the query is repeated without it and every role counts as non-default.
 */
async function selectRoles(
  admin: AdminClient,
  refine: (query: any) => any
): Promise<{ data: any; error: any; hasDefaultColumn: boolean }> {
  const first = await refine((admin.from("custom_roles") as any).select(`${ROLE_SELECT_BASE}, is_default`));
  if (first.error?.code !== "42703") return { data: first.data, error: first.error, hasDefaultColumn: true };
  const second = await refine((admin.from("custom_roles") as any).select(ROLE_SELECT_BASE));
  return { data: second.data, error: second.error, hasDefaultColumn: false };
}

export interface CustomRolesPayload {
  roles: CustomRoleItem[];
  /** The custom roles tables do not exist yet. */
  setupRequired: boolean;
  /** The default member role migration has not been run yet. */
  defaultSetupRequired: boolean;
}

/** All custom roles (default role first) with their permissions and holders. Requires roles.manage. */
export async function getCustomRolesAction(): Promise<ActionResult<CustomRolesPayload>> {
  return guardedAction<CustomRolesPayload>(async () => {
    await requirePermission("roles.manage");
    const admin = await privilegedClient();
    const { data, error, hasDefaultColumn } = await selectRoles(admin, (q) => q.order("name", { ascending: true }));
    if (isMissingTable(error)) return { success: true, data: { roles: [], setupRequired: true, defaultSetupRequired: true } };
    if (error) throw error;
    const roles = ((data ?? []) as RoleRow[]).map(toItem).sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
    return { success: true, data: { roles, setupRequired: false, defaultSetupRequired: !hasDefaultColumn } };
  });
}

const saveSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(2).max(40),
  description: z.string().trim().max(200).optional(),
  color: z.enum(CUSTOM_ROLE_COLORS),
  permissions: z.array(PERMISSION_ENUM).max(ALL_PERMISSIONS.length),
});

/** Creates a role (no id) or updates one (with id), replacing its permission set. Super admin only. */
export async function saveCustomRoleAction(input: {
  id?: string;
  name: string;
  description?: string;
  color: CustomRoleColor;
  permissions: Permission[];
}): Promise<ActionResult<CustomRoleItem>> {
  return guardedAction(async () => {
    const actor = await requireSuperAdmin();
    const t = await text();

    const parsed = saveSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: t.invalidInput };
    const permissions = [...new Set(parsed.data.permissions)];

    const admin = await privilegedClient();

    // The default role may end up with no permissions (members then see only the overview and profile).
    let editingDefault = false;
    if (parsed.data.id) {
      const existing = await selectRoles(admin, (q) => q.eq("id", parsed.data.id).maybeSingle());
      if (isMissingTable(existing.error)) return { success: false, error: t.setupRequired };
      if (existing.error) throw existing.error;
      if (!existing.data) return { success: false, error: t.roleNotFound };
      editingDefault = Boolean((existing.data as RoleRow).is_default);
    }
    if (permissions.length === 0 && !editingDefault) return { success: false, error: t.noPermissions };

    const now = new Date().toISOString();
    const fields = {
      name: parsed.data.name,
      description: parsed.data.description ? parsed.data.description : null,
      color: parsed.data.color,
      updated_at: now,
    };

    let roleId = parsed.data.id;
    if (roleId) {
      const { data: updated, error } = await (admin.from("custom_roles") as any)
        .update(fields)
        .eq("id", roleId)
        .select("id");
      if (error?.code === "23505") return { success: false, error: t.nameTaken };
      if (isMissingTable(error)) return { success: false, error: t.setupRequired };
      if (error) throw error;
      if (!updated || (updated as unknown[]).length === 0) return { success: false, error: t.roleNotFound };
    } else {
      const { data: inserted, error } = await (admin.from("custom_roles") as any)
        .insert({ ...fields, created_by: actor.id })
        .select("id")
        .single();
      if (error?.code === "23505") return { success: false, error: t.nameTaken };
      if (isMissingTable(error)) return { success: false, error: t.setupRequired };
      if (error) throw error;
      roleId = (inserted as { id: string }).id;
    }

    // Replace the permission set: remove the ones switched off, add the ones switched on.
    let clear = (admin.from("custom_role_permissions") as any).delete().eq("role_id", roleId);
    if (permissions.length > 0) clear = clear.not("permission", "in", `(${permissions.map((p) => `"${p}"`).join(",")})`);
    const { error: clearError } = await clear;
    if (clearError) throw clearError;
    if (permissions.length > 0) {
      const { error: addError } = await (admin.from("custom_role_permissions") as any).upsert(
        permissions.map((permission) => ({ role_id: roleId, permission })),
        { onConflict: "role_id,permission", ignoreDuplicates: true }
      );
      // Page permissions are rejected by the database until the 2026-10-19 migration has run.
      if (addError?.code === "23514") return { success: false, error: t.defaultSetupRequired };
      if (addError) throw addError;
    }

    await writeAuditLog(admin, {
      actorId: actor.id,
      action: parsed.data.id ? "custom_role.update" : "custom_role.create",
      targetType: "custom_role",
      targetId: roleId ?? null,
      details: { name: parsed.data.name, permissions },
    });

    const { data: row, error: loadError } = await selectRoles(admin, (q) => q.eq("id", roleId).single());
    if (loadError) throw loadError;

    revalidateRoleViews();
    return {
      success: true,
      data: toItem(row as RoleRow),
      message: parsed.data.id ? t.saved(parsed.data.name) : t.created(parsed.data.name),
    };
  });
}

/** Deletes a role; its holders lose its permissions immediately. Super admin only. */
export async function deleteCustomRoleAction(roleId: string): Promise<ActionResult> {
  return guardedAction(async () => {
    const actor = await requireSuperAdmin();
    const t = await text();
    const parsed = z.string().uuid().safeParse(roleId);
    if (!parsed.success) return { success: false, error: t.invalidInput };

    const admin = await privilegedClient();
    const { data: role, error: loadError } = await selectRoles(admin, (q) => q.eq("id", parsed.data).maybeSingle());
    if (isMissingTable(loadError)) return { success: false, error: t.setupRequired };
    if (loadError) throw loadError;
    if (!role) return { success: false, error: t.roleNotFound };
    const item = toItem(role as RoleRow);
    if (item.isDefault) return { success: false, error: t.defaultLocked };

    const { error } = await (admin.from("custom_roles") as any).delete().eq("id", item.id);
    if (error) throw error;

    await writeAuditLog(admin, {
      actorId: actor.id,
      action: "custom_role.delete",
      targetType: "custom_role",
      targetId: item.id,
      details: { name: item.name, permissions: item.permissions, members: item.memberIds.length },
    });

    revalidateRoleViews();
    return { success: true, message: t.deleted(item.name) };
  });
}

const assignSchema = z.object({
  userId: z.string().uuid(),
  roleId: z.string().uuid(),
  assign: z.boolean(),
});

/** Gives a custom role to a member or takes it away. Requires roles.manage plus the rules above. */
export async function setUserCustomRoleAction(
  userId: string,
  roleId: string,
  assign: boolean
): Promise<ActionResult<{ memberIds: string[] }>> {
  return guardedAction(async () => {
    const actor = await requirePermission("roles.manage");
    const t = await text();

    const parsed = assignSchema.safeParse({ userId, roleId, assign });
    if (!parsed.success) return { success: false, error: t.invalidInput };
    const input = parsed.data;
    if (input.userId === actor.id) return { success: false, error: t.selfEdit };

    const admin = await privilegedClient();
    const [roleResult, targetResult, targetRolesResult] = await Promise.all([
      selectRoles(admin, (q) => q.eq("id", input.roleId).maybeSingle()),
      (admin.from("profiles") as any).select("id, full_name, email").eq("id", input.userId).maybeSingle(),
      (admin.from("user_roles") as any).select("role").eq("user_id", input.userId),
    ]);
    if (isMissingTable(roleResult.error)) return { success: false, error: t.setupRequired };
    if (roleResult.error) throw roleResult.error;
    if (targetResult.error) throw targetResult.error;
    if (targetRolesResult.error) throw targetRolesResult.error;
    if (!roleResult.data) return { success: false, error: t.roleNotFound };
    if (!targetResult.data) return { success: false, error: t.userNotFound };

    const role = toItem(roleResult.data as RoleRow);
    if (role.isDefault) return { success: false, error: t.defaultAutomatic };
    const target = targetResult.data as { id: string; full_name: string | null; email: string };
    const targetRoles = ((targetRolesResult.data ?? []) as Array<{ role: UserRole }>).map((r) => r.role);

    if (!actor.roles.includes("super_admin")) {
      if (role.permissions.includes("roles.manage")) return { success: false, error: t.rolesManageReserved };
      if (role.permissions.some((permission) => !actor.permissions.includes(permission))) {
        return { success: false, error: t.escalation };
      }
      const targetRank = highestRank(targetRoles.length > 0 ? targetRoles : ["member"]);
      if (targetRoles.includes("super_admin") || targetRank >= highestRank(actor.roles)) {
        return { success: false, error: t.targetOutranks };
      }
    }

    const alreadyHas = role.memberIds.includes(input.userId);
    const targetName = target.full_name || target.email.split("@")[0];
    if (alreadyHas !== input.assign) {
      if (input.assign) {
        const { error } = await (admin.from("user_custom_roles") as any).insert({
          user_id: input.userId,
          role_id: role.id,
          assigned_by: actor.id,
        });
        if (error) throw error;
      } else {
        const { error } = await (admin.from("user_custom_roles") as any)
          .delete()
          .eq("user_id", input.userId)
          .eq("role_id", role.id);
        if (error) throw error;
      }

      await writeAuditLog(admin, {
        actorId: actor.id,
        action: input.assign ? "custom_role.assign" : "custom_role.remove",
        targetType: "user",
        targetId: input.userId,
        details: { role: role.name, role_id: role.id, target_name: targetName, target_email: target.email },
      });
      revalidateRoleViews();
    }

    const memberIds = input.assign
      ? [...new Set([...role.memberIds, input.userId])]
      : role.memberIds.filter((id) => id !== input.userId);
    return {
      success: true,
      data: { memberIds },
      message: input.assign ? t.assigned(role.name, targetName) : t.removed(role.name, targetName),
    };
  });
}

"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Lock, Plus, Search, Users } from "lucide-react";
import { canManageRole, ROLE_HIERARCHY, ROLE_LABELS, type Permission, type UserRole } from "@/lib/rbac/permissions";
import { toggleUserRoleAction, type AdminUserItem } from "@/lib/admin/admin-actions";
import type { CustomRoleItem } from "@/lib/admin/custom-role-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { adminText } from "@/lib/i18n/portal/admin";
import { customRolesText } from "@/lib/i18n/portal/custom-roles";
import { EmptyState, Notice, PageHeader, focusRing } from "./AdminUi";
import { customRoleChipClass } from "./CustomRolesPanel";

const EDITABLE_ROLES: UserRole[] = ["super_admin", "admin", "leader", "project_lead", "task_manager", "blog_author"];

function highestRank(roles: UserRole[]): number {
  return roles.reduce((max, role) => Math.max(max, ROLE_HIERARCHY[role] ?? 0), 0);
}

function badgeClass(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "bg-brand-100 text-brand-800 border-brand-200";
    case "admin":
      return "bg-brand-50 text-brand-700 border-brand-200";
    case "leader":
      return "bg-accent-100 text-accent-800 border-accent-200";
    case "member":
      return "bg-slate-50 text-slate-600 border-slate-200";
    default:
      return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
}

interface RoleManagerProps {
  users: AdminUserItem[];
  onUsersChange: (updater: (prev: AdminUserItem[]) => AdminUserItem[]) => void;
  customRoles: CustomRoleItem[];
  onCustomAssign: (userId: string, roleId: string, assign: boolean) => Promise<{ ok: boolean; message: string }>;
  loadError: string | null;
  currentUserId: string;
  actorRoles: UserRole[];
  actorPermissions: Permission[];
}

export default function RoleManager({
  users,
  onUsersChange: setUsers,
  customRoles,
  onCustomAssign,
  loadError,
  currentUserId,
  actorRoles,
  actorPermissions,
}: RoleManagerProps) {
  const { locale } = useLocale();
  const text = adminText[locale];
  const t = text.roles;
  const ct = customRolesText[locale];

  const [search, setSearch] = useState("");
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(
    loadError ? { tone: "error", text: loadError } : null
  );

  const actorIsSuperAdmin = actorRoles.includes("super_admin");
  const actorRank = highestRank(actorRoles);
  const customRolesById = useMemo(() => new Map(customRoles.map((role) => [role.id, role])), [customRoles]);

  /** Why a custom role cannot be assigned by this actor, if that is the case. */
  const customRoleLock = (role: CustomRoleItem): string | null => {
    if (actorIsSuperAdmin) return null;
    if (role.permissions.includes("roles.manage")) return ct.messages.rolesManageReserved;
    if (role.permissions.some((p) => !actorPermissions.includes(p))) return ct.messages.escalation;
    return null;
  };

  const handleCustomToggle = async (user: AdminUserItem, role: CustomRoleItem) => {
    const has = user.customRoleIds.includes(role.id);
    setPendingKey(`${user.id}:custom:${role.id}`);
    setNotice(null);
    const outcome = await onCustomAssign(user.id, role.id, !has);
    setPendingKey(null);
    setNotice({ tone: outcome.ok ? "success" : "error", text: outcome.message });
  };

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLocaleLowerCase(locale);
    if (!q) return users;
    return users.filter((u) =>
      [u.fullName, u.email, u.department ?? "", u.classYear ?? ""].some((value) =>
        value.toLocaleLowerCase(locale).includes(q)
      )
    );
  }, [users, search, locale]);

  /** Why a member's roles cannot be edited at all, if that is the case. */
  const memberLock = (user: AdminUserItem): string | null => {
    if (user.id === currentUserId) return t.lockedSelf;
    if (!actorIsSuperAdmin && (user.roles.includes("super_admin") || highestRank(user.roles) >= actorRank)) {
      return t.lockedTarget;
    }
    return null;
  };

  /** Why one role cannot be toggled, if that is the case. */
  const roleLock = (role: UserRole): string | null => {
    if (role === "super_admin") return t.lockedSuperAdmin;
    if (!canManageRole(actorRoles, role)) return t.lockedRole;
    return null;
  };

  const handleToggle = async (user: AdminUserItem, role: UserRole) => {
    const hasRole = user.roles.includes(role);
    const key = `${user.id}:${role}`;
    setPendingKey(key);
    setNotice(null);

    const result = await toggleUserRoleAction(user.id, role, !hasRole);
    setPendingKey(null);

    if (!result.success) {
      setNotice({ tone: "error", text: result.error });
      return;
    }

    const nextRoles = result.data?.roles;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              roles: nextRoles ?? (hasRole ? u.roles.filter((r) => r !== role) : [...u.roles, role]),
            }
          : u
      )
    );
    const roleLabel = ROLE_LABELS[role][locale];
    setNotice({ tone: "success", text: hasRole ? t.removed(roleLabel, user.fullName) : t.assigned(roleLabel, user.fullName) });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <div className="relative w-full sm:w-72">
            <label htmlFor="role-search" className="sr-only">
              {t.searchLabel}
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="role-search"
              type="search"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        }
      />

      {notice && (
        <Notice tone={notice.tone} onDismiss={() => setNotice(null)} dismissLabel={text.common.dismiss}>
          {notice.text}
        </Notice>
      )}

      <p className="text-xs text-slate-500">{t.baseRoleNote}</p>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {users.length === 0 ? (
          <EmptyState icon={Users} message={t.empty} />
        ) : filteredUsers.length === 0 ? (
          <EmptyState icon={Search} message={t.noResults} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-500">
                  <th scope="col" className="px-4 py-3">{t.colMember}</th>
                  <th scope="col" className="px-4 py-3">{t.colDepartment}</th>
                  <th scope="col" className="px-4 py-3">{t.colRoles}</th>
                  <th scope="col" className="px-4 py-3 text-right">{t.colAction}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const isOpen = openUserId === user.id;
                  const panelId = `role-panel-${user.id}`;
                  const lock = memberLock(user);
                  return (
                    <React.Fragment key={user.id}>
                      <tr className="align-top">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 font-semibold text-slate-900">
                            <span>{user.fullName}</span>
                            {user.id === currentUserId && (
                              <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                                {t.you}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600">
                          <div>{user.department ?? text.common.notSet}</div>
                          <div className="text-xs text-slate-500">{user.classYear ?? text.common.notSet}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <ul className="flex flex-wrap gap-1">
                            {user.roles.map((role) => (
                              <li key={role} className={`rounded-md border px-2 py-0.5 text-xs font-medium ${badgeClass(role)}`}>
                                {ROLE_LABELS[role]?.[locale] ?? role}
                              </li>
                            ))}
                            {user.customRoleIds.map((roleId) => {
                              const role = customRolesById.get(roleId);
                              if (!role) return null;
                              return (
                                <li key={roleId} className={`rounded-md border px-2 py-0.5 text-xs font-medium ${customRoleChipClass(role.color)}`}>
                                  {role.name}
                                </li>
                              );
                            })}
                          </ul>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setOpenUserId(isOpen ? null : user.id)}
                            aria-expanded={isOpen}
                            aria-controls={panelId}
                            className={`whitespace-nowrap rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-100 ${focusRing}`}
                          >
                            {isOpen ? t.closeEdit : t.edit}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={4} className="bg-slate-50 px-4 py-4">
                            <div id={panelId} role="group" aria-label={t.panelTitle(user.fullName)} className="space-y-3">
                              <div>
                                <h3 className="text-sm font-bold text-slate-900">{t.panelTitle(user.fullName)}</h3>
                                <p className="text-xs text-slate-500">{lock ?? t.panelHint}</p>
                              </div>
                              <h4 className="pt-1 text-xs font-semibold uppercase tracking-wider text-slate-500">{ct.members.builtInHeading}</h4>
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {EDITABLE_ROLES.map((role) => {
                                  const hasRole = user.roles.includes(role);
                                  const reason = lock ?? roleLock(role);
                                  const isPending = pendingKey === `${user.id}:${role}`;
                                  return (
                                    <button
                                      key={role}
                                      type="button"
                                      aria-pressed={hasRole}
                                      disabled={Boolean(reason) || pendingKey !== null}
                                      onClick={() => handleToggle(user, role)}
                                      title={reason ?? undefined}
                                      className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left text-sm transition-colors disabled:cursor-not-allowed ${focusRing} ${
                                        hasRole
                                          ? "border-brand-300 bg-white text-slate-900"
                                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                      } ${reason ? "opacity-60" : ""}`}
                                    >
                                      <span className="flex w-full items-center justify-between gap-2 font-semibold">
                                        <span>{ROLE_LABELS[role][locale]}</span>
                                        {isPending ? (
                                          <Loader2 className="h-4 w-4 animate-spin text-brand-600" aria-hidden="true" />
                                        ) : reason ? (
                                          <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                        ) : hasRole ? (
                                          <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                                        ) : (
                                          <Plus className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                        )}
                                      </span>
                                      <span className="text-xs text-slate-500">
                                        {isPending
                                          ? t.updating
                                          : reason && !lock
                                            ? reason
                                            : hasRole
                                              ? t.assignedState
                                              : t.unassignedState}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>

                              <h4 className="pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{ct.members.customRolesHeading}</h4>
                              {customRoles.length === 0 ? (
                                <p className="text-sm text-slate-500">{ct.members.noCustomRoles}</p>
                              ) : (
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                  {customRoles.map((role) => {
                                    const has = user.customRoleIds.includes(role.id);
                                    const reason = lock ?? customRoleLock(role);
                                    const isPending = pendingKey === `${user.id}:custom:${role.id}`;
                                    return (
                                      <button
                                        key={role.id}
                                        type="button"
                                        aria-pressed={has}
                                        disabled={Boolean(reason) || pendingKey !== null}
                                        onClick={() => handleCustomToggle(user, role)}
                                        title={reason ?? undefined}
                                        className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left text-sm transition-colors disabled:cursor-not-allowed ${focusRing} ${
                                          has ? "border-brand-300 bg-white text-slate-900" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                        } ${reason ? "opacity-60" : ""}`}
                                      >
                                        <span className="flex w-full items-center justify-between gap-2 font-semibold">
                                          <span className="truncate">{role.name}</span>
                                          {isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin text-brand-600" aria-hidden="true" />
                                          ) : reason ? (
                                            <Lock className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                          ) : has ? (
                                            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                                          ) : (
                                            <Plus className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                          )}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                          {isPending
                                            ? t.updating
                                            : reason && !lock
                                              ? reason
                                              : `${ct.list.permissionCount(role.permissions.length)} · ${has ? t.assignedState : t.unassignedState}`}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useCallback, useState } from "react";
import { ShieldCheck, Users } from "lucide-react";
import type { Permission, UserRole } from "@/lib/rbac/permissions";
import type { AdminUserItem } from "@/lib/admin/admin-actions";
import { setUserCustomRoleAction, type CustomRoleItem } from "@/lib/admin/custom-role-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { customRolesText } from "@/lib/i18n/portal/custom-roles";
import { focusRing } from "./AdminUi";
import CustomRolesPanel from "./CustomRolesPanel";
import RoleManager from "./RoleManager";

type Tab = "custom" | "members";

interface RolesWorkspaceProps {
  initialUsers: AdminUserItem[];
  usersError: string | null;
  initialCustomRoles: CustomRoleItem[];
  customRolesSetupRequired: boolean;
  defaultRoleSetupRequired: boolean;
  currentUserId: string;
  actorRoles: UserRole[];
  actorPermissions: Permission[];
}

/** Roles page: build custom roles from permissions, and assign built-in or custom roles to members. */
export default function RolesWorkspace({
  initialUsers,
  usersError,
  initialCustomRoles,
  customRolesSetupRequired,
  defaultRoleSetupRequired,
  currentUserId,
  actorRoles,
  actorPermissions,
}: RolesWorkspaceProps) {
  const { locale } = useLocale();
  const t = customRolesText[locale];
  const [tab, setTab] = useState<Tab>("custom");
  const [users, setUsers] = useState<AdminUserItem[]>(initialUsers);
  const [customRoles, setCustomRoles] = useState<CustomRoleItem[]>(initialCustomRoles);
  const actorIsSuperAdmin = actorRoles.includes("super_admin");

  /** Assigns or removes a custom role and keeps both tabs in sync. */
  const assignCustomRole = useCallback(
    async (userId: string, roleId: string, assign: boolean) => {
      const result = await setUserCustomRoleAction(userId, roleId, assign);
      if (!result.success) return { ok: false, message: result.error };
      const memberIds = result.data?.memberIds;
      setCustomRoles((prev) => prev.map((role) => (role.id === roleId && memberIds ? { ...role, memberIds } : role)));
      setUsers((prev) =>
        prev.map((user) => {
          if (user.id !== userId) return user;
          const ids = new Set(user.customRoleIds);
          if (assign) ids.add(roleId);
          else ids.delete(roleId);
          return { ...user, customRoleIds: [...ids] };
        })
      );
      return { ok: true, message: result.message ?? "" };
    },
    []
  );

  const tabs: Array<{ key: Tab; label: string; icon: typeof ShieldCheck }> = [
    { key: "custom", label: t.tabs.customRoles, icon: ShieldCheck },
    { key: "members", label: t.tabs.members, icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div role="tablist" aria-label={t.tabs.label} className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1">
        {tabs.map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              id={`roles-tab-${key}`}
              aria-selected={active}
              aria-controls={`roles-panel-${key}`}
              onClick={() => setTab(key)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${focusRing} ${
                active ? "bg-white text-brand-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`roles-panel-${tab}`} aria-labelledby={`roles-tab-${tab}`}>
        {tab === "custom" ? (
          <CustomRolesPanel
            roles={customRoles}
            onRolesChange={setCustomRoles}
            users={users}
            currentUserId={currentUserId}
            actorIsSuperAdmin={actorIsSuperAdmin}
            actorPermissions={actorPermissions}
            setupRequired={customRolesSetupRequired}
            defaultSetupRequired={defaultRoleSetupRequired}
            onAssign={assignCustomRole}
          />
        ) : (
          <RoleManager
            users={users}
            customRoles={customRoles}
            onCustomAssign={assignCustomRole}
            loadError={usersError}
            currentUserId={currentUserId}
            actorRoles={actorRoles}
            actorPermissions={actorPermissions}
          />
        )}
      </div>
    </div>
  );
}

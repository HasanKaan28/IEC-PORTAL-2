import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessAdminSection } from "@/lib/admin/admin-access";
import { getAdminUsersAction } from "@/lib/admin/admin-actions";
import { getCustomRolesAction } from "@/lib/admin/custom-role-actions";
import RolesWorkspace from "../_components/RolesWorkspace";

export default async function RoleManagementPage() {
  const user = await getSessionUser();
  if (!user || !canAccessAdminSection(user, "roles")) redirect("/portal/admin");

  const [usersResult, customResult] = await Promise.all([getAdminUsersAction(), getCustomRolesAction()]);

  return (
    <RolesWorkspace
      initialUsers={usersResult.success ? usersResult.data ?? [] : []}
      usersError={usersResult.success ? null : usersResult.error}
      initialCustomRoles={customResult.success ? customResult.data?.roles ?? [] : []}
      customRolesSetupRequired={customResult.success ? Boolean(customResult.data?.setupRequired) : false}
      defaultRoleSetupRequired={customResult.success ? Boolean(customResult.data?.defaultSetupRequired) : false}
      currentUserId={user.id}
      actorRoles={user.roles}
      actorPermissions={user.permissions}
    />
  );
}

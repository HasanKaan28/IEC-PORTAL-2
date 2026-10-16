import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessAdminSection } from "@/lib/admin/admin-access";
import { getAdminUsersAction } from "@/lib/admin/admin-actions";
import RoleManager from "../_components/RoleManager";

export default async function RoleManagementPage() {
  const user = await getSessionUser();
  if (!user || !canAccessAdminSection(user, "roles")) redirect("/portal/admin");

  const result = await getAdminUsersAction();

  return (
    <RoleManager
      initialUsers={result.success ? result.data ?? [] : []}
      loadError={result.success ? null : result.error}
      currentUserId={user.id}
      actorRoles={user.roles}
    />
  );
}

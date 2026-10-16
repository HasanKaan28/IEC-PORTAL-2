import React from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessAdminSection } from "@/lib/admin/admin-access";
import { getAuditLogsAction } from "@/lib/admin/admin-actions";
import AuditLogTable from "../_components/AuditLogTable";

export default async function AuditLogsPage() {
  const user = await getSessionUser();
  if (!canAccessAdminSection(user, "audit")) redirect("/portal/admin");

  const result = await getAuditLogsAction();

  return (
    <AuditLogTable
      logs={result.success ? result.data ?? [] : []}
      loadError={result.success ? null : result.error}
    />
  );
}

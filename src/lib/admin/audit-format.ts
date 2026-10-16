import { ROLE_LABELS, type UserRole } from "@/lib/rbac/permissions";
import { adminText } from "@/lib/i18n/portal/admin";
import type { SupportedLocale } from "@/lib/i18n/translations";
import type { AuditLogItem } from "@/lib/admin/admin-actions";

/** Human-readable text for an audit_logs row (pure; used by server and client components). */

function str(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

export function auditActionLabel(action: string, locale: SupportedLocale): string {
  return adminText[locale].audit.actions[action] ?? action;
}

export function auditTargetLabel(targetType: string, locale: SupportedLocale): string {
  return adminText[locale].audit.targets[targetType] ?? targetType;
}

export function auditDetail(log: AuditLogItem, locale: SupportedLocale): string {
  const d = log.details ?? {};
  if (log.action.startsWith("role.")) {
    const role = str(d.role) as UserRole | null;
    const roleLabel = role && ROLE_LABELS[role] ? ROLE_LABELS[role][locale] : role ?? "";
    const who = str(d.target_name) ?? str(d.target_email) ?? log.targetId ?? "";
    return adminText[locale].audit.roleDetail(roleLabel, who);
  }
  if (log.action.startsWith("blog.post.")) {
    return str(d.title) ?? str(d.slug) ?? log.targetId ?? "";
  }
  if (log.action.startsWith("blog.comment.")) {
    const slug = str(d.post_slug);
    const excerpt = str(d.excerpt);
    return [slug ? `/${slug}` : null, excerpt ? `"${excerpt}"` : null].filter(Boolean).join(" ");
  }
  return Object.entries(d)
    .filter(([, value]) => value !== null && value !== undefined && typeof value !== "object")
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(", ");
}

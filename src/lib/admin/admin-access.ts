import { hasPermission, type Permission, type UserRole } from "@/lib/rbac/permissions";

/**
 * Which admin console sections a user may open. Pure helpers (no server imports) so both the
 * server layout/pages and client components can use them. UI gating only: every server action
 * still checks its own permission with requirePermission.
 */

export type AdminSectionKey =
  | "overview"
  | "roles"
  | "applications"
  | "blog"
  | "comments"
  | "audit"
  | "emails";

/** Having any of these lets a user into /portal/admin at all. */
export const ADMIN_CONSOLE_PERMISSIONS: Permission[] = [
  "roles.manage",
  "audit.view",
  "blog.moderate",
  "blog.publish",
];

export const ADMIN_SECTIONS: { key: AdminSectionKey; href: string; anyOf: Permission[] }[] = [
  { key: "overview", href: "/portal/admin", anyOf: ADMIN_CONSOLE_PERMISSIONS },
  { key: "roles", href: "/portal/admin/roller", anyOf: ["roles.manage"] },
  { key: "applications", href: "/portal/admin/basvurular", anyOf: ["applications.review"] },
  { key: "blog", href: "/portal/admin/blog", anyOf: ["blog.write", "blog.publish", "blog.moderate"] },
  { key: "comments", href: "/portal/admin/blog/yorumlar", anyOf: ["blog.moderate"] },
  { key: "audit", href: "/portal/admin/denetim", anyOf: ["audit.view"] },
  { key: "emails", href: "/portal/admin/eposta-onizleme", anyOf: ["roles.manage"] },
];

type RoleHolder = { roles: UserRole[] } | null | undefined;

export function canAccessAdminConsole(user: RoleHolder): boolean {
  return Boolean(user && ADMIN_CONSOLE_PERMISSIONS.some((p) => hasPermission(user.roles, p)));
}

export function canAccessAdminSection(user: RoleHolder, key: AdminSectionKey): boolean {
  if (!user) return false;
  const section = ADMIN_SECTIONS.find((s) => s.key === key);
  return Boolean(section && section.anyOf.some((p) => hasPermission(user.roles, p)));
}

export function visibleAdminSections(user: RoleHolder): { key: AdminSectionKey; href: string }[] {
  return ADMIN_SECTIONS.filter((s) => canAccessAdminSection(user, s.key)).map(({ key, href }) => ({
    key,
    href,
  }));
}

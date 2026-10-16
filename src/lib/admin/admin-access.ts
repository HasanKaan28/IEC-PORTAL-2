import { permissionsForRoles, type Permission, type UserRole } from "@/lib/rbac/permissions";

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

export const ADMIN_SECTIONS: { key: AdminSectionKey; href: string; anyOf: Permission[] }[] = [
  { key: "roles", href: "/portal/admin/roller", anyOf: ["roles.manage"] },
  { key: "applications", href: "/portal/admin/basvurular", anyOf: ["applications.review"] },
  { key: "blog", href: "/portal/admin/blog", anyOf: ["blog.write", "blog.publish", "blog.moderate"] },
  { key: "comments", href: "/portal/admin/blog/yorumlar", anyOf: ["blog.moderate"] },
  { key: "audit", href: "/portal/admin/denetim", anyOf: ["audit.view"] },
  { key: "emails", href: "/portal/admin/eposta-onizleme", anyOf: ["roles.manage"] },
];

/**
 * Having any of these lets a user into /portal/admin at all: every section permission, plus
 * events.qr_host for the live attendance screen that lives under the console.
 */
export const ADMIN_CONSOLE_PERMISSIONS: Permission[] = [
  ...new Set<Permission>([...ADMIN_SECTIONS.flatMap((section) => section.anyOf), "events.qr_host"]),
];

/** A session user (with resolved permissions) or anything with built-in roles. */
type RoleHolder = { roles: UserRole[]; permissions?: Permission[] } | null | undefined;

function effectivePermissions(user: NonNullable<RoleHolder>): Permission[] {
  return user.permissions ?? permissionsForRoles(user.roles);
}

export function canAccessAdminConsole(user: RoleHolder): boolean {
  if (!user) return false;
  const granted = effectivePermissions(user);
  return ADMIN_CONSOLE_PERMISSIONS.some((p) => granted.includes(p));
}

export function canAccessAdminSection(user: RoleHolder, key: AdminSectionKey): boolean {
  if (!user) return false;
  if (key === "overview") return canAccessAdminConsole(user);
  const section = ADMIN_SECTIONS.find((s) => s.key === key);
  const granted = effectivePermissions(user);
  return Boolean(section && section.anyOf.some((p) => granted.includes(p)));
}

export function visibleAdminSections(user: RoleHolder): { key: AdminSectionKey; href: string }[] {
  const overview = canAccessAdminConsole(user) ? [{ key: "overview" as const, href: "/portal/admin" }] : [];
  return [
    ...overview,
    ...ADMIN_SECTIONS.filter((s) => canAccessAdminSection(user, s.key)).map(({ key, href }) => ({ key, href })),
  ];
}

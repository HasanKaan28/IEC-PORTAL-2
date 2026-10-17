export type UserRole =
  | "super_admin"
  | "admin"
  | "leader"
  | "project_lead"
  | "task_manager"
  | "blog_author"
  | "member";

export type Permission =
  // Page access: which member pages show in the sidebar and open at all.
  | "pages.tasks"
  | "pages.projects"
  | "pages.hackathons"
  | "pages.events"
  | "pages.certificates"
  | "pages.messages"
  | "roles.manage"
  | "applications.review"
  | "audit.view"
  | "planning.manage"
  | "projects.create"
  | "projects.edit"
  | "projects.review_requests"
  | "tasks.assign"
  | "tasks.manage"
  | "blog.write"
  | "blog.publish"
  | "blog.moderate"
  | "hackathons.create"
  | "events.manage"
  | "events.qr_host"
  | "certificates.issue";

/** Every permission, in the order the role builder lists them. Keep in sync with the SQL check list. */
export const ALL_PERMISSIONS: Permission[] = [
  "pages.tasks",
  "pages.projects",
  "pages.hackathons",
  "pages.events",
  "pages.certificates",
  "pages.messages",
  "roles.manage",
  "audit.view",
  "applications.review",
  "planning.manage",
  "projects.create",
  "projects.edit",
  "projects.review_requests",
  "tasks.assign",
  "tasks.manage",
  "events.manage",
  "events.qr_host",
  "certificates.issue",
  "hackathons.create",
  "blog.write",
  "blog.publish",
  "blog.moderate",
];

/** Page permissions every member had before page access became configurable. */
export const MEMBER_PAGE_PERMISSIONS: Permission[] = [
  "pages.tasks",
  "pages.projects",
  "pages.hackathons",
  "pages.events",
  "pages.certificates",
  "pages.messages",
];

export function isPermission(value: unknown): value is Permission {
  return typeof value === "string" && (ALL_PERMISSIONS as string[]).includes(value);
}

/** Effective permissions of the built-in roles (super_admin gets everything). */
export function permissionsForRoles(roles: UserRole[]): Permission[] {
  if (roles.includes("super_admin")) return [...ALL_PERMISSIONS];
  const granted = new Set<Permission>();
  for (const role of roles) for (const permission of ROLE_PERMISSIONS[role] ?? []) granted.add(permission);
  return ALL_PERMISSIONS.filter((permission) => granted.has(permission));
}

// Keep this mapping in sync with public.role_permission_defaults (migration 20261018000000_custom_roles.sql).
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "roles.manage",
    "applications.review",
    "audit.view",
    "planning.manage",
    "projects.create",
    "projects.edit",
    "projects.review_requests",
    "tasks.assign",
    "tasks.manage",
    "blog.write",
    "blog.publish",
    "blog.moderate",
    "hackathons.create",
    "events.manage",
    "events.qr_host",
    "certificates.issue",
  ],
  admin: [
    "roles.manage",
    "applications.review",
    "audit.view",
    "planning.manage",
    "projects.create",
    "projects.edit",
    "projects.review_requests",
    "tasks.assign",
    "tasks.manage",
    "blog.write",
    "blog.publish",
    "blog.moderate",
    "hackathons.create",
    "events.manage",
    "events.qr_host",
    "certificates.issue",
  ],
  leader: [
    "roles.manage",
    "applications.review",
    "planning.manage",
    "projects.create",
    "projects.edit",
    "projects.review_requests",
    "tasks.assign",
    "tasks.manage",
    "blog.write",
    "blog.publish",
    "hackathons.create",
    "events.manage",
    "events.qr_host",
    "certificates.issue",
  ],
  project_lead: [
    "projects.edit",
    "projects.review_requests",
    "tasks.assign",
    "tasks.manage",
  ],
  task_manager: ["tasks.assign", "tasks.manage"],
  blog_author: ["blog.write", "blog.publish"],
  member: [],
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 100,
  admin: 80,
  leader: 60,
  project_lead: 40,
  task_manager: 30,
  blog_author: 20,
  member: 10,
};

export function hasPermission(userRoles: UserRole[], permission: Permission): boolean {
  if (userRoles.includes("super_admin")) return true;
  return userRoles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

export function hasRole(userRoles: UserRole[], targetRole: UserRole): boolean {
  if (userRoles.includes("super_admin")) return true;
  return userRoles.includes(targetRole);
}

export function canManageRole(actorRoles: UserRole[], targetRole: UserRole): boolean {
  if (actorRoles.includes("super_admin")) return true;
  const highestActorScore = Math.max(...actorRoles.map((r) => ROLE_HIERARCHY[r] || 0));
  const targetScore = ROLE_HIERARCHY[targetRole] || 0;
  return highestActorScore > targetScore;
}

export const ROLE_LABELS: Record<UserRole, { tr: string; en: string }> = {
  super_admin: { tr: "Süper Yönetici", en: "Super Admin" },
  admin: { tr: "Yönetici", en: "Admin" },
  leader: { tr: "Kulüp Lideri", en: "Club Leader" },
  project_lead: { tr: "Proje Lideri", en: "Project Lead" },
  task_manager: { tr: "Görev Yöneticisi", en: "Task Manager" },
  blog_author: { tr: "Blog Yazarı", en: "Blog Author" },
  member: { tr: "Kulüp Üyesi", en: "Club Member" },
};

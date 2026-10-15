export type UserRole =
  | "super_admin"
  | "admin"
  | "leader"
  | "project_lead"
  | "task_manager"
  | "blog_author"
  | "member";

export type Permission =
  | "roles.manage"
  | "applications.review"
  | "audit.view"
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

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    "roles.manage",
    "applications.review",
    "audit.view",
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

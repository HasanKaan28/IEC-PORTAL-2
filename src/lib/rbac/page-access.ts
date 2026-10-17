import type { Permission } from "./permissions";

/**
 * Member pages whose visibility is set by roles. The overview and the member's own profile are
 * always available. A page also opens for anyone holding an action permission that lives on it
 * (for example, someone who may assign tasks can always see the task board).
 */
export type PortalPage = "tasks" | "projects" | "hackathons" | "events" | "certificates" | "messages";

export const PAGE_ACCESS: Record<PortalPage, Permission[]> = {
  tasks: ["pages.tasks", "tasks.assign", "tasks.manage"],
  projects: ["pages.projects", "projects.create", "projects.edit", "projects.review_requests"],
  hackathons: ["pages.hackathons", "hackathons.create"],
  events: ["pages.events", "events.manage", "events.qr_host", "certificates.issue"],
  certificates: ["pages.certificates", "certificates.issue"],
  messages: ["pages.messages"],
};

export function canSeePage(user: { permissions: Permission[] } | null | undefined, page: PortalPage): boolean {
  if (!user) return false;
  return PAGE_ACCESS[page].some((permission) => user.permissions.includes(permission));
}

export function visiblePages(user: { permissions: Permission[] } | null | undefined): PortalPage[] {
  return (Object.keys(PAGE_ACCESS) as PortalPage[]).filter((page) => canSeePage(user, page));
}

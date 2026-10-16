export const PROJECT_STATUSES = ["concept", "in_progress", "completed"] as const;
export type PortalProjectStatus = (typeof PROJECT_STATUSES)[number];

/** Category presets offered when creating a project; labels live in the tasks-projects dictionary. */
export const PROJECT_CATEGORY_KEYS = ["hardware", "software", "ai", "robotics", "community"] as const;
export type ProjectCategoryKey = (typeof PROJECT_CATEGORY_KEYS)[number];

/** project_members.role value that marks a project lead (compared case-insensitively). */
export const PROJECT_LEAD_ROLE = "lead";
export const PROJECT_MEMBER_ROLE = "member";

export type ProjectViewerStatus = "none" | "pending" | "member" | "lead";

export type JoinRequestStatus = "pending" | "approved" | "rejected";

export interface PortalProjectItem {
  id: string;
  slug: string;
  /** Title, summary and category already resolved to the request locale. */
  title: string;
  description: string;
  category: string;
  status: PortalProjectStatus;
  accentColor: string | null;
  leadId: string | null;
  leadName: string | null;
  leadAvatar: string | null;
  membersCount: number;
  githubUrl: string | null;
  demoUrl: string | null;
  /** The signed-in user's relation to the project. */
  userStatus: ProjectViewerStatus;
}

export interface ProjectJoinRequestItem {
  id: string;
  projectId: string;
  projectTitle: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  userDepartment: string | null;
  classYear: string | null;
  message: string;
  status: JoinRequestStatus;
  reviewerNote: string | null;
  createdAt: string;
}

/** What the signed-in user may do on the projects page. Built on the server; UI gating only. */
export interface ProjectViewer {
  id: string;
  canCreate: boolean;
  /** Can open the requests drawer: holds projects.review_requests or leads at least one project. */
  canReview: boolean;
  canReviewAll: boolean;
}

export function isProjectLeadRole(role: string | null | undefined): boolean {
  return (role ?? "").trim().toLowerCase() === PROJECT_LEAD_ROLE;
}

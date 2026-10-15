export interface PortalProjectItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: "Gömülü Sistemler" | "Web & Mobil" | "Yapay Zekâ" | "Havacılık & Robotik";
  status: "planning" | "in_progress" | "completed" | "on_hold";
  leadId: string;
  leadName: string;
  leadRole: string;
  leadAvatar?: string;
  membersCount: number;
  openPositions: string[];
  githubUrl?: string;
  demoUrl?: string;
  userStatus: "none" | "pending" | "member" | "lead";
}

export interface ProjectJoinRequestItem {
  id: string;
  projectId: string;
  projectTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userDepartment: string;
  classYear: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  reviewerNote?: string | null;
  createdAt: string;
}

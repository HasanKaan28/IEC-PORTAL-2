export interface HackathonItem {
  id: string;
  title: string;
  description: string;
  locationCountry: string;
  startDate: string;
  endDate: string;
  applicationUrl: string;
  tags: string[];
  teamsCount: number;
  isOpen: boolean;
}

export interface HackathonTeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar?: string | null;
}

export interface HackathonTeamItem {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  name: string;
  description: string;
  isOpen: boolean;
  lookingFor: string[];
  leaderId: string;
  leaderName: string;
  leaderAvatar?: string | null;
  leaderRole: string;
  members: HackathonTeamMember[];
  userStatus: "none" | "pending" | "member" | "leader";
}

export interface HackathonJoinRequestItem {
  id: string;
  teamId: string;
  teamName: string;
  userId: string;
  userName: string;
  userDepartment: string;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface LookingForTeamMemberItem {
  id: string;
  name: string;
  department: string;
  classYear: string;
  skills: string[];
  statement: string;
  contactEmail: string;
  contactWhatsapp?: string | null;
  avatar?: string | null;
}

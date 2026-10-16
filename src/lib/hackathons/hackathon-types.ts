/** Maximum team size shown on team cards and enforced when a captain accepts a request. */
export const MAX_TEAM_MEMBERS = 4;

export interface HackathonItem {
  id: string;
  title: string;
  description: string;
  locationCountry: string;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD */
  endDate: string;
  applicationUrl: string;
  tags: string[];
  teamsCount: number;
  /** False once the end date has passed. */
  isOpen: boolean;
}

export interface HackathonTeamMember {
  id: string;
  name: string;
  department: string | null;
  avatar?: string | null;
  isLeader: boolean;
}

export interface HackathonTeamItem {
  id: string;
  hackathonId: string;
  hackathonTitle: string;
  name: string;
  description: string;
  isOpen: boolean;
  lookingFor: string[];
  leaderName: string;
  leaderAvatar?: string | null;
  members: HackathonTeamMember[];
  /** The signed-in user's relation to the team, computed on the server. */
  userStatus: "none" | "pending" | "member" | "leader";
}

/** A request to join one of the signed-in user's teams (only captains see these). */
export interface HackathonJoinRequestItem {
  id: string;
  teamId: string;
  teamName: string;
  userName: string;
  userDepartment: string | null;
  message: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

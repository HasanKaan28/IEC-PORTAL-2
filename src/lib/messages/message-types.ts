import type { UserRole } from "@/lib/rbac/permissions";

export interface DirectMessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

/** One row in the conversation list: the other member plus the latest message between you. */
export interface ConversationContact {
  id: string;
  name: string;
  department: string | null;
  avatarUrl: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  lastMessageFromMe: boolean;
  unreadCount: number;
}

/** Public, non-sensitive member fields used by the "new message" search. */
export interface MemberSearchResult {
  id: string;
  name: string;
  department: string | null;
  avatarUrl: string | null;
}

export interface ConversationPayload {
  contact: ConversationContact;
  messages: DirectMessageItem[];
  blockedByMe: boolean;
}

export type NotificationType = "task" | "event" | "cert" | "team" | "message" | "general";

export interface InAppNotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * Data shown on a member's profile card. For other members, email and phone are already removed
 * on the server when the member chose to hide them; the hide flags only drive the "hidden" labels.
 */
export interface ProfileCardData {
  id: string;
  fullName: string;
  email?: string | null;
  avatarUrl?: string | null;
  department?: string | null;
  classYear?: string | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  phone?: string | null;
  hidePhone?: boolean;
  hideEmail?: boolean;
  roles?: UserRole[];
  projects?: Array<{
    name: string;
    role?: string;
    accentColor?: string;
  }>;
}

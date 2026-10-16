import { createAdminClient, createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser } from "@/lib/auth/session";
import type {
  ConversationContact,
  DirectMessageItem,
  InAppNotificationItem,
  MemberSearchResult,
  NotificationType,
} from "./message-types";
import { isUuid, safeHttpUrl, safeInternalLink } from "./utils";

/**
 * Server-side reads for messages and notifications. Nothing here is a server action: functions
 * that take a user id must only be called with the id of the signed-in user (from getSessionUser /
 * requireUser). Reads go through the user-scoped client so RLS applies as a second line of defence.
 * When Supabase is not configured every read returns an empty result, never sample data.
 */

export const MESSAGE_COLUMNS = "id, sender_id, receiver_id, content, is_read, created_at";

export const BLOCK_ACTION = "user_blocked";
export const UNBLOCK_ACTION = "user_unblocked";
export const REPORT_ACTION = "user_reported";

const CONVERSATION_SCAN_LIMIT = 500;
const THREAD_LIMIT = 200;

interface MessageRow {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ContactProfileRow {
  id: string;
  full_name: string | null;
  department: string | null;
  avatar_url: string | null;
}

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}

export function toMessageItem(row: MessageRow): DirectMessageItem {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    content: row.content,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
  };
}

function toMemberSummary(row: ContactProfileRow): MemberSearchResult {
  return {
    id: row.id,
    name: row.full_name?.trim() || "?",
    department: row.department,
    avatarUrl: safeHttpUrl(row.avatar_url),
  };
}

function notificationTypeFromLink(link: string): NotificationType {
  if (link.startsWith("/portal/gorevler")) return "task";
  if (link.startsWith("/portal/etkinlikler")) return "event";
  if (link.startsWith("/portal/sertifikalarim")) return "cert";
  if (link.startsWith("/portal/hackathon")) return "team";
  if (link.startsWith("/portal/mesajlar")) return "message";
  return "general";
}

/** The signed-in user's latest notifications, or [] when signed out / not configured. */
export async function getNotifications(): Promise<InAppNotificationItem[]> {
  const user = await getSessionUser();
  if (!user) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("notifications") as any)
      .select("id, user_id, title, message, link, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) {
      console.error("[notifications] load failed", error);
      return [];
    }
    return ((data as NotificationRow[] | null) ?? []).map((row) => {
      const link = safeInternalLink(row.link);
      return {
        id: row.id,
        userId: row.user_id,
        type: notificationTypeFromLink(link),
        title: row.title,
        message: row.message,
        link,
        isRead: Boolean(row.is_read),
        createdAt: row.created_at,
      };
    });
  } catch (error) {
    console.error("[notifications] load failed", error);
    return [];
  }
}

export interface BlockState {
  /** Members the user has blocked. */
  blockedByMe: Set<string>;
  /** Members who have blocked the user. */
  blockedMe: Set<string>;
}

/**
 * Block state derived from the user's block / unblock entries in audit_logs (latest entry per pair
 * wins). audit_logs is admin-readable only, so this uses the service role, scoped to the given user.
 * Without the service-role key blocks are still recorded but cannot be read back.
 */
export async function getBlockState(userId: string): Promise<BlockState> {
  const state: BlockState = { blockedByMe: new Set(), blockedMe: new Set() };
  if (!isUuid(userId) || !isSupabaseAdminConfigured()) return state;
  try {
    const admin = createAdminClient();
    const { data, error } = await (admin.from("audit_logs") as any)
      .select("actor_id, target_id, action, created_at")
      .eq("target_type", "profile")
      .in("action", [BLOCK_ACTION, UNBLOCK_ACTION])
      .or(`actor_id.eq.${userId},target_id.eq.${userId}`)
      .order("created_at", { ascending: true })
      .limit(1000);
    if (error) {
      console.error("[messages] block state failed", error);
      return state;
    }
    const latest = new Map<string, boolean>();
    for (const row of (data as Array<{ actor_id: string | null; target_id: string | null; action: string }> | null) ?? []) {
      if (!row.actor_id || !row.target_id) continue;
      latest.set(`${row.actor_id}:${row.target_id}`, row.action === BLOCK_ACTION);
    }
    for (const [pair, isBlocked] of latest) {
      if (!isBlocked) continue;
      const [actorId, targetId] = pair.split(":");
      if (actorId === userId) state.blockedByMe.add(targetId);
      else if (targetId === userId) state.blockedMe.add(actorId);
    }
  } catch (error) {
    console.error("[messages] block state failed", error);
  }
  return state;
}

/** Public card fields of one member (no email or phone), or null if they don't exist. */
export async function getMemberSummary(memberId: string): Promise<MemberSearchResult | null> {
  if (!isUuid(memberId) || !isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await (supabase.from("profiles") as any)
    .select("id, full_name, department, avatar_url")
    .eq("id", memberId)
    .maybeSingle();
  if (error) {
    console.error("[messages] member lookup failed", error);
    return null;
  }
  return data ? toMemberSummary(data as ContactProfileRow) : null;
}

/** Name search over members for starting a conversation. Returns only non-sensitive fields. */
export async function searchMembers(userId: string, query: string): Promise<MemberSearchResult[]> {
  if (!isUuid(userId) || !isSupabaseConfigured()) return [];
  const escaped = query.replace(/[\\%_]/g, (char) => `\\${char}`);
  const supabase = await createClient();
  const { data, error } = await (supabase.from("profiles") as any)
    .select("id, full_name, department, avatar_url")
    .ilike("full_name", `%${escaped}%`)
    .neq("id", userId)
    .order("full_name", { ascending: true })
    .limit(8);
  if (error) {
    console.error("[messages] member search failed", error);
    return [];
  }
  return ((data as ContactProfileRow[] | null) ?? []).map(toMemberSummary);
}

/** The user's conversations (newest first), hiding members they blocked. */
export async function getConversations(
  userId: string
): Promise<{ contacts: ConversationContact[]; blockedIds: string[] }> {
  if (!isUuid(userId) || !isSupabaseConfigured()) return { contacts: [], blockedIds: [] };
  try {
    const supabase = await createClient();
    const [recentResult, unreadResult, blockState] = await Promise.all([
      (supabase.from("direct_messages") as any)
        .select(MESSAGE_COLUMNS)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false })
        .limit(CONVERSATION_SCAN_LIMIT),
      (supabase.from("direct_messages") as any)
        .select("sender_id")
        .eq("receiver_id", userId)
        .eq("is_read", false)
        .limit(1000),
      getBlockState(userId),
    ]);

    if (recentResult.error) {
      console.error("[messages] conversations failed", recentResult.error);
      return { contacts: [], blockedIds: [...blockState.blockedByMe] };
    }

    const unreadBySender = new Map<string, number>();
    for (const row of (unreadResult.data as Array<{ sender_id: string }> | null) ?? []) {
      unreadBySender.set(row.sender_id, (unreadBySender.get(row.sender_id) ?? 0) + 1);
    }

    // Rows are newest first, so the first row seen per member is the latest message.
    const latestByMember = new Map<string, MessageRow>();
    for (const row of (recentResult.data as MessageRow[] | null) ?? []) {
      const otherId = row.sender_id === userId ? row.receiver_id : row.sender_id;
      if (otherId === userId || blockState.blockedByMe.has(otherId)) continue;
      if (!latestByMember.has(otherId)) latestByMember.set(otherId, row);
    }

    const memberIds = [...latestByMember.keys()];
    if (memberIds.length === 0) return { contacts: [], blockedIds: [...blockState.blockedByMe] };

    const { data: profileRows, error: profileError } = await (supabase.from("profiles") as any)
      .select("id, full_name, department, avatar_url")
      .in("id", memberIds);
    if (profileError) console.error("[messages] contact profiles failed", profileError);

    const profiles = new Map<string, MemberSearchResult>();
    for (const row of (profileRows as ContactProfileRow[] | null) ?? []) {
      profiles.set(row.id, toMemberSummary(row));
    }

    const contacts: ConversationContact[] = [];
    for (const memberId of memberIds) {
      const profile = profiles.get(memberId);
      const last = latestByMember.get(memberId);
      if (!profile || !last) continue;
      contacts.push({
        id: memberId,
        name: profile.name,
        department: profile.department,
        avatarUrl: profile.avatarUrl,
        lastMessage: last.content,
        lastMessageAt: last.created_at,
        lastMessageFromMe: last.sender_id === userId,
        unreadCount: unreadBySender.get(memberId) ?? 0,
      });
    }
    return { contacts, blockedIds: [...blockState.blockedByMe] };
  } catch (error) {
    console.error("[messages] conversations failed", error);
    return { contacts: [], blockedIds: [] };
  }
}

/** The latest messages between the user and one member, oldest first. */
export async function getConversationThread(userId: string, otherUserId: string): Promise<DirectMessageItem[]> {
  // Both ids are interpolated into a PostgREST filter, so they must be plain UUIDs.
  if (!isUuid(userId) || !isUuid(otherUserId) || !isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await (supabase.from("direct_messages") as any)
    .select(MESSAGE_COLUMNS)
    .or(
      `and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`
    )
    .order("created_at", { ascending: false })
    .limit(THREAD_LIMIT);
  if (error) {
    console.error("[messages] thread failed", error);
    throw new Error("thread_failed");
  }
  return ((data as MessageRow[] | null) ?? []).map(toMessageItem).reverse();
}

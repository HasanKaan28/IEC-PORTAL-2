"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { guardedAction, requireUser, type ActionResult } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { messagesProfileText, type MessagesProfileText } from "@/lib/i18n/portal/messages-profile";
import type {
  ConversationPayload,
  DirectMessageItem,
  MemberSearchResult,
  ProfileCardData,
} from "./message-types";
import {
  BLOCK_ACTION,
  MESSAGE_COLUMNS,
  REPORT_ACTION,
  UNBLOCK_ACTION,
  getBlockState,
  getConversationThread,
  getMemberSummary,
  searchMembers,
  toMessageItem,
} from "./message-queries";
import { getMemberProfileCard } from "./member-profiles";
import { MESSAGE_MAX_LENGTH } from "./utils";

/**
 * Server actions are public POST endpoints. Every action here authenticates with requireUser()
 * first, takes the acting user from the session (never from the client), validates input with zod
 * and only touches rows that belong to that user. Writes use the user-scoped client so RLS applies too.
 */

type ActionText = MessagesProfileText["actions"];

const MESSAGES_PATH = "/portal/mesajlar";
const MAX_MESSAGES_PER_MINUTE = 20;

async function actionText(): Promise<ActionText> {
  return messagesProfileText[await getServerLocale()].actions;
}

function firstIssue(error: z.ZodError, fallback: string): string {
  return error.errors[0]?.message ?? fallback;
}

function memberIdSchema(t: ActionText) {
  return z.string({ invalid_type_error: t.invalidMember, required_error: t.invalidMember }).uuid(t.invalidMember);
}

export async function sendMessageAction(
  receiverId: string,
  content: string
): Promise<ActionResult<DirectMessageItem>> {
  return guardedAction<DirectMessageItem>(async () => {
    const user = await requireUser();
    const t = await actionText();

    const parsed = z
      .object({
        receiverId: memberIdSchema(t),
        content: z
          .string({ invalid_type_error: t.messageEmpty, required_error: t.messageEmpty })
          .trim()
          .min(1, t.messageEmpty)
          .max(MESSAGE_MAX_LENGTH, t.messageTooLong),
      })
      .safeParse({ receiverId, content });
    if (!parsed.success) return { success: false, error: firstIssue(parsed.error, t.invalidRequest) };
    const { receiverId: targetId, content: text } = parsed.data;

    if (targetId === user.id) return { success: false, error: t.cannotMessageSelf };

    const [receiver, blockState] = await Promise.all([getMemberSummary(targetId), getBlockState(user.id)]);
    if (!receiver) return { success: false, error: t.memberNotFound };
    if (blockState.blockedByMe.has(targetId) || blockState.blockedMe.has(targetId)) {
      return { success: false, error: t.cannotMessageMember };
    }

    const supabase = await createClient();
    const since = new Date(Date.now() - 60_000).toISOString();
    const { count, error: countError } = await (supabase.from("direct_messages") as any)
      .select("id", { count: "exact", head: true })
      .eq("sender_id", user.id)
      .gte("created_at", since);
    if (!countError && (count ?? 0) >= MAX_MESSAGES_PER_MINUTE) {
      return { success: false, error: t.rateLimited };
    }

    const { data, error } = await (supabase.from("direct_messages") as any)
      .insert({ sender_id: user.id, receiver_id: targetId, content: text, is_read: false })
      .select(MESSAGE_COLUMNS)
      .single();
    if (error || !data) {
      console.error("[messages] send failed", error);
      return { success: false, error: t.sendFailed };
    }

    // No revalidatePath here: the open page updates its own state, the route is dynamic so the next
    // visit reads fresh data, and revalidating would re-render the whole portal tree on every message.
    return { success: true, data: toMessageItem(data) };
  });
}

/** Marks messages from senderId to the signed-in user as read. Never touches anyone else's inbox. */
export async function markMessagesAsReadAction(senderId: string): Promise<ActionResult> {
  return guardedAction(async () => {
    const user = await requireUser();
    const t = await actionText();
    const parsed = memberIdSchema(t).safeParse(senderId);
    if (!parsed.success) return { success: false, error: firstIssue(parsed.error, t.invalidMember) };

    const supabase = await createClient();
    const { error } = await (supabase.from("direct_messages") as any)
      .update({ is_read: true })
      .eq("sender_id", parsed.data)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
    if (error) {
      console.error("[messages] mark read failed", error);
      return { success: false, error: t.actionFailed };
    }
    return { success: true };
  });
}

/** Marks the signed-in user's notifications as read: all of them, or only the given ids. */
export async function markNotificationsAsReadAction(notificationIds?: string[]): Promise<ActionResult> {
  return guardedAction(async () => {
    const user = await requireUser();
    const t = await actionText();
    const parsed = z.array(z.string().uuid()).max(100).optional().safeParse(notificationIds);
    if (!parsed.success) return { success: false, error: t.invalidRequest };

    const supabase = await createClient();
    let query = (supabase.from("notifications") as any)
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);
    const markingSome = Boolean(parsed.data && parsed.data.length > 0);
    if (markingSome) query = query.in("id", parsed.data);
    const { error } = await query;
    if (error) {
      console.error("[notifications] mark read failed", error);
      return { success: false, error: t.actionFailed };
    }

    // Single items are marked while the user navigates away via the notification link; only
    // "mark all" refreshes the layout so its server-rendered bell data matches.
    if (!markingSome) revalidatePath("/portal", "layout");
    return { success: true };
  });
}

/** Reports or blocks a member. Recorded in audit_logs, attributed to the signed-in user. */
export async function reportOrBlockUserAction(
  targetUserId: string,
  reason: string,
  actionType: "report" | "block"
): Promise<ActionResult> {
  return guardedAction(async () => {
    const user = await requireUser();
    const t = await actionText();

    const parsed = z
      .object({
        targetUserId: memberIdSchema(t),
        reason: z.string({ invalid_type_error: t.invalidRequest }).trim().max(500, t.reasonTooLong).default(""),
        actionType: z.enum(["report", "block"], { errorMap: () => ({ message: t.invalidRequest }) }),
      })
      .safeParse({ targetUserId, reason: reason ?? "", actionType });
    if (!parsed.success) return { success: false, error: firstIssue(parsed.error, t.invalidRequest) };
    const data = parsed.data;

    if (data.actionType === "report" && data.reason.length < 5) {
      return { success: false, error: t.reportReasonRequired };
    }
    if (data.targetUserId === user.id) return { success: false, error: t.cannotReportSelf };
    if (!(await getMemberSummary(data.targetUserId))) return { success: false, error: t.memberNotFound };

    const supabase = await createClient();
    const { error } = await (supabase.from("audit_logs") as any).insert({
      actor_id: user.id,
      action: data.actionType === "block" ? BLOCK_ACTION : REPORT_ACTION,
      target_type: "profile",
      target_id: data.targetUserId,
      details: { reason: data.reason || null, source: "messages" },
    });
    if (error) {
      console.error("[messages] report/block failed", error);
      return { success: false, error: t.actionFailed };
    }

    if (data.actionType === "block") revalidatePath(MESSAGES_PATH);
    return { success: true, message: data.actionType === "block" ? t.blocked : t.reported };
  });
}

export async function unblockUserAction(targetUserId: string): Promise<ActionResult> {
  return guardedAction(async () => {
    const user = await requireUser();
    const t = await actionText();
    const parsed = memberIdSchema(t).safeParse(targetUserId);
    if (!parsed.success) return { success: false, error: firstIssue(parsed.error, t.invalidMember) };
    if (parsed.data === user.id) return { success: false, error: t.cannotReportSelf };

    const supabase = await createClient();
    const { error } = await (supabase.from("audit_logs") as any).insert({
      actor_id: user.id,
      action: UNBLOCK_ACTION,
      target_type: "profile",
      target_id: parsed.data,
      details: { source: "messages" },
    });
    if (error) {
      console.error("[messages] unblock failed", error);
      return { success: false, error: t.actionFailed };
    }

    revalidatePath(MESSAGES_PATH);
    return { success: true, message: t.unblocked };
  });
}

/** Member name search for starting a new conversation. */
export async function searchMembersAction(query: string): Promise<ActionResult<MemberSearchResult[]>> {
  return guardedAction<MemberSearchResult[]>(async () => {
    const user = await requireUser();
    const t = await actionText();
    const parsed = z
      .string({ invalid_type_error: t.searchTooShort })
      .trim()
      .min(2, t.searchTooShort)
      .max(60, t.searchTooLong)
      .safeParse(query);
    if (!parsed.success) return { success: false, error: firstIssue(parsed.error, t.searchTooShort) };
    return { success: true, data: await searchMembers(user.id, parsed.data) };
  });
}

/** Loads one conversation (latest messages plus the other member's public details). */
export async function loadConversationAction(otherUserId: string): Promise<ActionResult<ConversationPayload>> {
  return guardedAction<ConversationPayload>(async () => {
    const user = await requireUser();
    const t = await actionText();
    const parsed = memberIdSchema(t).safeParse(otherUserId);
    if (!parsed.success) return { success: false, error: firstIssue(parsed.error, t.invalidMember) };
    const memberId = parsed.data;
    if (memberId === user.id) return { success: false, error: t.cannotMessageSelf };

    const [member, blockState] = await Promise.all([getMemberSummary(memberId), getBlockState(user.id)]);
    if (!member) return { success: false, error: t.memberNotFound };

    const blockedByMe = blockState.blockedByMe.has(memberId);
    let messages: DirectMessageItem[] = [];
    if (!blockedByMe) {
      try {
        messages = await getConversationThread(user.id, memberId);
      } catch {
        return { success: false, error: t.actionFailed };
      }
    }

    const last = messages[messages.length - 1];
    return {
      success: true,
      data: {
        blockedByMe,
        messages,
        contact: {
          id: member.id,
          name: member.name,
          department: member.department,
          avatarUrl: member.avatarUrl,
          lastMessage: last?.content ?? null,
          lastMessageAt: last?.createdAt ?? null,
          lastMessageFromMe: last ? last.senderId === user.id : false,
          unreadCount: messages.filter((message) => message.receiverId === user.id && !message.isRead).length,
        },
      },
    };
  });
}

/** Another member's profile card, with hidden contact details removed on the server. */
export async function getMemberProfileCardAction(memberId: string): Promise<ActionResult<ProfileCardData>> {
  return guardedAction<ProfileCardData>(async () => {
    const user = await requireUser();
    const t = await actionText();
    const parsed = memberIdSchema(t).safeParse(memberId);
    if (!parsed.success) return { success: false, error: firstIssue(parsed.error, t.invalidMember) };

    const card = await getMemberProfileCard(user.id, parsed.data, await getServerLocale());
    if (!card) return { success: false, error: t.memberNotFound };
    return { success: true, data: card };
  });
}

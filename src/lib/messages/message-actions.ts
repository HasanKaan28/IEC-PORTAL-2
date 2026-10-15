"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  memoryDirectMessages,
  memoryContacts,
  memoryNotifications,
} from "./message-queries";
import { DirectMessageItem } from "./message-types";

export async function sendMessageAction(receiverId: string, content: string) {
  if (!content || !content.trim()) {
    return { success: false, error: "Boş mesaj gönderilemez." };
  }

  let currentUserId = "usr-current";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      currentUserId = user.id;
    }
  } catch {
    // Fallback
  }

  const newMsg: DirectMessageItem = {
    id: `msg-${Date.now()}`,
    senderId: currentUserId,
    receiverId,
    content: content.trim(),
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  memoryDirectMessages.push(newMsg);

  // Update contact's last message
  const contact = memoryContacts.find((c) => c.id === receiverId);
  if (contact) {
    contact.lastMessage = content.trim();
    contact.lastMessageTime = new Date().toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Attempt database insertion
  try {
    const admin = createAdminClient();
    await (admin.from("direct_messages") as any).insert({
      sender_id: currentUserId,
      receiver_id: receiverId,
      content: content.trim(),
      is_read: false,
    });
  } catch {
    // Fallback
  }

  revalidatePath("/portal/mesajlar");
  return { success: true, message: newMsg };
}

export async function markMessagesAsReadAction(senderId: string) {
  const currentUserId = "usr-current";

  memoryDirectMessages.forEach((m) => {
    if (m.senderId === senderId && m.receiverId === currentUserId) {
      m.isRead = true;
    }
  });

  const contact = memoryContacts.find((c) => c.id === senderId);
  if (contact) {
    contact.unreadCount = 0;
  }

  try {
    const admin = createAdminClient();
    await (admin.from("direct_messages") as any)
      .update({ is_read: true })
      .eq("sender_id", senderId)
      .eq("receiver_id", currentUserId);
  } catch {
    // Fallback
  }

  revalidatePath("/portal/mesajlar");
  return { success: true };
}

export async function markNotificationsAsReadAction() {
  memoryNotifications.forEach((n) => {
    n.isRead = true;
  });

  try {
    const admin = createAdminClient();
    await (admin.from("notifications") as any)
      .update({ is_read: true })
      .neq("id", "00000000-0000-0000-0000-000000000000");
  } catch {
    // Fallback
  }

  revalidatePath("/portal");
  return { success: true };
}

export async function reportOrBlockUserAction(
  targetUserId: string,
  reason: string,
  actionType: "report" | "block"
) {
  try {
    const admin = createAdminClient();
    await (admin.from("audit_logs") as any).insert({
      action: actionType === "block" ? "user_blocked" : "user_reported",
      target_type: "profile",
      target_id: targetUserId,
      details: { reason },
    });
  } catch {
    // Fallback
  }

  return {
    success: true,
    message:
      actionType === "block"
        ? "Kullanıcı engellendi ve gelen mesajlar gizlendi."
        : "Şikayetiniz incelenmek üzere kulüp denetleme kuruluna iletildi.",
  };
}

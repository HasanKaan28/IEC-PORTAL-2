import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MessagesPortalClient from "@/components/portal/messages/MessagesPortalClient";
import { getSessionUser } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { messagesProfileText } from "@/lib/i18n/portal/messages-profile";
import { getConversations } from "@/lib/messages/message-queries";
import { isUuid } from "@/lib/messages/utils";

export async function generateMetadata(): Promise<Metadata> {
  const t = messagesProfileText[await getServerLocale()].messages;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function PortalMessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/portal/giris?redirect=/portal/mesajlar");

  const [{ contacts, blockedIds }, params] = await Promise.all([getConversations(user.id), searchParams]);
  const requested = typeof params.to === "string" ? params.to : null;
  const initialContactId = requested && isUuid(requested) && requested !== user.id ? requested : null;

  return (
    <MessagesPortalClient
      currentUserId={user.id}
      initialContacts={contacts}
      blockedIds={blockedIds}
      initialContactId={initialContactId}
    />
  );
}

import React from "react";
import { Metadata } from "next";
import MessagesPortalClient from "@/components/portal/messages/MessagesPortalClient";
import { getContacts, getDirectMessages } from "@/lib/messages/message-queries";
import { DirectMessageItem } from "@/lib/messages/message-types";

export const metadata: Metadata = {
  title: "Mesajlaşma (DM) | IUS Engineering Club",
  description:
    "Kulüp üyeleri, takım arkadaşları ve proje yürütücüleri ile birebir anlık şifreli mesajlaşma.",
};

export default async function PortalMessagesPage() {
  const contacts = await getContacts();

  // Fetch initial messages for each contact
  const messagesMap: Record<string, DirectMessageItem[]> = {};
  for (const contact of contacts) {
    messagesMap[contact.id] = await getDirectMessages(contact.id);
  }

  return (
    <MessagesPortalClient
      initialContacts={contacts}
      initialMessages={messagesMap}
      currentUserId="usr-current"
    />
  );
}

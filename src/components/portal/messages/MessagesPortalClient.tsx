"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, MessageSquare, SquarePen, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { localizeDepartment, messagesProfileText } from "@/lib/i18n/portal/messages-profile";
import type { ActionResult } from "@/lib/auth/session";
import type {
  ConversationContact,
  DirectMessageItem,
  MemberSearchResult,
  ProfileCardData,
} from "@/lib/messages/message-types";
import {
  getMemberProfileCardAction,
  loadConversationAction,
  markMessagesAsReadAction,
  reportOrBlockUserAction,
  sendMessageAction,
  unblockUserAction,
} from "@/lib/messages/message-actions";
import { isUuid } from "@/lib/messages/utils";
import { playIncomingMessageSound } from "@/lib/messages/sound";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient as createBrowserSupabase } from "@/lib/supabase/client";
import DiscordProfileCard from "@/components/shared/DiscordProfileCard";
import ConversationList from "./ConversationList";
import ConversationView, { type ChatMessage, type ThreadState } from "./ConversationView";
import NewMessageDialog from "./NewMessageDialog";
import ReportBlockDialog from "./ReportBlockDialog";
import { useNow } from "./hooks";

interface MessagesPortalClientProps {
  currentUserId: string;
  initialContacts: ConversationContact[];
  /** Members the signed-in user has blocked (their realtime messages are ignored). */
  blockedIds?: string[];
  /** Conversation to open on load, e.g. from /portal/mesajlar?to=<member id>. */
  initialContactId?: string | null;
}

type Notice = { kind: "success" | "error"; text: string };
type BrowserSupabase = ReturnType<typeof createBrowserSupabase>;

/** While my last messages are unseen, check this often in case a realtime receipt was missed. */
const RECEIPT_RESYNC_MS = 10_000;

/** One browser client per page: shared by the realtime channel and the direct read-receipt writes. */
function useBrowserSupabase(): BrowserSupabase | null {
  const [client] = useState<BrowserSupabase | null>(() => {
    if (typeof window === "undefined" || !isSupabaseConfigured()) return null;
    try {
      return createBrowserSupabase();
    } catch {
      return null;
    }
  });
  return client;
}

function parseMessageRow(raw: unknown): DirectMessageItem | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    typeof row.sender_id !== "string" ||
    typeof row.receiver_id !== "string" ||
    typeof row.content !== "string" ||
    typeof row.created_at !== "string"
  ) {
    return null;
  }
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    content: row.content,
    isRead: row.is_read === true,
    createdAt: row.created_at,
  };
}

/** Server messages plus local ones the server list doesn't have yet (pending sends, realtime arrivals). */
function mergeMessages(server: DirectMessageItem[], local: ChatMessage[]): ChatMessage[] {
  const ids = new Set(server.map((message) => message.id));
  const newest = server.length > 0 ? server[server.length - 1].createdAt : "";
  const extra = local.filter((message) => !ids.has(message.id) && (message.pending || message.createdAt > newest));
  if (extra.length === 0) return server;
  return [...server, ...extra].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export default function MessagesPortalClient({
  currentUserId,
  initialContacts,
  blockedIds = [],
  initialContactId = null,
}: MessagesPortalClientProps) {
  const { locale } = useLocale();
  const text = messagesProfileText[locale];
  const now = useNow();
  const supabase = useBrowserSupabase();

  const [contacts, setContacts] = useState<ConversationContact[]>(initialContacts);
  const [threads, setThreads] = useState<Record<string, ThreadState>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string[]>(blockedIds);
  const [query, setQuery] = useState("");
  const [newMessage, setNewMessage] = useState<{ open: boolean; prefill: string }>({ open: false, prefill: "" });
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [profileCard, setProfileCard] = useState<ProfileCardData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [unblocking, setUnblocking] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  // Latest state for async callbacks and the realtime subscription.
  const contactsRef = useRef(contacts);
  const threadsRef = useRef(threads);
  const activeIdRef = useRef(activeId);
  const blockedRef = useRef(blocked);
  useEffect(() => {
    contactsRef.current = contacts;
    threadsRef.current = threads;
    activeIdRef.current = activeId;
    blockedRef.current = blocked;
  });

  const activeContact = useMemo(() => contacts.find((contact) => contact.id === activeId) ?? null, [contacts, activeId]);

  const filteredContacts = useMemo(() => {
    const intlLocale = locale === "tr" ? "tr-TR" : "en-GB";
    const needle = query.trim().toLocaleLowerCase(intlLocale);
    if (!needle) return contacts;
    return contacts.filter((contact) => {
      const department = localizeDepartment(contact.department, locale) ?? "";
      return (
        contact.name.toLocaleLowerCase(intlLocale).includes(needle) ||
        department.toLocaleLowerCase(intlLocale).includes(needle)
      );
    });
  }, [contacts, query, locale]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timer);
  }, [notice]);

  /** Adds the contact, or merges new fields into the existing entry (optionally moving it to the top). */
  const upsertContact = useCallback((contact: ConversationContact, moveToTop = false) => {
    setContacts((previous) => {
      const index = previous.findIndex((item) => item.id === contact.id);
      if (index === -1) return [contact, ...previous];
      const merged = { ...previous[index], ...contact };
      if (!moveToTop) return previous.map((item, i) => (i === index ? merged : item));
      return [merged, ...previous.slice(0, index), ...previous.slice(index + 1)];
    });
  }, []);

  const updateThread = useCallback((contactId: string, update: (thread: ThreadState) => ThreadState) => {
    setThreads((previous) => {
      const thread = previous[contactId];
      if (!thread) return previous;
      return { ...previous, [contactId]: update(thread) };
    });
  }, []);

  /**
   * Writes the read flag straight from the browser (RLS lets only the receiver flip is_read), so the
   * sender's realtime receipt is not held up by a server round trip. The server action is the fallback.
   */
  const persistRead = useCallback(
    async (contactId: string) => {
      if (supabase && isUuid(currentUserId)) {
        const { error } = await (supabase.from("direct_messages") as any)
          .update({ is_read: true })
          .eq("sender_id", contactId)
          .eq("receiver_id", currentUserId)
          .eq("is_read", false);
        if (!error) return;
      }
      await markMessagesAsReadAction(contactId);
    },
    [supabase, currentUserId]
  );

  const markRead = useCallback(
    (contactId: string) => {
      setContacts((previous) =>
        previous.map((contact) => (contact.id === contactId && contact.unreadCount > 0 ? { ...contact, unreadCount: 0 } : contact))
      );
      updateThread(contactId, (thread) => ({
        ...thread,
        messages: thread.messages.map((message) =>
          message.senderId === contactId && !message.isRead ? { ...message, isRead: true } : message
        ),
      }));
      void persistRead(contactId);
    },
    [updateThread, persistRead]
  );

  /** Ids of messages I sent that the receiver has read before my send call returned. */
  const earlyReceiptsRef = useRef(new Set<string>());

  /** Re-reads the seen state of my unseen messages in a thread, for receipts realtime may have missed. */
  const syncReceipts = useCallback(
    async (contactId: string) => {
      if (!supabase) return;
      const unseen = (threadsRef.current[contactId]?.messages ?? [])
        .filter((message) => message.senderId === currentUserId && !message.isRead && !message.pending)
        .map((message) => message.id);
      if (unseen.length === 0) return;
      const { data, error } = await (supabase.from("direct_messages") as any)
        .select("id")
        .in("id", unseen.slice(-50))
        .eq("is_read", true);
      if (error || !Array.isArray(data) || data.length === 0) return;
      const seen = new Set((data as Array<{ id: string }>).map((row) => row.id));
      updateThread(contactId, (thread) => ({
        ...thread,
        messages: thread.messages.map((message) => (seen.has(message.id) ? { ...message, isRead: true } : message)),
      }));
    },
    [supabase, currentUserId, updateThread]
  );

  const loadThread = useCallback(
    async (contactId: string) => {
      setThreads((previous) => ({
        ...previous,
        [contactId]: {
          status: "loading",
          messages: previous[contactId]?.messages ?? [],
          blockedByMe: previous[contactId]?.blockedByMe ?? false,
        },
      }));

      const result = await loadConversationAction(contactId);
      if (!result.success || !result.data) {
        const error = result.success ? text.messages.loadError : result.error;
        setThreads((previous) => ({
          ...previous,
          [contactId]: { status: "error", messages: previous[contactId]?.messages ?? [], blockedByMe: false, error },
        }));
        return;
      }

      const { contact, messages, blockedByMe } = result.data;
      setThreads((previous) => ({
        ...previous,
        [contactId]: {
          status: "ready",
          messages: blockedByMe ? [] : mergeMessages(messages, previous[contactId]?.messages ?? []),
          blockedByMe,
        },
      }));
      setBlocked((previous) => {
        const has = previous.includes(contactId);
        if (blockedByMe && !has) return [...previous, contactId];
        if (!blockedByMe && has) return previous.filter((id) => id !== contactId);
        return previous;
      });
      const existing = contactsRef.current.find((item) => item.id === contactId);
      upsertContact(
        existing && !contact.lastMessageAt
          ? { ...existing, name: contact.name, department: contact.department, avatarUrl: contact.avatarUrl }
          : contact
      );
      if (contact.unreadCount > 0 && activeIdRef.current === contactId && document.visibilityState === "visible") {
        markRead(contactId);
      }
    },
    [markRead, text.messages.loadError, upsertContact]
  );

  const openConversation = useCallback(
    (contactId: string) => {
      setActiveId(contactId);
      activeIdRef.current = contactId;
      setSendError(null);
      const thread = threadsRef.current[contactId];
      if (!thread || thread.status === "error") {
        void loadThread(contactId);
        return;
      }
      const contact = contactsRef.current.find((item) => item.id === contactId);
      if (contact && contact.unreadCount > 0) markRead(contactId);
    },
    [loadThread, markRead]
  );

  // Open the conversation requested in the URL (?to=) once.
  const openedInitial = useRef(false);
  useEffect(() => {
    if (openedInitial.current) return;
    openedInitial.current = true;
    if (initialContactId && isUuid(initialContactId) && initialContactId !== currentUserId) {
      openConversation(initialContactId);
    }
  }, [initialContactId, currentUserId, openConversation]);

  // Realtime: new messages to me, and read receipts for messages I sent.
  const handlersRef = useRef({
    incoming: (_row: unknown) => {},
    receipt: (_row: unknown) => {},
  });
  useEffect(() => {
    handlersRef.current.incoming = (raw: unknown) => {
      const message = parseMessageRow(raw);
      if (!message || message.receiverId !== currentUserId) return;
      const senderId = message.senderId;
      if (blockedRef.current.includes(senderId)) return;
      if (threadsRef.current[senderId]?.messages.some((item) => item.id === message.id)) return;

      const viewing = activeIdRef.current === senderId && document.visibilityState === "visible";
      updateThread(senderId, (thread) =>
        thread.messages.some((item) => item.id === message.id)
          ? thread
          : { ...thread, messages: [...thread.messages, viewing ? { ...message, isRead: true } : message] }
      );

      if (contactsRef.current.some((item) => item.id === senderId)) {
        setContacts((previous) => {
          const index = previous.findIndex((item) => item.id === senderId);
          if (index === -1) return previous;
          const current = previous[index];
          const updated: ConversationContact = {
            ...current,
            lastMessage: message.content,
            lastMessageAt: message.createdAt,
            lastMessageFromMe: false,
            unreadCount: viewing ? 0 : current.unreadCount + 1,
          };
          return [updated, ...previous.slice(0, index), ...previous.slice(index + 1)];
        });
        if (viewing) void persistRead(senderId);
      } else {
        void loadThread(senderId);
      }
      playIncomingMessageSound();
    };

    handlersRef.current.receipt = (raw: unknown) => {
      const message = parseMessageRow(raw);
      if (!message || message.senderId !== currentUserId || !message.isRead) return;
      const known = threadsRef.current[message.receiverId]?.messages.some((item) => item.id === message.id);
      // The receipt can beat my own send call back; keep it until the real id replaces the pending one.
      if (!known) earlyReceiptsRef.current.add(message.id);
      updateThread(message.receiverId, (thread) => ({
        ...thread,
        messages: thread.messages.map((item) => (item.id === message.id ? { ...item, isRead: true } : item)),
      }));
    };
  });

  useEffect(() => {
    if (!supabase || !isUuid(currentUserId)) return;
    let subscribedBefore = false;
    const channel = supabase
      .channel(`direct-messages:${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages", filter: `receiver_id=eq.${currentUserId}` },
        (payload: { new: unknown }) => handlersRef.current.incoming(payload.new)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "direct_messages", filter: `sender_id=eq.${currentUserId}` },
        (payload: { new: unknown }) => handlersRef.current.receipt(payload.new)
      )
      .subscribe((status: string) => {
        if (status !== "SUBSCRIBED") return;
        // Events sent while the socket was down are not replayed, so catch up after a reconnect.
        if (subscribedBefore && activeIdRef.current) void syncReceipts(activeIdRef.current);
        subscribedBefore = true;
      });
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [supabase, currentUserId, syncReceipts]);

  // Coming back to the tab counts as reading the open conversation, and refreshes my receipts.
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      const contactId = activeIdRef.current;
      if (!contactId) return;
      const contact = contactsRef.current.find((item) => item.id === contactId);
      if (contact && contact.unreadCount > 0) markRead(contactId);
      void syncReceipts(contactId);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [markRead, syncReceipts]);

  // Safety net: while my latest message in the open conversation is unseen, re-check now and then.
  const activeThread = activeId ? threads[activeId] : undefined;
  const waitingForReceipt = useMemo(() => {
    const mine = activeThread?.messages.filter((message) => message.senderId === currentUserId && !message.pending);
    return Boolean(mine && mine.length > 0 && !mine[mine.length - 1].isRead);
  }, [activeThread, currentUserId]);
  useEffect(() => {
    if (!activeId || !waitingForReceipt) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void syncReceipts(activeId);
    }, RECEIPT_RESYNC_MS);
    return () => window.clearInterval(timer);
  }, [activeId, waitingForReceipt, syncReceipts]);

  const handleSend = async (value: string): Promise<boolean> => {
    const contactId = activeIdRef.current;
    const content = value.trim();
    if (!contactId || !content) return false;
    setSendError(null);

    const tempId = `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    updateThread(contactId, (thread) => ({
      ...thread,
      messages: [
        ...thread.messages,
        {
          id: tempId,
          senderId: currentUserId,
          receiverId: contactId,
          content,
          isRead: false,
          createdAt: new Date().toISOString(),
          pending: true,
        },
      ],
    }));

    const result = await sendMessageAction(contactId, content);
    if (!result.success || !result.data) {
      updateThread(contactId, (thread) => ({
        ...thread,
        messages: thread.messages.filter((message) => message.id !== tempId),
      }));
      setSendError(result.success ? text.actions.sendFailed : result.error);
      return false;
    }

    const readEarly = earlyReceiptsRef.current.delete(result.data.id);
    const sent = readEarly ? { ...result.data, isRead: true } : result.data;
    updateThread(contactId, (thread) => ({
      ...thread,
      messages: thread.messages.map((message) => (message.id === tempId ? sent : message)),
    }));
    const existing = contactsRef.current.find((item) => item.id === contactId);
    if (existing) {
      upsertContact(
        { ...existing, lastMessage: sent.content, lastMessageAt: sent.createdAt, lastMessageFromMe: true },
        true
      );
    }
    return true;
  };

  const handleSafetySubmit = async (actionType: "report" | "block", reason: string): Promise<ActionResult> => {
    const contactId = activeIdRef.current;
    if (!contactId) return { success: false, error: text.actions.invalidMember };
    const result = await reportOrBlockUserAction(contactId, reason, actionType);
    if (!result.success) return result;

    setSafetyOpen(false);
    setNotice({ kind: "success", text: result.message ?? (actionType === "block" ? text.actions.blocked : text.actions.reported) });
    if (actionType === "block") {
      setBlocked((previous) => (previous.includes(contactId) ? previous : [...previous, contactId]));
      setContacts((previous) => previous.filter((contact) => contact.id !== contactId));
      setThreads((previous) => {
        const next = { ...previous };
        delete next[contactId];
        return next;
      });
      setActiveId(null);
    }
    return result;
  };

  const handleUnblock = async () => {
    const contactId = activeIdRef.current;
    if (!contactId || unblocking) return;
    setUnblocking(true);
    const result = await unblockUserAction(contactId);
    setUnblocking(false);
    if (!result.success) {
      setNotice({ kind: "error", text: result.error });
      return;
    }
    setBlocked((previous) => previous.filter((id) => id !== contactId));
    setNotice({ kind: "success", text: result.message ?? text.actions.unblocked });
    void loadThread(contactId);
  };

  const handleViewProfile = async () => {
    const contactId = activeIdRef.current;
    if (!contactId || profileLoading) return;
    setProfileLoading(true);
    const result = await getMemberProfileCardAction(contactId);
    setProfileLoading(false);
    if (result.success && result.data) setProfileCard(result.data);
    else setNotice({ kind: "error", text: result.success ? text.actions.actionFailed : result.error });
  };

  const handleStartConversation = (member: MemberSearchResult) => {
    setNewMessage({ open: false, prefill: "" });
    if (!contactsRef.current.some((contact) => contact.id === member.id)) {
      upsertContact({
        id: member.id,
        name: member.name,
        department: member.department,
        avatarUrl: member.avatarUrl,
        lastMessage: null,
        lastMessageAt: null,
        lastMessageFromMe: false,
        unreadCount: 0,
      });
    }
    openConversation(member.id);
  };

  const openNewMessage = (prefill = "") => setNewMessage({ open: true, prefill });

  return (
    <>
      <div className="relative flex h-[calc(100dvh-7rem)] min-h-[28rem] overflow-hidden rounded-2xl border border-slate-200 bg-white md:h-[calc(100dvh-8rem)]">
        <ConversationList
          locale={locale}
          now={now}
          contacts={filteredContacts}
          totalCount={contacts.length}
          activeId={activeId}
          query={query}
          onQueryChange={setQuery}
          onSelect={openConversation}
          onNewMessage={openNewMessage}
          className={`w-full md:w-80 md:shrink-0 md:border-r md:border-slate-200 lg:w-96 ${activeId ? "hidden md:flex" : "flex"}`}
        />

        <div className={`min-w-0 flex-1 flex-col bg-slate-50 ${activeId ? "flex" : "hidden md:flex"}`}>
          {activeId ? (
            <ConversationView
              locale={locale}
              now={now}
              currentUserId={currentUserId}
              contactId={activeId}
              contact={activeContact}
              thread={threads[activeId]}
              profileLoading={profileLoading}
              unblocking={unblocking}
              sendError={sendError}
              onBack={() => setActiveId(null)}
              onRetry={() => void loadThread(activeId)}
              onViewProfile={() => void handleViewProfile()}
              onOpenSafety={() => setSafetyOpen(true)}
              onUnblock={() => void handleUnblock()}
              onSend={handleSend}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <MessageSquare className="h-6 w-6" aria-hidden="true" />
              </span>
              <h2 className="text-sm font-bold text-slate-800">{text.messages.noSelectionTitle}</h2>
              <p className="max-w-xs text-sm text-slate-500">{text.messages.noSelectionText}</p>
              <button
                type="button"
                onClick={() => openNewMessage()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <SquarePen className="h-4 w-4" aria-hidden="true" />
                <span>{text.messages.newMessage}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <NewMessageDialog
        open={newMessage.open}
        locale={locale}
        initialQuery={newMessage.prefill}
        onClose={() => setNewMessage({ open: false, prefill: "" })}
        onSelect={handleStartConversation}
      />

      <ReportBlockDialog
        open={safetyOpen && Boolean(activeContact)}
        locale={locale}
        memberName={activeContact?.name ?? ""}
        onClose={() => setSafetyOpen(false)}
        onSubmit={handleSafetySubmit}
      />

      {profileCard && <DiscordProfileCard user={profileCard} isOpen onClose={() => setProfileCard(null)} />}

      {notice && (
        <div
          role={notice.kind === "error" ? "alert" : "status"}
          className={`fixed bottom-4 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-start gap-2 rounded-2xl border p-3 text-sm shadow-lg ${
            notice.kind === "error"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {notice.kind === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          )}
          <span className="flex-1">{notice.text}</span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label={text.common.close}
            className="rounded-lg p-0.5 opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </>
  );
}

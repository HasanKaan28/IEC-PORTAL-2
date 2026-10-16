"use client";

import React, { useLayoutEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCheck,
  Clock,
  LoaderCircle,
  MessageSquare,
  Send,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import type { SupportedLocale } from "@/lib/i18n/translations";
import { formatDate } from "@/lib/i18n/format";
import { localizeDepartment, messagesProfileText } from "@/lib/i18n/portal/messages-profile";
import type { ConversationContact, DirectMessageItem } from "@/lib/messages/message-types";
import { MESSAGE_MAX_LENGTH } from "@/lib/messages/utils";
import MemberAvatar from "./MemberAvatar";

export interface ChatMessage extends DirectMessageItem {
  pending?: boolean;
}

export interface ThreadState {
  status: "loading" | "ready" | "error";
  messages: ChatMessage[];
  blockedByMe: boolean;
  error?: string;
}

interface ConversationViewProps {
  locale: SupportedLocale;
  now: number | null;
  currentUserId: string;
  contactId: string;
  contact: ConversationContact | null;
  thread: ThreadState | undefined;
  profileLoading: boolean;
  unblocking: boolean;
  sendError: string | null;
  onBack: () => void;
  onRetry: () => void;
  onViewProfile: () => void;
  onOpenSafety: () => void;
  onUnblock: () => void;
  onSend: (text: string) => Promise<boolean>;
}

function startOfDay(value: number | string): number {
  const date = new Date(value);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

const iconButton =
  "inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60";

export default function ConversationView({
  locale,
  now,
  currentUserId,
  contactId,
  contact,
  thread,
  profileLoading,
  unblocking,
  sendError,
  onBack,
  onRetry,
  onViewProfile,
  onOpenSafety,
  onUnblock,
  onSend,
}: ConversationViewProps) {
  const t = messagesProfileText[locale].messages;
  const common = messagesProfileText[locale].common;
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = thread?.messages ?? [];
  const status = thread?.status ?? "loading";
  const blocked = Boolean(thread?.blockedByMe);
  const name = contact?.name ?? "";
  const department = localizeDepartment(contact?.department, locale);

  // Keep the newest message in view. Scrolls only this panel, never the page.
  useLayoutEffect(() => {
    const node = scrollRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages.length, contactId, status]);

  const dayLabel = (iso: string): string => {
    if (now === null) return "";
    const diffDays = Math.round((startOfDay(now) - startOfDay(iso)) / 86_400_000);
    if (diffDays === 0) return t.today;
    if (diffDays === 1) return t.yesterday;
    const sameYear = new Date(iso).getFullYear() === new Date(now).getFullYear();
    return formatDate(iso, locale, sameYear ? { day: "numeric", month: "long" } : { day: "numeric", month: "long", year: "numeric" });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-3 sm:gap-3 sm:px-4">
        <button
          type="button"
          onClick={onBack}
          aria-label={t.back}
          className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 md:hidden"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>

        {contact ? (
          <>
            <MemberAvatar name={name} src={contact.avatarUrl} locale={locale} />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-sm font-bold text-slate-900">{name}</h2>
              {department && <p className="truncate text-xs text-slate-500">{department}</p>}
            </div>
            <button
              type="button"
              onClick={onViewProfile}
              disabled={profileLoading}
              aria-label={t.viewProfile}
              className={`${iconButton} sm:px-3`}
            >
              {profileLoading ? (
                <LoaderCircle className="h-4 w-4 animate-spin text-slate-500" aria-hidden="true" />
              ) : (
                <UserRound className="h-4 w-4 text-slate-500" aria-hidden="true" />
              )}
              <span className="hidden sm:inline" aria-hidden="true">
                {t.viewProfile}
              </span>
            </button>
            <button
              type="button"
              onClick={onOpenSafety}
              aria-label={t.safetyMenu}
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
            >
              <ShieldAlert className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        ) : status === "error" ? (
          <div className="h-10 flex-1" />
        ) : (
          <div className="flex flex-1 items-center gap-3" aria-hidden="true">
            <span className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
            <span className="h-4 w-32 animate-pulse rounded bg-slate-200" />
          </div>
        )}
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6">
        {status === "loading" && messages.length === 0 ? (
          <div role="status" className="flex h-full items-center justify-center gap-2 text-sm text-slate-500">
            <LoaderCircle className="h-5 w-5 animate-spin text-brand-600" aria-hidden="true" />
            <span>{t.loadingConversation}</span>
          </div>
        ) : status === "error" && messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertCircle className="h-6 w-6" aria-hidden="true" />
            </span>
            <p role="alert" className="text-sm text-slate-700">
              {thread?.error || t.loadError}
            </p>
            <button
              type="button"
              onClick={onRetry}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              {common.retry}
            </button>
          </div>
        ) : blocked ? (
          <div className="mx-auto mt-6 flex max-w-md flex-col items-center gap-3 rounded-2xl border border-accent-200 bg-accent-50 p-5 text-center">
            <ShieldAlert className="h-6 w-6 text-accent-700" aria-hidden="true" />
            <p className="text-sm text-accent-900">{t.blockedBanner}</p>
            <button
              type="button"
              onClick={onUnblock}
              disabled={unblocking}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
            >
              {unblocking && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              <span>{t.unblock}</span>
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <MessageSquare className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="max-w-xs text-sm text-slate-600">{t.startHint(name)}</p>
          </div>
        ) : (
          <div role="log" aria-label={name} className="space-y-2">
            {messages.map((message, index) => {
              const mine = message.senderId === currentUserId;
              const previous = messages[index - 1];
              const showDay =
                now !== null && (!previous || startOfDay(previous.createdAt) !== startOfDay(message.createdAt));
              return (
                <React.Fragment key={message.id}>
                  {showDay && (
                    <div className="flex justify-center py-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm ring-1 ring-slate-200">
                        {dayLabel(message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 sm:max-w-md ${
                        mine
                          ? "rounded-br-md bg-brand-600 text-white"
                          : "rounded-bl-md border border-slate-200 bg-white text-slate-900"
                      } ${message.pending ? "opacity-70" : ""}`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
                      <div
                        className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                          mine ? "text-brand-100" : "text-slate-400"
                        }`}
                      >
                        {now !== null && (
                          <time dateTime={message.createdAt}>
                            {formatDate(message.createdAt, locale, { hour: "2-digit", minute: "2-digit" })}
                          </time>
                        )}
                        {mine &&
                          (message.pending ? (
                            <>
                              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                              <span className="sr-only">{t.sending}</span>
                            </>
                          ) : message.isRead ? (
                            <>
                              <CheckCheck className="h-3.5 w-3.5" aria-hidden="true" />
                              <span className="sr-only">{t.read}</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              <span className="sr-only">{t.sent}</span>
                            </>
                          ))}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {contact && status === "ready" && !blocked && (
        <Composer key={contactId} locale={locale} contactName={name} sendError={sendError} onSend={onSend} />
      )}
    </div>
  );
}

function Composer({
  locale,
  contactName,
  sendError,
  onSend,
}: {
  locale: SupportedLocale;
  contactName: string;
  sendError: string | null;
  onSend: (text: string) => Promise<boolean>;
}) {
  const t = messagesProfileText[locale].messages;
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const remaining = MESSAGE_MAX_LENGTH - text.length;
  const canSend = text.trim().length > 0 && remaining >= 0;

  const resize = () => {
    const node = textareaRef.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
  };

  useLayoutEffect(resize, [text]);

  const submit = async () => {
    if (!canSend) return;
    const value = text.trim();
    setText("");
    const ok = await onSend(value);
    if (!ok) setText((current) => current || value);
    textareaRef.current?.focus();
  };

  return (
    <form
      className="border-t border-slate-200 bg-white p-3 sm:p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
    >
      <label htmlFor="message-composer" className="sr-only">
        {t.inputLabel(contactName)}
      </label>
      <div className="flex items-end gap-2">
        <textarea
          id="message-composer"
          ref={textareaRef}
          rows={1}
          value={text}
          maxLength={MESSAGE_MAX_LENGTH}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              void submit();
            }
          }}
          placeholder={t.inputPlaceholder}
          aria-describedby="message-composer-hint"
          aria-invalid={sendError ? true : undefined}
          className="max-h-40 min-h-[2.75rem] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label={t.send}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-3 text-xs">
        <p id="message-composer-hint" className="hidden text-slate-400 sm:block">
          {t.inputHint}
        </p>
        {remaining <= 200 && (
          <p className={`ml-auto ${remaining <= 20 ? "text-rose-600" : "text-slate-500"}`} aria-live="polite">
            {t.charactersLeft(remaining)}
          </p>
        )}
      </div>
      {sendError && (
        <p role="alert" className="mt-1 flex items-center gap-1.5 text-sm text-rose-600">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{sendError}</span>
        </p>
      )}
    </form>
  );
}

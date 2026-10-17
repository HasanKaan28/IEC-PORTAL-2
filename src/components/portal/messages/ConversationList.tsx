"use client";

import React from "react";
import { MessageSquare, SquarePen, Search, UserPlus } from "lucide-react";
import type { SupportedLocale } from "@/lib/i18n/translations";
import { formatRelative } from "@/lib/i18n/format";
import { localizeDepartment, messagesProfileText } from "@/lib/i18n/portal/messages-profile";
import type { ConversationContact } from "@/lib/messages/message-types";
import MemberAvatar from "./MemberAvatar";

interface ConversationListProps {
  locale: SupportedLocale;
  now: number | null;
  contacts: ConversationContact[];
  totalCount: number;
  activeId: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  onSelect: (contactId: string) => void;
  onNewMessage: (prefill?: string) => void;
  className?: string;
}

export default function ConversationList({
  locale,
  now,
  contacts,
  totalCount,
  activeId,
  query,
  onQueryChange,
  onSelect,
  onNewMessage,
  className = "",
}: ConversationListProps) {
  const t = messagesProfileText[locale].messages;
  const trimmedQuery = query.trim();

  return (
    // Display (flex / hidden) comes from the caller so the list can be hidden on phones while a chat is open.
    <section aria-label={t.listLabel} className={`min-h-0 flex-col ${className}`}>
      <div className="space-y-3 border-b border-slate-200 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <h1 className="font-display text-base font-bold text-slate-900">{t.heading}</h1>
            {totalCount > 0 && (
              <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 sm:inline-flex">
                {t.conversationCount(totalCount)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => onNewMessage()}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <SquarePen className="h-4 w-4" aria-hidden="true" />
            <span>{t.newMessage}</span>
          </button>
        </div>

        {totalCount > 0 && (
          <div className="relative">
            <label htmlFor="conversation-search" className="sr-only">
              {t.searchLabel}
            </label>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="conversation-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder={t.searchPlaceholder}
              autoComplete="off"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {totalCount === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600">
              <MessageSquare className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="text-sm text-slate-600">{t.emptyTitle}</p>
            <button
              type="button"
              onClick={() => onNewMessage()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <SquarePen className="h-4 w-4" aria-hidden="true" />
              <span>{t.emptyCta}</span>
            </button>
          </div>
        ) : contacts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Search className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="wrap-break-word text-sm text-slate-600">{t.noMatch(trimmedQuery)}</p>
            <button
              type="button"
              onClick={() => onNewMessage(trimmedQuery)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              <span>{t.searchAllMembers}</span>
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {contacts.map((contact) => {
              const isActive = contact.id === activeId;
              const department = localizeDepartment(contact.department, locale);
              const preview = contact.lastMessage
                ? `${contact.lastMessageFromMe ? t.youPrefix : ""}${contact.lastMessage}`
                : t.noMessagesPreview;
              return (
                <li key={contact.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(contact.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500 ${
                      isActive ? "bg-brand-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <MemberAvatar name={contact.name} src={contact.avatarUrl} locale={locale} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span
                          className={`truncate text-sm ${
                            contact.unreadCount > 0 ? "font-bold text-slate-900" : "font-semibold text-slate-800"
                          }`}
                        >
                          {contact.name}
                        </span>
                        {contact.lastMessageAt && now !== null && (
                          <span className="shrink-0 text-xs text-slate-400">
                            {formatRelative(contact.lastMessageAt, locale)}
                          </span>
                        )}
                      </span>
                      {department && <span className="block truncate text-xs text-slate-500">{department}</span>}
                      <span className="mt-0.5 flex items-center justify-between gap-2">
                        <span
                          className={`truncate text-sm ${
                            contact.unreadCount > 0 ? "font-medium text-slate-800" : "text-slate-500"
                          }`}
                        >
                          {preview}
                        </span>
                        {contact.unreadCount > 0 && (
                          <span className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-xs font-bold text-white">
                            <span aria-hidden="true">{contact.unreadCount > 99 ? "99+" : contact.unreadCount}</span>
                            <span className="sr-only">{t.unreadCount(contact.unreadCount)}</span>
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

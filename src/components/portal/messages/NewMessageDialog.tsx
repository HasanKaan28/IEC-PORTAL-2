"use client";

import React, { useEffect, useRef, useState } from "react";
import { LoaderCircle, Search, UserRound, X } from "lucide-react";
import type { SupportedLocale } from "@/lib/i18n/translations";
import { localizeDepartment, messagesProfileText } from "@/lib/i18n/portal/messages-profile";
import type { MemberSearchResult } from "@/lib/messages/message-types";
import { searchMembersAction } from "@/lib/messages/message-actions";
import MemberAvatar from "./MemberAvatar";
import { useDialog } from "./hooks";

interface NewMessageDialogProps {
  open: boolean;
  locale: SupportedLocale;
  initialQuery?: string;
  onClose: () => void;
  onSelect: (member: MemberSearchResult) => void;
}

export default function NewMessageDialog(props: NewMessageDialogProps) {
  if (!props.open) return null;
  return <NewMessageDialogPanel {...props} />;
}

function NewMessageDialogPanel({ locale, initialQuery = "", onClose, onSelect }: NewMessageDialogProps) {
  const t = messagesProfileText[locale].newMessage;
  const common = messagesProfileText[locale].common;
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<MemberSearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "searching" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useDialog(true, onClose, dialogRef, inputRef);

  const trimmed = query.trim();

  useEffect(() => {
    const requestId = ++requestRef.current;
    if (trimmed.length < 2) {
      setResults([]);
      setStatus("idle");
      setError(null);
      return;
    }
    setStatus("searching");
    const timer = window.setTimeout(async () => {
      const result = await searchMembersAction(trimmed);
      if (requestId !== requestRef.current) return;
      if (result.success) {
        setResults(result.data ?? []);
        setStatus("done");
        setError(null);
      } else {
        setResults([]);
        setStatus("error");
        setError(result.error);
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [trimmed]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-4 pt-[10vh] backdrop-blur-xs animate-in fade-in duration-150"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-message-title"
        className="flex max-h-[80dvh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 id="new-message-title" className="font-display text-base font-bold text-slate-900">
            {t.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={common.close}
            className="rounded-xl p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-slate-100 px-5 py-4">
          <label htmlFor="member-search" className="mb-1.5 block text-sm font-semibold text-slate-700">
            {t.searchLabel}
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              id="member-search"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
              autoComplete="off"
              maxLength={60}
              aria-describedby="member-search-status"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>

        <div className="min-h-32 flex-1 overflow-y-auto">
          <div id="member-search-status" aria-live="polite" className="px-5">
            {status === "idle" && <p className="py-6 text-center text-sm text-slate-500">{t.minChars}</p>}
            {status === "searching" && results.length === 0 && (
              <p className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
                <LoaderCircle className="h-4 w-4 animate-spin text-brand-600" aria-hidden="true" />
                <span>{t.searching}</span>
              </p>
            )}
            {status === "error" && error && (
              <p role="alert" className="py-6 text-center text-sm text-rose-600">
                {error}
              </p>
            )}
            {status === "done" && results.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <UserRound className="h-6 w-6 text-slate-400" aria-hidden="true" />
                <p className="wrap-break-word text-sm text-slate-500">{t.noResults(trimmed)}</p>
              </div>
            )}
          </div>

          {results.length > 0 && (
            <ul aria-label={t.resultsLabel} className="divide-y divide-slate-100 pb-2">
              {results.map((member) => {
                const department = localizeDepartment(member.department, locale);
                return (
                  <li key={member.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(member)}
                      className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
                    >
                      <MemberAvatar name={member.name} src={member.avatarUrl} locale={locale} />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-slate-900">{member.name}</span>
                        {department && <span className="block truncate text-xs text-slate-500">{department}</span>}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { Loader2 } from "lucide-react";
import DiscordProfileCard, { type ProfileCardData } from "@/components/shared/DiscordProfileCard";
import { getMemberProfileCardAction } from "@/lib/messages/message-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { messagesProfileText } from "@/lib/i18n/portal/messages-profile";

interface MemberCardContextValue {
  openMemberCard: (memberId: string) => void;
}

const MemberCardContext = createContext<MemberCardContextValue | null>(null);

/**
 * Lets any member name in the portal open that member's profile card. Mounted once in the portal
 * shell; the card is loaded on demand through the server, which applies the member's privacy flags.
 */
export function MemberCardProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [card, setCard] = useState<ProfileCardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openMemberCard = useCallback(
    async (memberId: string) => {
      if (!memberId) return;
      setError(null);
      setLoading(true);
      const result = await getMemberProfileCardAction(memberId);
      setLoading(false);
      if (result.success && result.data) setCard(result.data);
      else setError(result.success ? messagesProfileText[locale].actions.actionFailed : result.error);
    },
    [locale]
  );

  return (
    <MemberCardContext.Provider value={{ openMemberCard }}>
      {children}
      {loading && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center" role="status">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-lg ring-1 ring-slate-200">
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" aria-hidden="true" />
            {messagesProfileText[locale].common.loading}
          </span>
        </div>
      )}
      {error && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4" role="alert">
          <button
            type="button"
            onClick={() => setError(null)}
            className="rounded-full bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-lg"
          >
            {error}
          </button>
        </div>
      )}
      {card && <DiscordProfileCard user={card} isOpen onClose={() => setCard(null)} />}
    </MemberCardContext.Provider>
  );
}

export function useMemberCard(): MemberCardContextValue | null {
  return useContext(MemberCardContext);
}

interface MemberNameProps {
  /** Member id; without it (or outside the provider) the name renders as plain text. */
  userId: string | null | undefined;
  name: string;
  className?: string;
}

/** A member's name that opens their profile card when clicked. */
export function MemberName({ userId, name, className = "" }: MemberNameProps) {
  const context = useMemberCard();
  const { locale } = useLocale();
  if (!userId || !context) return <span className={className}>{name}</span>;
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        context.openMemberCard(userId);
      }}
      title={messagesProfileText[locale].card.openCard}
      className={`rounded text-left underline-offset-2 hover:text-brand-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ${className}`}
    >
      {name}
    </button>
  );
}

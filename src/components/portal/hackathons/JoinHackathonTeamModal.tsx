"use client";

import React, { useState } from "react";
import { AlertCircle, Send, UserPlus } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";
import { MAX_TEAM_MEMBERS, type HackathonTeamItem } from "@/lib/hackathons/hackathon-types";
import { requestJoinHackathonTeamAction } from "@/lib/hackathons/hackathon-actions";
import PortalDialog from "@/components/portal/events/PortalDialog";
import { chipClass, hintClass, inputClass, labelClass, primaryButton, secondaryButton } from "@/components/portal/events/styles";

const MAX_MESSAGE_LENGTH = 500;

interface JoinHackathonTeamModalProps {
  team: HackathonTeamItem;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

/** Join request for the signed-in user (the server never accepts a user id from the client). */
export default function JoinHackathonTeamModal({ team, onClose, onSuccess }: JoinHackathonTeamModalProps) {
  const { locale } = useLocale();
  const t = eventsHackathonsText[locale];
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    const res = await requestJoinHackathonTeamAction(team.id, message);
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    onSuccess(res.message ?? t.hackathons.requestSent);
  };

  return (
    <PortalDialog
      title={t.joinTeam.title}
      description={team.hackathonTitle ? `${team.name} · ${team.hackathonTitle}` : team.name}
      icon={<UserPlus className="h-4 w-4" />}
      closeLabel={t.common.closeDialog}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-5">
        {errorMsg && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600">
            <span>{t.joinTeam.captain(team.leaderName || t.hackathons.unknownMember)}</span>
            <span>{t.hackathons.membersCount(team.members.length, MAX_TEAM_MEMBERS)}</span>
          </div>
          {team.lookingFor.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.hackathons.lookingFor}</p>
              <ul className="flex flex-wrap gap-1.5">
                {team.lookingFor.map((role) => (
                  <li key={role} className={`${chipClass} border-brand-200 bg-brand-50 text-brand-700`}>
                    {role}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="join-message" className={labelClass}>
            {t.joinTeam.messageLabel}
          </label>
          <textarea
            id="join-message"
            required
            autoFocus
            minLength={10}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.joinTeam.messagePlaceholder}
            aria-describedby="join-message-count"
            className={`${inputClass} resize-y leading-relaxed`}
          />
          <p id="join-message-count" className={`${hintClass} text-right`}>
            {t.joinTeam.characterCount(message.length, MAX_MESSAGE_LENGTH)}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className={secondaryButton}>
            {t.common.cancel}
          </button>
          <button type="submit" disabled={isSubmitting || message.trim().length === 0} className={primaryButton}>
            <Send className="h-4 w-4" aria-hidden="true" />
            <span>{isSubmitting ? t.joinTeam.submitting : t.joinTeam.submit}</span>
          </button>
        </div>
      </form>
    </PortalDialog>
  );
}

"use client";

import React, { useState } from "react";
import { AlertCircle, Users } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";
import type { HackathonItem } from "@/lib/hackathons/hackathon-types";
import { createHackathonTeamAction } from "@/lib/hackathons/hackathon-actions";
import PortalDialog from "@/components/portal/events/PortalDialog";
import { hintClass, inputClass, labelClass, primaryButton, secondaryButton } from "@/components/portal/events/styles";

interface CreateHackathonTeamModalProps {
  /** Open hackathons only. */
  hackathons: HackathonItem[];
  initialHackathonId?: string;
  onClose: () => void;
  onTeamCreated: (message: string) => void;
}

/** Team creation; the signed-in user becomes the captain (decided on the server). */
export default function CreateHackathonTeamModal({
  hackathons,
  initialHackathonId,
  onClose,
  onTeamCreated,
}: CreateHackathonTeamModalProps) {
  const { locale } = useLocale();
  const t = eventsHackathonsText[locale];
  const [hackathonId, setHackathonId] = useState(
    hackathons.some((h) => h.id === initialHackathonId) ? (initialHackathonId as string) : hackathons[0]?.id ?? ""
  );
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    const res = await createHackathonTeamAction({
      hackathonId,
      name,
      description,
      lookingFor: lookingFor
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    onTeamCreated(res.message ?? t.hackathons.teamCreated);
  };

  return (
    <PortalDialog
      title={t.createTeam.title}
      description={t.createTeam.description}
      icon={<Users className="h-4 w-4" />}
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

        <div>
          <label htmlFor="team-hackathon" className={labelClass}>
            {t.createTeam.hackathonLabel}
          </label>
          <select
            id="team-hackathon"
            required
            value={hackathonId}
            onChange={(e) => setHackathonId(e.target.value)}
            className={inputClass}
          >
            {hackathons.map((hackathon) => (
              <option key={hackathon.id} value={hackathon.id}>
                {hackathon.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="team-name" className={labelClass}>
            {t.createTeam.nameLabel}
          </label>
          <input
            id="team-name"
            type="text"
            required
            autoFocus
            minLength={3}
            maxLength={60}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.createTeam.namePlaceholder}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="team-description" className={labelClass}>
            {t.createTeam.descriptionLabel}
          </label>
          <textarea
            id="team-description"
            required
            minLength={10}
            maxLength={600}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.createTeam.descriptionPlaceholder}
            className={`${inputClass} resize-y`}
          />
        </div>

        <div>
          <label htmlFor="team-looking-for" className={labelClass}>
            {t.createTeam.lookingForLabel}
          </label>
          <input
            id="team-looking-for"
            type="text"
            value={lookingFor}
            onChange={(e) => setLookingFor(e.target.value)}
            placeholder={t.createTeam.lookingForPlaceholder}
            aria-describedby="team-looking-for-hint"
            className={inputClass}
          />
          <p id="team-looking-for-hint" className={hintClass}>
            {t.createTeam.listHint}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className={secondaryButton}>
            {t.common.cancel}
          </button>
          <button type="submit" disabled={isSubmitting || !hackathonId} className={primaryButton}>
            {isSubmitting ? t.createTeam.submitting : t.createTeam.submit}
          </button>
        </div>
      </form>
    </PortalDialog>
  );
}

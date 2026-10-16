"use client";

import React, { useState } from "react";
import { AlertCircle, Trophy } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";
import { createHackathonAction } from "@/lib/hackathons/hackathon-actions";
import PortalDialog from "@/components/portal/events/PortalDialog";
import { hintClass, inputClass, labelClass, primaryButton, secondaryButton } from "@/components/portal/events/styles";

interface CreateHackathonModalProps {
  onClose: () => void;
  onCreated: (message: string) => void;
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Adds a hackathon (members with hackathons.create; the server checks the permission again). */
export default function CreateHackathonModal({ onClose, onCreated }: CreateHackathonModalProps) {
  const { locale } = useLocale();
  const t = eventsHackathonsText[locale];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    const res = await createHackathonAction({
      title,
      description,
      locationCountry: location,
      startDate,
      endDate,
      applicationUrl,
      tags: splitList(tags),
    });
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    onCreated(res.message ?? t.hackathons.hackathonCreated);
  };

  return (
    <PortalDialog
      title={t.createHackathon.title}
      description={t.createHackathon.description}
      icon={<Trophy className="h-4 w-4" />}
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
          <label htmlFor="hackathon-title" className={labelClass}>
            {t.createHackathon.titleLabel}
          </label>
          <input
            id="hackathon-title"
            type="text"
            required
            autoFocus
            minLength={3}
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.createHackathon.titlePlaceholder}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="hackathon-description" className={labelClass}>
            {t.createHackathon.descriptionLabel}
          </label>
          <textarea
            id="hackathon-description"
            required
            minLength={10}
            maxLength={2000}
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.createHackathon.descriptionPlaceholder}
            className={`${inputClass} resize-y`}
          />
        </div>

        <div>
          <label htmlFor="hackathon-location" className={labelClass}>
            {t.createHackathon.locationLabel}
          </label>
          <input
            id="hackathon-location"
            type="text"
            required
            minLength={2}
            maxLength={120}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t.createHackathon.locationPlaceholder}
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="hackathon-start" className={labelClass}>
              {t.createHackathon.startLabel}
            </label>
            <input
              id="hackathon-start"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="hackathon-end" className={labelClass}>
              {t.createHackathon.endLabel}
            </label>
            <input
              id="hackathon-end"
              type="date"
              required
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="hackathon-url" className={labelClass}>
            {t.createHackathon.urlLabel}
          </label>
          <input
            id="hackathon-url"
            type="url"
            required
            maxLength={500}
            value={applicationUrl}
            onChange={(e) => setApplicationUrl(e.target.value)}
            placeholder={t.createHackathon.urlPlaceholder}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="hackathon-tags" className={labelClass}>
            {t.createHackathon.tagsLabel}
          </label>
          <input
            id="hackathon-tags"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder={t.createHackathon.tagsPlaceholder}
            aria-describedby="hackathon-tags-hint"
            className={inputClass}
          />
          <p id="hackathon-tags-hint" className={hintClass}>
            {t.createHackathon.listHint}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className={secondaryButton}>
            {t.common.cancel}
          </button>
          <button type="submit" disabled={isSubmitting} className={primaryButton}>
            {isSubmitting ? t.createHackathon.submitting : t.createHackathon.submit}
          </button>
        </div>
      </form>
    </PortalDialog>
  );
}

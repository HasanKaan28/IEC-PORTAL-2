"use client";

import React, { useState } from "react";
import { AlertCircle, CalendarPlus } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";
import { createEventAction } from "@/lib/events/event-actions";
import PortalDialog from "./PortalDialog";
import { inputClass, labelClass, primaryButton, secondaryButton } from "./styles";

interface CreateEventModalProps {
  onClose: () => void;
  onCreated: (message: string) => void;
}

/** Event creation for members with events.manage (the server checks the permission again). */
export default function CreateEventModal({ onClose, onCreated }: CreateEventModalProps) {
  const { locale } = useLocale();
  const t = eventsHackathonsText[locale];
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [venue, setVenue] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (formEvent: React.FormEvent) => {
    formEvent.preventDefault();
    // datetime-local has no zone; interpret it in the organiser's browser zone and send ISO (UTC).
    const start = new Date(dateTime);
    if (!dateTime || Number.isNaN(start.getTime())) {
      setErrorMsg(t.validation.dateTimeInvalid);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    const res = await createEventAction({ title, description, venue, dateTime: start.toISOString() });
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error);
      return;
    }
    onCreated(res.message ?? t.createEvent.created);
  };

  return (
    <PortalDialog
      title={t.createEvent.title}
      description={t.createEvent.description}
      icon={<CalendarPlus className="h-4 w-4" />}
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
          <label htmlFor="event-title" className={labelClass}>
            {t.createEvent.titleLabel}
          </label>
          <input
            id="event-title"
            type="text"
            required
            autoFocus
            minLength={3}
            maxLength={150}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.createEvent.titlePlaceholder}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="event-description" className={labelClass}>
            {t.createEvent.descriptionLabel}
          </label>
          <textarea
            id="event-description"
            required
            minLength={10}
            maxLength={2000}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.createEvent.descriptionPlaceholder}
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="event-venue" className={labelClass}>
              {t.createEvent.venueLabel}
            </label>
            <input
              id="event-venue"
              type="text"
              required
              minLength={2}
              maxLength={150}
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              placeholder={t.createEvent.venuePlaceholder}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="event-datetime" className={labelClass}>
              {t.createEvent.dateTimeLabel}
            </label>
            <input
              id="event-datetime"
              type="datetime-local"
              required
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <button type="button" onClick={onClose} className={secondaryButton}>
            {t.common.cancel}
          </button>
          <button type="submit" disabled={isSubmitting} className={primaryButton}>
            {isSubmitting ? t.createEvent.submitting : t.createEvent.submit}
          </button>
        </div>
      </form>
    </PortalDialog>
  );
}

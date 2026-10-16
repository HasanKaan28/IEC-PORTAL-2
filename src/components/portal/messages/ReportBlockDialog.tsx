"use client";

import React, { useRef, useState } from "react";
import { AlertCircle, Flag, LoaderCircle, ShieldAlert, UserX, X } from "lucide-react";
import type { SupportedLocale } from "@/lib/i18n/translations";
import type { ActionResult } from "@/lib/auth/session";
import { messagesProfileText } from "@/lib/i18n/portal/messages-profile";
import { useDialog } from "./hooks";

type SafetyAction = "report" | "block";

interface ReportBlockDialogProps {
  open: boolean;
  locale: SupportedLocale;
  memberName: string;
  onClose: () => void;
  onSubmit: (actionType: SafetyAction, reason: string) => Promise<ActionResult>;
}

export default function ReportBlockDialog(props: ReportBlockDialogProps) {
  if (!props.open) return null;
  return <ReportBlockPanel {...props} />;
}

function ReportBlockPanel({ locale, memberName, onClose, onSubmit }: ReportBlockDialogProps) {
  const t = messagesProfileText[locale].safety;
  const actionsText = messagesProfileText[locale].actions;
  const common = messagesProfileText[locale].common;
  const [reason, setReason] = useState("");
  const [working, setWorking] = useState<SafetyAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  useDialog(true, onClose, dialogRef, reasonRef);

  const submit = async (actionType: SafetyAction) => {
    if (working) return;
    setError(null);
    const trimmed = reason.trim();
    if (actionType === "report" && trimmed.length < 5) {
      setError(actionsText.reportReasonRequired);
      reasonRef.current?.focus();
      return;
    }
    setWorking(actionType);
    const result = await onSubmit(actionType, trimmed);
    setWorking(null);
    if (!result.success) setError(result.error);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-150"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !working) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="safety-title"
        aria-describedby="safety-intro"
        className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <h2 id="safety-title" className="flex items-center gap-2 text-base font-bold text-slate-900">
            <ShieldAlert className="h-5 w-5 text-rose-600" aria-hidden="true" />
            <span>{t.title}</span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={Boolean(working)}
            aria-label={common.close}
            className="rounded-xl p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-50"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <p id="safety-intro" className="text-sm text-slate-600">
          {t.intro(memberName)}
        </p>

        <div>
          <label htmlFor="safety-reason" className="mb-1 block text-sm font-semibold text-slate-700">
            {t.reasonLabel}
          </label>
          <textarea
            id="safety-reason"
            ref={reasonRef}
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder={t.reasonPlaceholder}
            aria-describedby="safety-reason-hint"
            aria-invalid={error ? true : undefined}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          />
          <p id="safety-reason-hint" className="mt-1 text-xs text-slate-500">
            {t.reasonHint}
          </p>
        </div>

        <p className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">{t.blockExplain}</p>

        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => void submit("block")}
            disabled={Boolean(working)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:opacity-60"
          >
            {working === "block" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <UserX className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{working === "block" ? t.working : t.block}</span>
          </button>
          <button
            type="button"
            onClick={() => void submit("report")}
            disabled={Boolean(working)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {working === "report" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Flag className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{working === "report" ? t.working : t.report}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

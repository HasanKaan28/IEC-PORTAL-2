"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Loader2, MailCheck } from "lucide-react";
import AuthFrame, { PortalNotConfiguredNotice, inputClass } from "@/components/portal/auth/AuthFrame";
import { requestPasswordResetAction } from "@/lib/auth/auth-actions";
import { isAllowedStudentEmail } from "@/lib/auth/email-policy";
import { useLocale } from "@/lib/i18n/locale-context";
import { portalShellText } from "@/lib/i18n/portal/shell";

interface ForgotPasswordFormProps {
  configured: boolean;
  /** Set when the middleware sent the visitor back here from a used, expired or foreign reset link. */
  linkInvalid: boolean;
}

export default function ForgotPasswordForm({ configured, linkInvalid }: ForgotPasswordFormProps) {
  const { locale } = useLocale();
  const t = portalShellText[locale].auth;
  const f = t.forgotPassword;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    if (!isAllowedStudentEmail(String(formData.get("email") ?? ""))) {
      setEmailError(true);
      document.getElementById("forgot-email")?.focus();
      return;
    }
    setEmailError(false);
    setLoading(true);
    try {
      const result = await requestPasswordResetAction(formData);
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error || f.failed);
      }
    } catch {
      setError(f.failed);
    }
    setLoading(false);
  };

  return (
    <AuthFrame
      title={f.title}
      subtitle={f.subtitle}
      footer={
        configured && (
          <p>
            {f.remembered}{" "}
            <Link href="/portal/giris" className="font-semibold text-brand-700 hover:text-brand-800">
              {f.backToSignIn}
            </Link>
          </p>
        )
      }
    >
      {!configured ? (
        <PortalNotConfiguredNotice />
      ) : sent ? (
        <div className="space-y-4 text-center" role="status">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <MailCheck className="w-6 h-6" aria-hidden="true" />
          </span>
          <h2 className="font-display text-lg font-semibold text-slate-900">{f.sentTitle}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{f.sentBody}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {linkInvalid && !error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-800" role="status">
              <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{f.linkInvalid}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700" role="alert">
              <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
              {t.emailLabel}
            </label>
            <input
              id="forgot-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder={t.emailPlaceholder}
              aria-invalid={emailError}
              aria-describedby="forgot-email-hint"
              onChange={() => emailError && setEmailError(false)}
              className={inputClass}
            />
            <p id="forgot-email-hint" className={`mt-1.5 text-xs ${emailError ? "font-medium text-rose-600" : "text-slate-500"}`}>
              {emailError ? t.emailDomainError : t.emailHint}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{f.submitting}</span>
              </>
            ) : (
              <>
                <span>{f.submit}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthFrame>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthFrame, { PortalNotConfiguredNotice, inputClass } from "@/components/portal/auth/AuthFrame";
import { updatePasswordAction } from "@/lib/auth/auth-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { portalShellText } from "@/lib/i18n/portal/shell";

interface ResetPasswordFormProps {
  configured: boolean;
  /** Account the reset link signed in, shown so the member knows which password they are changing. */
  email: string | null;
  /** One-time code from the reset email, verified when the form is submitted. */
  tokenHash: string | null;
}

type FieldError = { field: "password" | "confirmPassword"; message: string };

export default function ResetPasswordForm({ configured, email, tokenHash }: ResetPasswordFormProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = portalShellText[locale].auth;
  const r = t.resetPassword;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<FieldError | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const invalid: FieldError | null =
      password.length < 8
        ? { field: "password", message: r.tooShort }
        : password !== confirmPassword
        ? { field: "confirmPassword", message: r.mismatch }
        : null;
    setFieldError(invalid);
    if (invalid) {
      document.getElementById(invalid.field === "password" ? "reset-password" : "reset-confirm")?.focus();
      return;
    }

    setLoading(true);
    try {
      const result = await updatePasswordAction(formData);
      if (result.success) {
        router.replace("/portal");
        router.refresh();
        return;
      }
      setError(result.error || r.failed);
    } catch {
      setError(r.failed);
    }
    setLoading(false);
  };

  const labelClass = "mb-1.5 block text-sm font-semibold text-slate-700";
  const passwordInvalid = fieldError?.field === "password";
  const confirmInvalid = fieldError?.field === "confirmPassword";

  return (
    <AuthFrame
      title={r.title}
      subtitle={r.subtitle}
      footer={
        configured && (
          <p>
            {r.linkTrouble}{" "}
            <Link href="/portal/sifre-sifirla" className="font-semibold text-brand-700 hover:text-brand-800">
              {r.requestNew}
            </Link>
          </p>
        )
      }
    >
      {!configured ? (
        <PortalNotConfiguredNotice />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700" role="alert">
              <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          {tokenHash && <input type="hidden" name="tokenHash" value={tokenHash} />}

          {email && (
            <>
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {r.account}: <span className="break-all font-semibold text-slate-900">{email}</span>
              </p>
              {/* Lets password managers file the new password under the right account. */}
              <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
            </>
          )}

          <div>
            <label htmlFor="reset-password" className={labelClass}>
              {r.newPassword}
            </label>
            <div className="relative">
              <input
                id="reset-password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                minLength={8}
                maxLength={128}
                autoComplete="new-password"
                aria-invalid={passwordInvalid}
                aria-describedby="reset-password-hint"
                onChange={() => passwordInvalid && setFieldError(null)}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                aria-pressed={showPassword}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
              >
                {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
            <p id="reset-password-hint" className={`mt-1.5 text-xs ${passwordInvalid ? "font-medium text-rose-600" : "text-slate-500"}`}>
              {passwordInvalid ? fieldError?.message : r.passwordHint}
            </p>
          </div>

          <div>
            <label htmlFor="reset-confirm" className={labelClass}>
              {r.confirmPassword}
            </label>
            <input
              id="reset-confirm"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              aria-invalid={confirmInvalid}
              aria-describedby={confirmInvalid ? "reset-confirm-error" : undefined}
              onChange={() => confirmInvalid && setFieldError(null)}
              className={inputClass}
            />
            {confirmInvalid && (
              <p id="reset-confirm-error" className="mt-1.5 text-xs font-medium text-rose-600">
                {fieldError?.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-600/30 transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{r.submitting}</span>
              </>
            ) : (
              <>
                <span>{r.submit}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthFrame>
  );
}

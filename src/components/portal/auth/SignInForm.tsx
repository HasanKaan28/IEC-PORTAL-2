"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react";
import AuthFrame, { PortalNotConfiguredNotice, inputClass } from "@/components/portal/auth/AuthFrame";
import { signInAction } from "@/lib/auth/auth-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { portalShellText } from "@/lib/i18n/portal/shell";

interface SignInFormProps {
  configured: boolean;
  redirectTo: string;
  justVerified: boolean;
}

export default function SignInForm({ configured, redirectTo, justVerified }: SignInFormProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const t = portalShellText[locale].auth;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await signInAction(new FormData(event.currentTarget));
      if (result.success) {
        router.replace(redirectTo);
        router.refresh();
        return;
      }
      setError(result.error || t.signIn.failed);
    } catch {
      setError(t.signIn.failed);
    }
    setLoading(false);
  };

  return (
    <AuthFrame
      title={t.signIn.title}
      subtitle={t.signIn.subtitle}
      footer={
        configured && (
          <p>
            {t.signIn.noAccount}{" "}
            <Link href="/portal/kayit" className="font-semibold text-brand-700 hover:text-brand-800">
              {t.signIn.register}
            </Link>
          </p>
        )
      }
    >
      {!configured ? (
        <PortalNotConfiguredNotice />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate={false}>
          {justVerified && !error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-sm text-emerald-800" role="status">
              <CheckCircle2 className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{t.signIn.verifyNotice}</span>
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-sm text-rose-700" role="alert">
              <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="signin-email" className="mb-1.5 block text-sm font-semibold text-slate-700">
              {t.emailLabel}
            </label>
            <input
              id="signin-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder={t.emailPlaceholder}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="signin-password" className="mb-1.5 block text-sm font-semibold text-slate-700">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <input
                id="signin-password"
                type={showPassword ? "text" : "password"}
                name="password"
                required
                autoComplete="current-password"
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
                aria-pressed={showPassword}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/40"
              >
                {showPassword ? <EyeOff className="w-4 h-4" aria-hidden="true" /> : <Eye className="w-4 h-4" aria-hidden="true" />}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link
                href="/portal/sifre-sifirla"
                className="rounded text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/40"
              >
                {t.signIn.forgotPassword}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-xs shadow-brand-600/30 transition-colors hover:bg-brand-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>{t.signIn.submitting}</span>
              </>
            ) : (
              <>
                <span>{t.signIn.submit}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      )}
    </AuthFrame>
  );
}

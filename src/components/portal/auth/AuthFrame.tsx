"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";
import ClubLogo from "@/components/shared/ClubLogo";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { useLocale } from "@/lib/i18n/locale-context";
import { portalShellText } from "@/lib/i18n/portal/shell";

interface AuthFrameProps {
  title: string;
  subtitle: string;
  wide?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Full-screen frame for sign-in and sign-up: dark brand backdrop, white club seal, light form card. */
export default function AuthFrame({ title, subtitle, wide = false, children, footer }: AuthFrameProps) {
  const { locale } = useLocale();
  const t = portalShellText[locale].auth;

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950 px-4 py-10 selection:bg-brand-500/30">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_50%_-10%,rgba(209,52,156,0.28),transparent_70%),radial-gradient(40rem_20rem_at_100%_110%,rgba(234,179,8,0.10),transparent_70%)]"
      />
      <div className="relative mx-auto flex max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>{t.backHome}</span>
        </Link>
        <LanguageSwitcher />
      </div>

      <main className={`relative mx-auto mt-8 w-full ${wide ? "max-w-xl" : "max-w-md"}`}>
        <div className="mb-6 text-center">
          <Link href="/" className="inline-block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60">
            <ClubLogo size={72} priority className="mx-auto drop-shadow-[0_0_24px_rgba(209,52,156,0.5)]" />
          </Link>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white p-6 shadow-2xl shadow-black/40 sm:p-8">{children}</div>

        {footer && <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>}
      </main>
    </div>
  );
}

/** Shown instead of the form while the portal has no database connection. */
export function PortalNotConfiguredNotice() {
  const { locale } = useLocale();
  const t = portalShellText[locale].auth;
  return (
    <div className="space-y-4 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-100 text-accent-700">
        <Wrench className="w-6 h-6" aria-hidden="true" />
      </span>
      <div>
        <h2 className="font-display text-lg font-semibold text-slate-900">{t.notConfiguredTitle}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.notConfiguredBody}</p>
      </div>
      <Link
        href="/basvuru"
        className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2"
      >
        {t.applyCta}
      </Link>
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 aria-[invalid=true]:border-rose-400";

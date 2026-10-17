import React from "react";
import Link from "next/link";
import { Home, LayoutDashboard, SearchX } from "lucide-react";
import ClubLogo from "@/components/shared/ClubLogo";
import { getServerLocale } from "@/lib/i18n/server";
import { publicPagesText } from "@/lib/i18n/public/pages";

export default async function NotFound() {
  const t = publicPagesText[await getServerLocale()].notFound;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas p-6 text-slate-900">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-palette-wash"
      />
      <main className="relative z-10 w-full max-w-lg space-y-6 text-center">
        <ClubLogo size={64} className="mx-auto opacity-90" alt="" />
        <p className="inline-flex items-center gap-2 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700">
          <SearchX className="h-4 w-4" aria-hidden="true" />
          {t.badge}
        </p>
        <div className="space-y-2">
          <p className="bg-linear-to-b/srgb from-brand-700 via-brand-500 to-accent-600 bg-clip-text font-mono text-7xl font-black tracking-tighter text-transparent md:text-8xl">
            404
          </p>
          <h1 className="font-display text-xl font-bold text-slate-800 md:text-2xl">{t.title}</h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-500">{t.body}</p>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 sm:flex-row">
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700 sm:w-auto"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            {t.home}
          </Link>
          <Link
            href="/portal"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 sm:w-auto"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
            {t.portal}
          </Link>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <Link href="/projeler" className="transition-colors hover:text-brand-700">
            {t.projects}
          </Link>
          <Link href="/blog" className="transition-colors hover:text-brand-700">
            {t.blog}
          </Link>
          <Link href="/dogrula" className="transition-colors hover:text-brand-700">
            {t.verify}
          </Link>
        </nav>
      </main>
    </div>
  );
}

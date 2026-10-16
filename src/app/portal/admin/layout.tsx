import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Shield } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessAdminConsole, visibleAdminSections } from "@/lib/admin/admin-access";
import { getServerLocale } from "@/lib/i18n/server";
import { adminText } from "@/lib/i18n/portal/admin";
import AdminTabs from "./_components/AdminTabs";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!canAccessAdminConsole(user)) redirect("/portal");

  const t = adminText[await getServerLocale()].layout;

  return (
    <div className="max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <Shield className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{t.badge}</p>
            <h1 className="mt-0.5 font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {t.title}
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-500">{t.subtitle}</p>
          </div>
        </div>
        <Link
          href="/portal"
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:self-auto"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>{t.backToPortal}</span>
        </Link>
      </header>

      <AdminTabs items={visibleAdminSections(user)} />

      <div>{children}</div>
    </div>
  );
}

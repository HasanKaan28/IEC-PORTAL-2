import React from "react";
import { redirect } from "next/navigation";
import { ExternalLink, FileSpreadsheet, UserCheck } from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessAdminSection } from "@/lib/admin/admin-access";
import { getServerLocale } from "@/lib/i18n/server";
import { adminText } from "@/lib/i18n/portal/admin";
import { PageHeader, focusRing } from "../_components/AdminUi";

const RESPONSES_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/1pLeiQpBNSfDFPGa5IqLbSGoz0Z2Lm3Olu-mq3XZhzbQ/edit";
const APPLICATION_FORM_URL = "https://forms.gle/v8c85MgFUmVvpzTH6";

export default async function ApplicationsPage() {
  const user = await getSessionUser();
  if (!canAccessAdminSection(user, "applications")) redirect("/portal/admin");

  const text = adminText[await getServerLocale()];
  const t = text.applications;

  return (
    <div className="space-y-6">
      <PageHeader title={t.title} />

      <section className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-100 text-accent-700">
            <UserCheck className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="space-y-3 text-sm leading-relaxed text-slate-700">
            <p>{t.body1}</p>
            <p>{t.body2}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={RESPONSES_SHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 ${focusRing}`}
          >
            <FileSpreadsheet className="h-4 w-4" aria-hidden="true" />
            <span>{t.openSheet}</span>
            <span className="sr-only">{text.common.newTab}</span>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={APPLICATION_FORM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${focusRing}`}
          >
            <span>{t.openForm}</span>
            <span className="sr-only">{text.common.newTab}</span>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>

        <p className="mt-4 text-xs text-slate-500">{t.accessNote}</p>
      </section>
    </div>
  );
}

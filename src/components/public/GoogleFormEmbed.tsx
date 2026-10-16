"use client";

import React, { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { publicPagesText } from "@/lib/i18n/public/pages";

/** The club's membership form (Google Forms). The short link is what we share elsewhere. */
export const APPLICATION_FORM_SHORT_URL = "https://forms.gle/v8c85MgFUmVvpzTH6";
const APPLICATION_FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfauNEVtjNGoRMSC0kZh6znPb3LYv_jqhTU-ot2Q-eQCVmiKA/viewform?embedded=true";

export default function GoogleFormEmbed() {
  const { locale } = useLocale();
  const t = publicPagesText[locale].apply;
  const [loaded, setLoaded] = useState(false);

  return (
    <div>
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl shadow-black/40">
        {!loaded && (
          <div className="absolute inset-x-0 top-0 flex h-80 flex-col items-center justify-center gap-3 bg-white text-sm text-slate-500" role="status">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" aria-hidden="true" />
            <span>{t.loading}</span>
          </div>
        )}
        <iframe
          key={locale}
          src={`${APPLICATION_FORM_EMBED_URL}&hl=${locale}`}
          title={t.formTitle}
          onLoad={() => setLoaded(true)}
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[2250px] w-full border-0 sm:h-[2050px]"
        >
          {t.loading}
        </iframe>
      </div>
      <a
        href={APPLICATION_FORM_SHORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-slate-400 underline-offset-4 transition-colors hover:text-white hover:underline"
      >
        {t.openNewTab}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}

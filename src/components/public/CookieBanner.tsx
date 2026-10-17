"use client";

import React, { useEffect, useId, useState } from "react";
import Link from "next/link";
import { Cookie, ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
}

const CONSENT_STORAGE_KEY = "iec_cookie_consent";
const ESSENTIAL_ONLY: CookiePreferences = { necessary: true, analytics: false, preferences: false };
const ALL_ACCEPTED: CookiePreferences = { necessary: true, analytics: true, preferences: true };

function hasStoredConsent(): boolean {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) !== null;
  } catch {
    return false;
  }
}

function storeConsent(preferences: CookiePreferences) {
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    // Storage blocked: the banner closes for this visit and asks again next time.
  }
}

export default function CookieBanner() {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>(ESSENTIAL_ONLY);
  const detailsId = useId();
  const analyticsId = useId();
  const preferencesId = useId();

  useEffect(() => {
    if (!hasStoredConsent()) setIsOpen(true);
  }, []);

  const saveConsent = (chosen: CookiePreferences) => {
    storeConsent(chosen);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label={t.cookieBanner.regionLabel}
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 bg-white/90 backdrop-blur-xl border border-brand-100 rounded-2xl p-5 sm:p-6 shadow-soft text-slate-600 text-sm animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-700 flex items-center justify-center shrink-0">
          <Cookie className="w-4 h-4" aria-hidden="true" />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-slate-900 text-base">{t.cookieBanner.title}</h2>
          <p className="mt-1 text-slate-600 leading-relaxed">{t.cookieBanner.desc}</p>
        </div>
      </div>

      {showDetails && (
        <div id={detailsId} className="mt-4 pt-3 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div>
              <span className="font-semibold text-slate-900 block">{t.cookieBanner.necessaryTitle}</span>
              <span className="text-xs text-slate-500">{t.cookieBanner.necessaryDesc}</span>
            </div>
            <span className="shrink-0 text-xs px-2 py-1 rounded bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
              {t.cookieBanner.necessaryStatus}
            </span>
          </div>

          <label
            htmlFor={analyticsId}
            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer"
          >
            <span>
              <span className="font-semibold text-slate-900 block">{t.cookieBanner.analyticsTitle}</span>
              <span className="text-xs text-slate-500">{t.cookieBanner.analyticsDesc}</span>
            </span>
            <input
              id={analyticsId}
              type="checkbox"
              checked={prefs.analytics}
              onChange={(event) => setPrefs({ ...prefs, analytics: event.target.checked })}
              className="shrink-0 w-5 h-5 rounded border-slate-300 accent-brand-600"
            />
          </label>

          <label
            htmlFor={preferencesId}
            className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer"
          >
            <span>
              <span className="font-semibold text-slate-900 block">{t.cookieBanner.preferencesTitle}</span>
              <span className="text-xs text-slate-500">{t.cookieBanner.preferencesDesc}</span>
            </span>
            <input
              id={preferencesId}
              type="checkbox"
              checked={prefs.preferences}
              onChange={(event) => setPrefs({ ...prefs, preferences: event.target.checked })}
              className="shrink-0 w-5 h-5 rounded border-slate-300 accent-brand-600"
            />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <Link href="/cerezler" className="text-brand-700 hover:text-slate-900 underline-offset-2 hover:underline">
          {t.cookieBanner.cookiePolicy}
        </Link>
        <Link href="/kvkk" className="text-brand-700 hover:text-slate-900 underline-offset-2 hover:underline">
          {t.cookieBanner.readKvkk}
        </Link>
        <button
          type="button"
          onClick={() => setShowDetails((open) => !open)}
          aria-expanded={showDetails}
          aria-controls={detailsId}
          className="ml-auto inline-flex items-center gap-1 text-slate-600 hover:text-slate-900"
        >
          <span>{showDetails ? t.cookieBanner.hidePreferences : t.cookieBanner.managePreferences}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
        </button>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
        {showDetails ? (
          <button
            type="button"
            onClick={() => saveConsent(prefs)}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium transition-colors"
          >
            {t.cookieBanner.saveSelection}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => saveConsent(ESSENTIAL_ONLY)}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 hover:text-slate-900 font-medium transition-colors"
          >
            {t.cookieBanner.rejectOptional}
          </button>
        )}
        <button
          type="button"
          onClick={() => saveConsent(ALL_ACCEPTED)}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
        >
          {t.cookieBanner.acceptAll}
        </button>
      </div>
    </div>
  );
}

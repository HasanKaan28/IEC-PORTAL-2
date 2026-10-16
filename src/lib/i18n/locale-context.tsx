"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getDictionary, type Dictionary, type SupportedLocale } from "./translations";

const STORAGE_KEY = "iec_locale";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

interface LocaleContextValue {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: Dictionary;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function isSupportedLocale(value: unknown): value is SupportedLocale {
  return value === "tr" || value === "en";
}

function readSavedLocale(): SupportedLocale | null {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isSupportedLocale(saved) ? saved : null;
  } catch {
    return null;
  }
}

function persistLocale(locale: SupportedLocale) {
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // Storage can be blocked (private mode); the cookie below still records the choice.
  }
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>("tr");

  useEffect(() => {
    const saved = readSavedLocale();
    if (saved) setLocaleState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: SupportedLocale) => {
    setLocaleState(next);
    persistLocale(next);
  }, []);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: getDictionary(locale) }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used inside <LocaleProvider>.");
  }
  return context;
}

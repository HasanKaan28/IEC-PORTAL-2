"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import type { SupportedLocale } from "@/lib/i18n/translations";

interface LanguageSwitcherProps {
  className?: string;
  /** "dark" for the public site and dark panels, "light" for white headers such as the portal. */
  tone?: "dark" | "light";
}

const TONES = {
  dark: {
    group: "bg-slate-900/60 border-slate-800",
    icon: "text-slate-400",
    active: "bg-brand-500/20 text-brand-300",
    idle: "text-slate-400 hover:text-white",
  },
  light: {
    group: "bg-slate-100 border-slate-200",
    icon: "text-slate-500",
    active: "bg-white text-brand-700 shadow-sm",
    idle: "text-slate-500 hover:text-slate-900",
  },
};

const OPTIONS: Array<{ locale: SupportedLocale; label: string; name: string }> = [
  { locale: "tr", label: "TR", name: "Türkçe" },
  { locale: "en", label: "EN", name: "English" },
];

export default function LanguageSwitcher({ className = "", tone = "dark" }: LanguageSwitcherProps) {
  const { locale: currentLocale, setLocale, t } = useLocale();
  const styles = TONES[tone];

  return (
    <div
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-lg border text-xs font-mono select-none ${styles.group} ${className}`}
      role="group"
      aria-label={t.common.languageSwitcher}
    >
      <Globe className={`w-3.5 h-3.5 ml-1.5 mr-0.5 ${styles.icon}`} aria-hidden="true" />
      {OPTIONS.map((option) => {
        const isActive = currentLocale === option.locale;
        return (
          <button
            key={option.locale}
            type="button"
            lang={option.locale}
            onClick={() => setLocale(option.locale)}
            aria-pressed={isActive}
            aria-label={option.name}
            className={`min-w-[2rem] min-h-[2rem] px-2 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 ${
              isActive ? styles.active : styles.idle
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

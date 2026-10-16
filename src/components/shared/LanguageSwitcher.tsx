"use client";

import React from "react";
import { Globe } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import type { SupportedLocale } from "@/lib/i18n/translations";

interface LanguageSwitcherProps {
  className?: string;
}

const OPTIONS: Array<{ locale: SupportedLocale; label: string; name: string }> = [
  { locale: "tr", label: "TR", name: "Türkçe" },
  { locale: "en", label: "EN", name: "English" },
];

export default function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { locale: currentLocale, setLocale, t } = useLocale();

  return (
    <div
      className={`inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono select-none ${className}`}
      role="group"
      aria-label={t.common.languageSwitcher}
    >
      <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" aria-hidden="true" />
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
            className={`min-w-[2rem] min-h-[2rem] px-2 rounded-md font-semibold transition-colors ${
              isActive ? "bg-blue-500/20 text-blue-300" : "text-slate-400 hover:text-white"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

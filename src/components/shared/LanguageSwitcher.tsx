"use client";

import React, { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { SupportedLocale } from "@/lib/i18n/translations";

interface LanguageSwitcherProps {
  className?: string;
}

export default function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const [currentLocale, setCurrentLocale] = useState<SupportedLocale>("tr");

  useEffect(() => {
    // Read from cookie or localStorage
    const saved = localStorage.getItem("iec_locale") as SupportedLocale;
    if (saved && (saved === "tr" || saved === "en")) {
      setCurrentLocale(saved);
    }
  }, []);

  const handleToggle = (locale: SupportedLocale) => {
    setCurrentLocale(locale);
    localStorage.setItem("iec_locale", locale);
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    // Optional event dispatch for listeners without hard refresh
    window.dispatchEvent(new CustomEvent("iec_locale_change", { detail: locale }));
  };

  return (
    <div
      className={`inline-flex items-center gap-1 p-0.5 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono select-none ${className}`}
      role="group"
      aria-label="Dil Seçici"
    >
      <Globe className="w-3 h-3 text-slate-500 ml-1.5 mr-0.5" />
      <button
        onClick={() => handleToggle("tr")}
        className={`px-2 py-0.5 rounded transition-all font-medium ${
          currentLocale === "tr"
            ? "bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30 shadow-xs"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="Türkçe"
      >
        TR
      </button>
      <span className="text-slate-750 text-[10px]">•</span>
      <button
        onClick={() => handleToggle("en")}
        className={`px-2 py-0.5 rounded transition-all font-medium ${
          currentLocale === "en"
            ? "bg-sky-500/20 text-sky-400 font-bold border border-sky-500/30 shadow-xs"
            : "text-slate-400 hover:text-slate-200"
        }`}
        title="English"
      >
        EN
      </button>
    </div>
  );
}

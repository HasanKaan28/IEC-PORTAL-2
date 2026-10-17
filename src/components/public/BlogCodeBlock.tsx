"use client";

import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { blogText } from "@/lib/i18n/public/blog";

/** Code block with a language label and a copy button, shared by both blog renderers. */
export default function BlogCodeBlock({ language, code }: { language: string; code: string }) {
  const { locale } = useLocale();
  const t = blogText[locale].code;
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2000);
  };

  return (
    <div className="my-6 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-200 text-xs font-mono text-slate-500">
        <span className="text-brand-700 font-semibold uppercase">
          {language || t.fallbackLanguage}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors text-xs focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-400/70"
        >
          {copyState === "copied" ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
              <span className="text-emerald-600">{t.copied}</span>
            </>
          ) : copyState === "failed" ? (
            <span className="text-rose-600">{t.copyFailed}</span>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.copy}</span>
            </>
          )}
        </button>
        <span className="sr-only" role="status" aria-live="polite">
          {copyState === "copied" ? t.copied : copyState === "failed" ? t.copyFailed : ""}
        </span>
      </div>
      <pre className="p-4 overflow-x-auto text-xs sm:text-sm/5 font-mono text-slate-700 leading-relaxed selection:bg-brand-900 selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
}

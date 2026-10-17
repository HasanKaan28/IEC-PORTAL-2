"use client";

import React, { useState, useTransition } from "react";
import { ImageOff, Loader2 } from "lucide-react";
import { sweepUnusedBlogImagesAction } from "@/lib/blog/blog-image-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { adminText } from "@/lib/i18n/portal/admin";

const focusRing =
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

/** Moderators only: removes blog photos that no post uses any more. */
export default function AdminBlogImageSweepButton() {
  const { locale } = useLocale();
  const t = adminText[locale].blogList;
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const sweep = () => {
    setResult(null);
    startTransition(async () => {
      try {
        const response = await sweepUnusedBlogImagesAction();
        setResult(
          response.success
            ? { ok: true, text: response.message ?? t.cleanupDone(response.data?.removed ?? 0, response.data?.checked ?? 0) }
            : { ok: false, text: response.error }
        );
      } catch {
        setResult({ ok: false, text: t.cleanupFailed });
      }
    });
  };

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={sweep}
        disabled={isPending}
        title={t.cleanupHint}
        aria-describedby="blog-image-sweep-hint"
        className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 ${focusRing}`}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" aria-hidden="true" />
        ) : (
          <ImageOff className="h-4 w-4 text-slate-500" aria-hidden="true" />
        )}
        <span>{isPending ? t.cleaning : t.cleanup}</span>
      </button>
      <span id="blog-image-sweep-hint" className="sr-only">
        {t.cleanupHint}
      </span>
      <span
        role="status"
        aria-live="polite"
        className={`max-w-[18rem] text-right text-xs ${result?.ok === false ? "text-rose-700" : "text-slate-600"}`}
      >
        {result?.text ?? ""}
      </span>
    </span>
  );
}

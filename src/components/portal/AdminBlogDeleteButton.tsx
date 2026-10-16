"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteBlogPostAction } from "@/lib/blog/blog-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { adminText } from "@/lib/i18n/portal/admin";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

export default function AdminBlogDeleteButton({ slug, title }: { slug: string; title?: string }) {
  const router = useRouter();
  const { locale } = useLocale();
  const text = adminText[locale];
  const t = text.blogList;

  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const label = t.deleteLabel(title ?? `/${slug}`);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteBlogPostAction(slug);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  };

  if (confirming) {
    return (
      <span className="inline-flex flex-col items-end gap-1">
        <span className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            aria-label={`${t.confirmDelete}: ${label}`}
            className={`inline-flex items-center gap-1 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60 ${focusRing}`}
          >
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
            <span>{isPending ? t.deleting : t.confirmDelete}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
            disabled={isPending}
            className={`rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 ${focusRing}`}
          >
            {text.common.cancel}
          </button>
        </span>
        {error && (
          <span role="alert" className="max-w-[16rem] whitespace-normal text-right text-xs text-rose-700">
            {error}
          </span>
        )}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 ${focusRing}`}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

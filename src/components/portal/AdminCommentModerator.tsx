"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExternalLink, Flag, Loader2, MessageSquare, ShieldAlert, Trash2 } from "lucide-react";
import type { BlogCommentItem } from "@/lib/blog/blog-data";
import type { AdminCommentItem } from "@/lib/blog/blog-queries";
import { deleteBlogCommentAction, flagBlogCommentAction } from "@/lib/blog/blog-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDateTime } from "@/lib/i18n/format";
import { adminText } from "@/lib/i18n/portal/admin";
import { EmptyState, Notice, PageHeader, focusRing } from "@/app/portal/admin/_components/AdminUi";
import { MemberName } from "@/components/portal/MemberCard";

interface AdminCommentModeratorProps {
  initialComments: Array<BlogCommentItem | AdminCommentItem>;
}

export default function AdminCommentModerator({ initialComments }: AdminCommentModeratorProps) {
  const { locale } = useLocale();
  const text = adminText[locale];
  const t = text.comments;

  const [comments, setComments] = useState<AdminCommentItem[]>(initialComments);
  const [filter, setFilter] = useState<"all" | "flagged">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const flaggedCount = comments.filter((c) => c.isFlagged).length;
  const visible = filter === "flagged" ? comments.filter((c) => c.isFlagged) : comments;

  const handleDelete = async (id: string) => {
    setBusyId(id);
    setNotice(null);
    const result = await deleteBlogCommentAction(id);
    setBusyId(null);
    setConfirmId(null);
    if (!result.success) {
      setNotice({ tone: "error", text: result.error });
      return;
    }
    // Replies are removed by the database cascade, so drop them here too.
    setComments((prev) => prev.filter((c) => c.id !== id && c.parentId !== id));
    setNotice({ tone: "success", text: t.deleted });
  };

  const handleFlag = async (comment: AdminCommentItem) => {
    const next = !comment.isFlagged;
    setBusyId(comment.id);
    setNotice(null);
    const result = await flagBlogCommentAction(comment.id, next);
    setBusyId(null);
    if (!result.success) {
      setNotice({ tone: "error", text: result.error });
      return;
    }
    setComments((prev) => prev.map((c) => (c.id === comment.id ? { ...c, isFlagged: next } : c)));
    setNotice({ tone: "success", text: next ? t.flaggedToast : t.unflaggedToast });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <div role="group" aria-label={t.filterLabel} className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-sm font-medium">
            <button
              type="button"
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${focusRing} ${
                filter === "all" ? "bg-white font-semibold text-slate-900 shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t.all(comments.length)}
            </button>
            <button
              type="button"
              aria-pressed={filter === "flagged"}
              onClick={() => setFilter("flagged")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors ${focusRing} ${
                filter === "flagged" ? "bg-rose-600 font-semibold text-white shadow-xs" : "text-rose-700 hover:bg-rose-50"
              }`}
            >
              <ShieldAlert className="h-4 w-4" aria-hidden="true" />
              <span>{t.flagged(flaggedCount)}</span>
            </button>
          </div>
        }
      />

      {notice && (
        <Notice tone={notice.tone} onDismiss={() => setNotice(null)} dismissLabel={text.common.dismiss}>
          {notice.text}
        </Notice>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {visible.length === 0 ? (
          <EmptyState
            icon={filter === "flagged" ? ShieldAlert : MessageSquare}
            message={filter === "flagged" ? t.emptyFlagged : t.emptyAll}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((comment) => {
              const busy = busyId === comment.id;
              const postLabel = comment.postTitle || `/${comment.postSlug}`;
              return (
                <li key={comment.id} className={`p-5 ${comment.isFlagged ? "bg-rose-50/50" : ""}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <MemberName userId={comment.userId} name={comment.authorName} className="text-sm font-semibold text-slate-900" />
                        {comment.authorEmail && <span className="text-xs text-slate-500">{comment.authorEmail}</span>}
                        {comment.parentId && (
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                            {t.replyBadge}
                          </span>
                        )}
                        {comment.isFlagged && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">
                            <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
                            {t.flaggedBadge}
                          </span>
                        )}
                        <time dateTime={comment.createdAt} className="text-xs text-slate-500" suppressHydrationWarning>
                          {formatDateTime(comment.createdAt, locale)}
                        </time>
                      </div>

                      {comment.postSlug && (
                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-600">
                          <span>{t.onPost}</span>
                          <Link
                            href={`/blog/${comment.postSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={t.openPost(postLabel)}
                            className={`inline-flex items-center gap-1 rounded font-semibold text-brand-600 hover:underline ${focusRing}`}
                          >
                            <span className="break-all">{postLabel}</span>
                            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        </div>
                      )}

                      <p className="whitespace-pre-line wrap-break-word pt-1 text-sm leading-relaxed text-slate-700">
                        {comment.content}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2 self-end sm:self-start">
                      {confirmId === comment.id ? (
                        <>
                          <span className="text-xs text-slate-600">{t.confirmPrompt}</span>
                          <button
                            type="button"
                            onClick={() => handleDelete(comment.id)}
                            disabled={busy}
                            className={`inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60 ${focusRing}`}
                          >
                            {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                            <span>{busy ? t.working : t.confirmDelete}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            disabled={busy}
                            className={`rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 ${focusRing}`}
                          >
                            {text.common.cancel}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => handleFlag(comment)}
                            disabled={busy}
                            aria-pressed={comment.isFlagged}
                            className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60 ${focusRing}`}
                          >
                            {busy ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <Flag className="h-4 w-4" aria-hidden="true" />
                            )}
                            <span>{comment.isFlagged ? t.unflag : t.flag}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(comment.id)}
                            disabled={busy}
                            className={`inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-60 ${focusRing}`}
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            <span>{t.delete}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

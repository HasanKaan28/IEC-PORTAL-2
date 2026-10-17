"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { MessageSquare, Reply, Flag, Send, ShieldAlert, CheckCircle2, LogIn } from "lucide-react";
import { BlogCommentItem } from "@/lib/blog/blog-data";
import { addBlogCommentAction, flagBlogCommentAction } from "@/lib/blog/blog-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate } from "@/lib/i18n/format";
import { blogSignInHref, blogText } from "@/lib/i18n/public/blog";

interface BlogCommentSectionProps {
  postSlug: string;
  initialComments: BlogCommentItem[];
  /** The signed-in visitor, or null. Only signed-in visitors get the comment form. */
  currentUser: { id: string; fullName: string } | null;
  /** blog.moderate holders can flag comments; the action enforces this too. */
  canModerate: boolean;
}

type AddCommentResult = Awaited<ReturnType<typeof addBlogCommentAction>>;
type FlagResult = Awaited<ReturnType<typeof flagBlogCommentAction>>;
type Toast = { text: string; tone: "success" | "error" };
type FormError = { target: string; text: string };

const ROOT_TARGET = "root";
/** Mirrors BLOG_LIMITS.commentMin in the action, so short comments fail fast without a request. */
const MIN_COMMENT_LENGTH = 3;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";
const TEXTAREA_CLASS =
  "w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/30 transition-colors resize-none";

export default function BlogCommentSection({
  postSlug,
  initialComments,
  currentUser,
  canModerate,
}: BlogCommentSectionProps) {
  const { locale } = useLocale();
  const t = blogText[locale].comments;
  const formId = useId();

  const [comments, setComments] = useState<BlogCommentItem[]>(initialComments);
  const [newContent, setNewContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<FormError | null>(null);
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (text: string, tone: Toast["tone"] = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ text, tone });
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  };

  const canComment = currentUser !== null;
  const signInHref = blogSignInHref(`/blog/${postSlug}`);
  const totalCount = comments.reduce((sum, c) => sum + 1 + (c.replies?.length ?? 0), 0);

  const handleAddComment = async (parentId: string | null) => {
    const target = parentId ?? ROOT_TARGET;
    const text = parentId ? replyContent : newContent;
    if (text.trim().length < MIN_COMMENT_LENGTH) {
      setFormError({ target, text: t.minLength });
      return;
    }

    setLoading(true);
    setFormError(null);

    let res: AddCommentResult;
    try {
      res = await addBlogCommentAction({ postSlug, parentId, content: text });
    } catch {
      res = { success: false, error: t.saveFailed };
    }

    setLoading(false);

    if (!res.success) {
      setFormError({ target, text: res.error || t.saveFailed });
      return;
    }

    const created = res.comment;
    // The server attaches replies to the thread's root comment, so follow its parentId.
    const threadId = created.parentId ?? parentId;
    if (threadId) {
      setComments((prev) =>
        prev.map((c) => (c.id === threadId ? { ...c, replies: [...(c.replies || []), created] } : c))
      );
      setReplyContent("");
      setReplyingTo(null);
    } else {
      setComments((prev) => [created, ...prev]);
      setNewContent("");
    }
    showToast(res.message || t.published);
  };

  const handleFlag = async (commentId: string) => {
    if (!canModerate || flaggedIds.includes(commentId)) return;

    let res: FlagResult;
    try {
      res = await flagBlogCommentAction(commentId);
    } catch {
      res = { success: false, error: t.reportFailed };
    }

    if (res.success) {
      setFlaggedIds((prev) => [...prev, commentId]);
      showToast(res.message || t.reportDone);
    } else {
      showToast(res.error || t.reportFailed, "error");
    }
  };

  const renderError = (target: string) =>
    formError?.target === target ? (
      <div role="alert" className="flex items-center gap-1.5 text-xs text-rose-600">
        <ShieldAlert className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{formError.text}</span>
      </div>
    ) : null;

  return (
    <section aria-labelledby={`${formId}-heading`} className="mt-16 pt-12 border-t border-slate-200">
      {/* Toast */}
      <div aria-live="polite" role="status" className="fixed bottom-6 right-6 z-50">
        {toast && (
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs shadow-2xl backdrop-blur-md bg-white ${
              toast.tone === "success"
                ? "border-emerald-500/40 text-slate-800"
                : "border-rose-500/40 text-rose-700"
            }`}
          >
            {toast.tone === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-rose-600" aria-hidden="true" />
            )}
            <span>{toast.text}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-8">
        <MessageSquare className="w-5 h-5 text-brand-600" aria-hidden="true" />
        <h2 id={`${formId}-heading`} className="text-xl font-bold text-slate-900 font-display">
          {t.heading}
        </h2>
        <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-brand-800 font-mono text-xs border border-slate-300 tabular-nums">
          <span aria-hidden="true">{totalCount}</span>
          <span className="sr-only">{t.count(totalCount)}</span>
        </span>
      </div>

      {/* New comment */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-200 mb-10">
        {currentUser ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              void handleAddComment(null);
            }}
          >
            <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400" aria-hidden="true" />
              <span>{t.signedInAs}</span>
              <strong className="text-slate-900">{currentUser.fullName}</strong>
            </div>

            <label htmlFor={`${formId}-comment`} className="block text-xs font-medium text-slate-600">
              {t.commentLabel}
            </label>
            <textarea
              id={`${formId}-comment`}
              name="comment"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={t.commentPlaceholder}
              rows={3}
              aria-describedby={`${formId}-comment-note`}
              aria-invalid={formError?.target === ROOT_TARGET || undefined}
              className={TEXTAREA_CLASS}
            />

            {renderError(ROOT_TARGET)}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span id={`${formId}-comment-note`} className="text-xs text-slate-500 font-mono">
                {t.plainTextNote}
              </span>
              <button
                type="submit"
                disabled={loading || !newContent.trim()}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${FOCUS_RING}`}
              >
                <Send className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{loading && !replyingTo ? t.submitting : t.submit}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 px-4 text-center space-y-3">
            <div
              className="w-10 h-10 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-700 flex items-center justify-center mx-auto"
              aria-hidden="true"
            >
              <LogIn className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">{t.signInTitle}</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">{t.signInBody}</p>
            {renderError(ROOT_TARGET)}
            <div className="pt-2">
              <Link
                href={signInHref}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium shadow-md shadow-brand-600/20 transition-colors ${FOCUS_RING}`}
              >
                <LogIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{t.signInCta}</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-center py-10 text-slate-500 text-xs font-mono">{t.empty}</p>
      ) : (
        <ul aria-label={t.listLabel} className="space-y-6">
          {comments.map((comment) => {
            const isFlagged = flaggedIds.includes(comment.id);
            const replyFieldId = `${formId}-reply-${comment.id}`;
            return (
              <li
                key={comment.id}
                className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 shrink-0 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-800 text-xs font-bold font-mono"
                      aria-hidden="true"
                    >
                      {comment.authorAvatar ? (
                        <img src={comment.authorAvatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        comment.authorName.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">{comment.authorName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-700 text-xs font-mono border border-brand-500/20">
                          {comment.authorRole}
                        </span>
                      </div>
                      <time dateTime={comment.createdAt} className="text-xs text-slate-500 font-mono">
                        {formatDate(comment.createdAt, locale)}
                      </time>
                    </div>
                  </div>

                  {canModerate && (
                    <button
                      type="button"
                      onClick={() => handleFlag(comment.id)}
                      disabled={isFlagged}
                      aria-label={isFlagged ? t.reported : t.report(comment.authorName)}
                      title={isFlagged ? t.reported : t.report(comment.authorName)}
                      className={`p-1.5 rounded-lg border transition-colors ${FOCUS_RING} ${
                        isFlagged
                          ? "bg-rose-500/10 border-rose-500/30 text-rose-600"
                          : "border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-500/30"
                      }`}
                    >
                      <Flag className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-11 whitespace-pre-line break-words">
                  {comment.content}
                </p>

                {canComment && (
                  <div className="pl-11 flex items-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                      }}
                      aria-expanded={replyingTo === comment.id}
                      aria-controls={replyingTo === comment.id ? replyFieldId : undefined}
                      className={`inline-flex items-center gap-1.5 rounded text-xs text-brand-700 hover:text-brand-800 transition-colors ${FOCUS_RING}`}
                    >
                      <Reply className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t.reply}</span>
                    </button>
                  </div>
                )}

                {canComment && replyingTo === comment.id && (
                  <form
                    id={replyFieldId}
                    className="ml-11 mt-3 p-3 rounded-xl bg-white border border-slate-200 space-y-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleAddComment(comment.id);
                    }}
                  >
                    <label htmlFor={`${replyFieldId}-input`} className="sr-only">
                      {t.replyLabel}
                    </label>
                    <textarea
                      id={`${replyFieldId}-input`}
                      name="reply"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={t.replyPlaceholder}
                      rows={2}
                      autoFocus
                      aria-invalid={formError?.target === comment.id || undefined}
                      className={`${TEXTAREA_CLASS} text-xs px-3 py-2`}
                    />
                    {renderError(comment.id)}
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent("");
                          setFormError(null);
                        }}
                        className={`px-2.5 py-1 rounded text-xs text-slate-500 hover:text-slate-900 ${FOCUS_RING}`}
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !replyContent.trim()}
                        className={`px-3 py-1 rounded bg-brand-600 hover:bg-brand-700 text-white text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${FOCUS_RING}`}
                      >
                        {loading ? t.submitting : t.sendReply}
                      </button>
                    </div>
                  </form>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <ul
                    aria-label={t.repliesLabel(comment.authorName)}
                    className="ml-8 sm:ml-11 mt-3 pl-4 border-l-2 border-brand-500/20 space-y-3"
                  >
                    {comment.replies.map((reply) => (
                      <li
                        key={reply.id}
                        className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-700">{reply.authorName}</span>
                            <span className="px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-700 text-xs font-mono border border-brand-500/20">
                              {reply.authorRole}
                            </span>
                          </div>
                          <time dateTime={reply.createdAt} className="text-xs text-slate-500 font-mono">
                            {formatDate(reply.createdAt, locale, { day: "numeric", month: "short", year: "numeric" })}
                          </time>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line break-words">
                          {reply.content}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Reply,
  Flag,
  Send,
  User,
  ShieldAlert,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import { BlogCommentItem } from "@/lib/blog/blog-data";
import {
  addBlogCommentAction,
  flagBlogCommentAction,
} from "@/lib/blog/blog-actions";

interface BlogCommentSectionProps {
  postSlug: string;
  initialComments: BlogCommentItem[];
  currentUser?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export default function BlogCommentSection({
  postSlug,
  initialComments,
  currentUser,
}: BlogCommentSectionProps) {
  const [comments, setComments] = useState<BlogCommentItem[]>(initialComments);
  const [newContent, setNewContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddComment = async (parentId?: string | null) => {
    const text = parentId ? replyContent : newContent;
    if (!text || text.trim().length < 3) {
      setErrorMsg("Yorum en az 3 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await addBlogCommentAction({
      postSlug,
      parentId,
      content: text,
    });

    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.error || "Yorum kaydedilemedi.");
      return;
    }

    if (res.comment) {
      if (parentId) {
        // Append reply to parent in comments state
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: [...(c.replies || []), res.comment!],
              };
            }
            return c;
          })
        );
        setReplyContent("");
        setReplyingTo(null);
      } else {
        setComments((prev) => [res.comment!, ...prev]);
        setNewContent("");
      }
      showToast("Yorumunuz başarıyla yayınlandı.");
    }
  };

  const handleFlag = async (commentId: string) => {
    if (flaggedIds.includes(commentId)) return;
    const res = await flagBlogCommentAction(commentId);
    if (res.success) {
      setFlaggedIds((prev) => [...prev, commentId]);
      showToast("Yorum moderasyon için bildirildi.");
    }
  };

  return (
    <section className="mt-16 pt-12 border-t border-slate-800/80">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-purple-900/90 border border-purple-500/50 text-purple-100 text-xs shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h3 className="text-xl font-bold text-white font-display">
            Yorumlar & Tartışma
          </h3>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 font-mono text-xs border border-slate-700">
            {comments.length}
          </span>
        </div>
      </div>

      {/* Main Comment Box */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 mb-10">
        {currentUser ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Oturum açık:</span>
              <strong className="text-white">{currentUser.fullName}</strong>
            </div>

            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Teknik soru, geri bildirim veya katkınızı buraya yazın..."
              rows={3}
              className="w-full bg-[#080d1a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/80 transition-colors resize-none"
            />

            {errorMsg && (
              <div className="flex items-center gap-1.5 text-xs text-rose-400">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-500 font-mono">
                Markdown formatı desteklenir
              </span>
              <button
                onClick={() => handleAddComment(null)}
                disabled={loading || !newContent.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{loading ? "Gönderiliyor..." : "Yorum Gönder"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 px-4 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mx-auto">
              <LogIn className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-white">
              Tartışmaya Katılın
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Teknik sorular sormak veya görüşlerinizi paylaşmak için öğrenci portalına giriş yapmanız gerekmektedir.
            </p>
            <div className="pt-2">
              <Link
                href={`/portal/giris?redirect=/blog/${postSlug}`}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium shadow-md shadow-purple-600/20 transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Giriş Yap veya Kaydol</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Comment List */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs font-mono">
            Henüz yorum yapılmamış. İlk yorumu sen yap!
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800/60 space-y-4"
            >
              {/* Comment Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 text-xs font-bold font-mono">
                    {comment.authorAvatar ? (
                      <img
                        src={comment.authorAvatar}
                        alt={comment.authorName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      comment.authorName.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">
                        {comment.authorName}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] font-mono border border-purple-500/20">
                        {comment.authorRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(comment.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleFlag(comment.id)}
                    title="Şikayet Et"
                    className={`p-1.5 rounded-lg border transition-colors ${
                      flaggedIds.includes(comment.id)
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : "border-slate-800 text-slate-500 hover:text-rose-400 hover:border-rose-500/30"
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-11">
                {comment.content}
              </p>

              {/* Action Buttons */}
              <div className="pl-11 flex items-center gap-4 pt-1">
                {currentUser && (
                  <button
                    onClick={() =>
                      setReplyingTo(replyingTo === comment.id ? null : comment.id)
                    }
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    <span>Yanıtla</span>
                  </button>
                )}
              </div>

              {/* Reply Input Box */}
              {replyingTo === comment.id && (
                <div className="ml-11 mt-3 p-3 rounded-xl bg-[#090d19] border border-slate-800 space-y-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`${comment.authorName} kullanıcısına yanıt yazın...`}
                    rows={2}
                    className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none resize-none"
                  />
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent("");
                      }}
                      className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
                    >
                      İptal
                    </button>
                    <button
                      onClick={() => handleAddComment(comment.id)}
                      disabled={loading || !replyContent.trim()}
                      className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all"
                    >
                      Yanıtla
                    </button>
                  </div>
                </div>
              )}

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-8 sm:ml-11 mt-3 pl-4 border-l-2 border-purple-500/20 space-y-3">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/60 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">
                            {reply.authorName}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[9px] font-mono border border-purple-500/20">
                            {reply.authorRole}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(reply.createdAt).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

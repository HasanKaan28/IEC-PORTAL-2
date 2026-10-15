"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Trash2,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  User,
  Filter,
} from "lucide-react";
import { BlogCommentItem } from "@/lib/blog/blog-data";
import { deleteBlogCommentAction } from "@/lib/blog/blog-actions";

interface AdminCommentModeratorProps {
  initialComments: BlogCommentItem[];
}

export default function AdminCommentModerator({
  initialComments,
}: AdminCommentModeratorProps) {
  const [comments, setComments] = useState<BlogCommentItem[]>(initialComments);
  const [filter, setFilter] = useState<"all" | "flagged">("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredComments =
    filter === "flagged"
      ? comments.filter((c) => c.isFlagged)
      : comments;

  const flaggedCount = comments.filter((c) => c.isFlagged).length;

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yorumu kalıcı olarak silmek istediğinize emin misiniz?")) {
      return;
    }
    setLoadingId(id);
    await deleteBlogCommentAction(id);
    setComments((prev) => prev.filter((c) => c.id !== id));
    setLoadingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Metrics & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Blog Yorum Moderasyonu
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Öğrenciler ve ziyaretçiler tarafından yapılan teknik yorumları denetleyin.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Tümü ({comments.length})
          </button>
          <button
            onClick={() => setFilter("flagged")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              filter === "flagged"
                ? "bg-rose-600 text-white shadow-xs font-semibold"
                : "text-rose-600 hover:bg-rose-50"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Şikayet Edilenler ({flaggedCount})</span>
          </button>
        </div>
      </div>

      {/* Comment List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {filteredComments.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs font-mono">
            {filter === "flagged"
              ? "Şikayet edilmiş herhangi bir yorum bulunmuyor. Her şey yolunda!"
              : "Henüz yorum kaydı bulunamadı."}
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`p-5 transition-colors ${
                comment.isFlagged ? "bg-rose-50/40" : "hover:bg-slate-50/60"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-xs">
                      {comment.authorName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                      {comment.authorRole}
                    </span>
                    {comment.isFlagged && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-mono font-semibold">
                        <ShieldAlert className="w-3 h-3" />
                        Şikayet Edildi
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(comment.createdAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {comment.postSlug && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-mono">
                      <span>İlgili Yazı:</span>
                      <Link
                        href={`/blog/${comment.postSlug}`}
                        target="_blank"
                        className="hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>/{comment.postSlug}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}

                  <p className="text-xs text-slate-700 leading-relaxed pt-1">
                    {comment.content}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-start">
                  <button
                    onClick={() => handleDelete(comment.id)}
                    disabled={loadingId === comment.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium border border-rose-200 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{loadingId === comment.id ? "Siliniyor..." : "Sil"}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

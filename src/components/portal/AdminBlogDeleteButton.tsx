"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteBlogPostAction } from "@/lib/blog/blog-actions";

export default function AdminBlogDeleteButton({ slug }: { slug: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteBlogPostAction(slug);
    setLoading(false);
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-1">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-semibold transition-colors"
        >
          {loading ? "..." : "Evet, Sil"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-1.5 py-1 text-slate-500 hover:text-slate-800 text-[10px]"
        >
          İptal
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      title="Yazıyı Sil"
      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Eye,
  ThumbsUp,
  Clock,
  Edit3,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { getBlogPosts } from "@/lib/blog/blog-queries";
import AdminBlogDeleteButton from "@/components/portal/AdminBlogDeleteButton";

export default async function AdminBlogListPage() {
  const posts = await getBlogPosts({ status: "all" });

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const totalLikes = posts.reduce((acc, p) => acc + p.likesCount, 0);

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Teknik Blog & Makale Yönetimi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            IEC blog yazılarını düzenleyin, yeni teknik içerik üretin veya taslakları yayınlayın.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/portal/admin/blog/yorumlar"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <span>Yorum Moderasyonu</span>
          </Link>

          <Link
            href="/portal/admin/blog/yeni"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Yazı Yaz</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-mono text-slate-500">Toplam Yazı</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {posts.length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-mono text-emerald-600">Yayında</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">
            {publishedCount}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-mono text-amber-600">Taslak</div>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">
            {draftCount}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="text-xs font-mono text-purple-600">Toplam Beğeni</div>
          <div className="text-2xl font-bold text-purple-600 mt-1 font-mono">
            {totalLikes}
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono text-[11px]">
              <tr>
                <th className="py-3 px-4">BAŞLIK & KATEGORİ</th>
                <th className="py-3 px-4">YAZAR</th>
                <th className="py-3 px-4">DURUM</th>
                <th className="py-3 px-4">SÜRE & TARİH</th>
                <th className="py-3 px-4">BEĞENİ</th>
                <th className="py-3 px-4 text-right">İŞLEMLER</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {posts.map((post) => (
                <tr key={post.slug} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-slate-900 line-clamp-1">
                      {post.title}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-medium">
                        {post.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        /{post.slug}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-slate-800">
                      {post.authorName}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {post.authorRole}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {post.status === "published" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Yayında
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Taslak
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{post.readingTimeMin} dk</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(post.publishedAt).toLocaleDateString("tr-TR")}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-slate-700">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3 text-purple-600" />
                      <span>{post.likesCount}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-2">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        title="Web'de Görüntüle"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/portal/admin/blog/duzenle/${post.slug}`}
                        title="Düzenle"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>

                      <AdminBlogDeleteButton slug={post.slug} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

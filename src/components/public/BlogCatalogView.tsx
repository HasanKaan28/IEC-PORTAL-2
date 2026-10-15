"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  BookOpen,
  Clock,
  Search,
  Tag,
  ThumbsUp,
  ArrowRight,
  Rss,
  PenSquare,
  Sparkles,
} from "lucide-react";
import { BlogPostItem } from "@/lib/blog/blog-data";
import { likeBlogPostAction } from "@/lib/blog/blog-actions";

interface BlogCatalogViewProps {
  initialPosts: BlogPostItem[];
}

export default function BlogCatalogView({
  initialPosts,
}: BlogCatalogViewProps) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialTag = searchParams.get("tag") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [likes, setLikes] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    initialPosts.forEach((p) => {
      map[p.slug] = p.likesCount;
    });
    return map;
  });

  const categories = [
    { id: "all", label: "Tüm Yazılar" },
    { id: "Gömülü Sistemler", label: "Gömülü Sistemler" },
    { id: "Mühendislik Kültürü", label: "Mühendislik Kültürü" },
    { id: "Yapay Zekâ", label: "Yapay Zekâ" },
    { id: "Etkinlikler", label: "Etkinlikler & Hackathon" },
  ];

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    initialPosts.forEach((p) => {
      p.tags.forEach((t) => set.add(t));
    });
    return Array.from(set);
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      // Category match
      if (
        selectedCategory !== "all" &&
        post.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Tag match
      if (
        selectedTag &&
        !post.tags.some(
          (t) => t.toLowerCase() === selectedTag.toLowerCase()
        )
      ) {
        return false;
      }

      // Query match
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesExcerpt = post.excerpt.toLowerCase().includes(q);
        const matchesTag = post.tags.some((t) => t.toLowerCase().includes(q));
        const matchesAuthor = post.authorName.toLowerCase().includes(q);
        return matchesTitle || matchesExcerpt || matchesTag || matchesAuthor;
      }

      return true;
    });
  }, [initialPosts, selectedCategory, selectedTag, searchQuery]);

  const handleLike = async (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    e.stopPropagation();
    setLikes((prev) => ({
      ...prev,
      [slug]: (prev[slug] || 0) + 1,
    }));
    await likeBlogPostAction(slug);
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-400">
          <BookOpen className="w-3.5 h-3.5" />
          <span>TEKNİK BÜLTEN & MÜHENDİSLİK BLOGU</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
          Mühendislik Yazıları
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
          FENS öğrencilerinin gerçek kampüs donanım projeleri, açık kaynak yazılımlar ve yapay zekâ deneyleri hakkındaki teknik dokümantasyonları.
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <a
            href="/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 text-xs font-mono transition-colors"
          >
            <Rss className="w-3.5 h-3.5" />
            <span>RSS Akışı</span>
          </a>

          <Link
            href="/portal/admin/blog/yeni"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 text-xs font-mono transition-colors"
          >
            <PenSquare className="w-3.5 h-3.5" />
            <span>Yazı Yaz (Yazar Paneli)</span>
          </Link>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Teknik makale, konu, yazar veya etiket ara (örn: ESP32, Linear, RAG)..."
            className="w-full bg-[#0a0f1d] border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/80 transition-colors shadow-xl"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400 hover:text-white"
            >
              Temizle
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Tag pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-mono text-slate-500 mr-1 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Etiketler:
            </span>
            {allTags.map((tag) => {
              const active = selectedTag.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(active ? "" : tag)}
                  className={`text-[11px] font-mono px-2 py-0.5 rounded-md transition-all ${
                    active
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                      : "bg-slate-900/60 text-slate-400 hover:text-slate-300 border border-slate-800/80"
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
            {selectedTag && (
              <button
                onClick={() => setSelectedTag("")}
                className="text-[10px] text-purple-400 hover:underline ml-2"
              >
                Etiketi kaldır
              </button>
            )}
          </div>
        )}
      </div>

      {/* Posts Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl max-w-xl mx-auto space-y-3">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">
            Aramanızla eşleşen yazı bulunamadı
          </h3>
          <p className="text-xs text-slate-500">
            Farklı bir arama terimi deneyin veya filtreleri temizleyin.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedTag("");
            }}
            className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-purple-300 hover:bg-slate-700"
          >
            Filtreleri Sıfırla
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="glass-panel rounded-2xl border border-slate-800/80 hover:border-purple-500/50 transition-all flex flex-col justify-between overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/20"
            >
              {/* Card Image */}
              {post.coverImage && (
                <div className="relative aspect-video overflow-hidden border-b border-slate-800/60">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-mono text-purple-300 bg-[#070a11]/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-purple-500/30">
                      {post.category}
                    </span>
                  </div>
                </div>
              )}

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                    <div className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-purple-400" />
                      <span>{post.readingTimeMin} dk okuma</span>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {new Date(post.publishedAt).toLocaleDateString("tr-TR", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">
                    {post.title}
                  </h2>

                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-[10px] font-bold text-purple-300">
                      {post.authorName.charAt(0)}
                    </div>
                    <div className="text-[11px] font-medium text-slate-300">
                      {post.authorName}
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleLike(e, post.slug)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-purple-300 hover:border-purple-500/40 text-xs transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span className="font-mono">{likes[post.slug] || 0}</span>
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

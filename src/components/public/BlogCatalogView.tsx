"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Clock, Search, Tag, ThumbsUp, Rss, PenSquare } from "lucide-react";
import { BlogPostItem } from "@/lib/blog/blog-data";
import { likeBlogPostAction } from "@/lib/blog/blog-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate } from "@/lib/i18n/format";
import {
  BLOG_CATEGORY_FILTERS,
  blogCategoryLabel,
  blogSignInHref,
  blogText,
} from "@/lib/i18n/public/blog";

interface BlogCatalogViewProps {
  initialPosts: BlogPostItem[];
  /** Liking needs a session; signed-out visitors get a sign-in prompt instead of a request. */
  isSignedIn: boolean;
}

type LikeResult = Awaited<ReturnType<typeof likeBlogPostAction>>;
type LikeNotice = { kind: "error"; text: string } | { kind: "signIn" };

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950";

export default function BlogCatalogView({ initialPosts, isSignedIn }: BlogCatalogViewProps) {
  const { locale } = useLocale();
  const t = blogText[locale];
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const initialTag = searchParams.get("tag") || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedTag, setSelectedTag] = useState(initialTag);
  const [likeNotice, setLikeNotice] = useState<LikeNotice | null>(null);
  const [likedSlugs, setLikedSlugs] = useState<string[]>([]);
  const [likes, setLikes] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    initialPosts.forEach((p) => {
      map[p.slug] = p.likesCount;
    });
    return map;
  });

  const allTags = useMemo(() => {
    const set = new Set<string>();
    initialPosts.forEach((p) => {
      p.tags.forEach((tag) => set.add(tag));
    });
    return Array.from(set);
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      if (
        selectedCategory !== "all" &&
        post.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      if (
        selectedTag &&
        !post.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
      ) {
        return false;
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesExcerpt = post.excerpt.toLowerCase().includes(q);
        const matchesTag = post.tags.some((tag) => tag.toLowerCase().includes(q));
        const matchesAuthor = post.authorName.toLowerCase().includes(q);
        return matchesTitle || matchesExcerpt || matchesTag || matchesAuthor;
      }

      return true;
    });
  }, [initialPosts, selectedCategory, selectedTag, searchQuery]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedTag("");
  };

  const handleLike = async (slug: string) => {
    if (!isSignedIn) {
      setLikeNotice({ kind: "signIn" });
      return;
    }
    if (likedSlugs.includes(slug)) return;

    setLikeNotice(null);
    setLikedSlugs((prev) => [...prev, slug]);
    setLikes((prev) => ({ ...prev, [slug]: (prev[slug] || 0) + 1 }));

    let res: LikeResult;
    try {
      res = await likeBlogPostAction(slug);
    } catch {
      res = { success: false, error: t.catalog.likeFailed };
    }

    if (res.success) {
      // A repeat like is ignored on the server, so trust its count over the optimistic one.
      const confirmed = res.likesCount;
      setLikes((prev) => ({ ...prev, [slug]: confirmed }));
    } else {
      setLikedSlugs((prev) => prev.filter((s) => s !== slug));
      setLikes((prev) => ({ ...prev, [slug]: Math.max(0, (prev[slug] || 1) - 1) }));
      setLikeNotice({ kind: "error", text: res.error || t.catalog.likeFailed });
    }
  };

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
          {t.catalog.title}
        </h1>
        <p className="text-slate-300 text-sm leading-relaxed">{t.catalog.intro}</p>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <a
            href="/feed.xml"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.catalog.rssLabel}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-500/10 border border-accent-500/20 text-accent-300 hover:bg-accent-500/20 text-xs font-mono transition-colors ${FOCUS_RING}`}
          >
            <Rss className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.catalog.rss}</span>
          </a>

          <Link
            href="/portal/admin/blog/yeni"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 hover:bg-brand-500/20 text-xs font-mono transition-colors ${FOCUS_RING}`}
          >
            <PenSquare className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{t.catalog.write}</span>
          </Link>
        </div>
      </div>

      {initialPosts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl max-w-xl mx-auto space-y-2">
          <BookOpen className="w-8 h-8 text-slate-500 mx-auto" aria-hidden="true" />
          <h2 className="text-base font-semibold text-slate-200">{t.catalog.emptyTitle}</h2>
          <p className="text-sm text-slate-400">{t.catalog.emptyHint}</p>
        </div>
      ) : (
        <>
          {/* Search & filters */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="relative">
              <label htmlFor="blog-search" className="sr-only">
                {t.catalog.searchLabel}
              </label>
              <Search
                className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="blog-search"
                type="search"
                name="q"
                autoComplete="off"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.catalog.searchPlaceholder}
                className="w-full bg-ink-900 border border-slate-800 rounded-2xl pl-11 pr-24 py-3.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/80 focus:ring-2 focus:ring-brand-500/30 transition-colors shadow-xl"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label={t.catalog.clearSearchLabel}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-mono text-slate-400 hover:text-white ${FOCUS_RING}`}
                >
                  {t.catalog.clearSearch}
                </button>
              )}
            </div>

            {/* Categories */}
            <div
              role="group"
              aria-label={t.catalog.categoriesLabel}
              className="flex items-center gap-2 overflow-x-auto p-1 pb-2 scrollbar-none"
            >
              {BLOG_CATEGORY_FILTERS.map((cat) => {
                const active = selectedCategory.toLowerCase() === cat.value.toLowerCase();
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setSelectedCategory(cat.value)}
                    aria-pressed={active}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${FOCUS_RING} ${
                      active
                        ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                        : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                    }`}
                  >
                    {t.categories[cat.key]}
                  </button>
                );
              })}
            </div>

            {/* Tags */}
            {allTags.length > 0 && (
              <div
                role="group"
                aria-labelledby="blog-tags-label"
                className="flex flex-wrap items-center gap-1.5 pt-1"
              >
                <span
                  id="blog-tags-label"
                  className="text-xs font-mono text-slate-500 mr-1 flex items-center gap-1"
                >
                  <Tag className="w-3 h-3" aria-hidden="true" /> {t.catalog.tagsLabel}:
                </span>
                {allTags.map((tag) => {
                  const active = selectedTag.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedTag(active ? "" : tag)}
                      aria-pressed={active}
                      className={`text-xs font-mono px-2 py-0.5 rounded-md transition-colors ${FOCUS_RING} ${
                        active
                          ? "bg-brand-500/20 text-brand-200 border border-brand-500/50"
                          : "bg-slate-900/60 text-slate-400 hover:text-slate-300 border border-slate-800/80"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
                {selectedTag && (
                  <button
                    type="button"
                    onClick={() => setSelectedTag("")}
                    className={`text-xs text-brand-300 hover:underline ml-2 rounded ${FOCUS_RING}`}
                  >
                    {t.catalog.removeTag}
                  </button>
                )}
              </div>
            )}
          </div>

          <p className="sr-only" role="status" aria-live="polite">
            {t.catalog.resultCount(filteredPosts.length)}
          </p>

          {likeNotice?.kind === "error" && (
            <p role="alert" className="text-center text-xs text-rose-400">
              {likeNotice.text}
            </p>
          )}
          {likeNotice?.kind === "signIn" && (
            <p role="alert" className="text-center text-xs text-slate-300">
              {t.auth.signInToLike}{" "}
              <Link
                href={blogSignInHref("/blog")}
                className={`font-semibold text-brand-300 underline underline-offset-4 hover:text-brand-200 rounded ${FOCUS_RING}`}
              >
                {t.auth.signIn}
              </Link>
            </p>
          )}

          {/* Posts grid */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-slate-800 rounded-2xl max-w-xl mx-auto space-y-3">
              <BookOpen className="w-8 h-8 text-slate-600 mx-auto" aria-hidden="true" />
              <h2 className="text-sm font-semibold text-slate-300">{t.catalog.noResultsTitle}</h2>
              <p className="text-xs text-slate-500">{t.catalog.noResultsHint}</p>
              <button
                type="button"
                onClick={resetFilters}
                className={`px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-brand-200 hover:bg-slate-700 ${FOCUS_RING}`}
              >
                {t.catalog.resetFilters}
              </button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post) => {
                const likeCount = likes[post.slug] || 0;
                const hasLiked = likedSlugs.includes(post.slug);
                return (
                  <li
                    key={post.slug}
                    className="relative glass-panel rounded-2xl border border-slate-800/80 hover:border-brand-500/50 transition-[border-color,transform,box-shadow] flex flex-col justify-between overflow-hidden group hover:-translate-y-1 hover:shadow-2xl hover:shadow-brand-950/20 motion-reduce:hover:translate-y-0 focus-within:border-brand-500/50"
                  >
                    {post.coverImage && (
                      <div className="relative aspect-video overflow-hidden border-b border-slate-800/60">
                        <img
                          src={post.coverImage}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:group-hover:scale-100"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="text-xs font-mono text-brand-200 bg-ink-950/80 backdrop-blur-md px-2.5 py-1 rounded-md border border-brand-500/30">
                            {blogCategoryLabel(post.category, locale)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-brand-400" aria-hidden="true" />
                            <span>{t.post.readingTime(post.readingTimeMin)}</span>
                          </div>
                          <time dateTime={post.publishedAt} className="text-slate-500">
                            {formatDate(post.publishedAt, locale, { day: "numeric", month: "short", year: "numeric" })}
                          </time>
                        </div>

                        <h2 className="text-base font-bold text-white group-hover:text-brand-200 transition-colors line-clamp-2 leading-snug">
                          {/* The stretched link makes the whole card clickable without nesting the like button inside it. */}
                          <Link
                            href={`/blog/${post.slug}`}
                            className="rounded focus-visible:outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:after:ring-2 focus-visible:after:ring-brand-400/70"
                          >
                            {post.title}
                          </Link>
                        </h2>

                        <p className="text-xs text-slate-400 mt-2.5 leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-6 h-6 shrink-0 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-200"
                            aria-hidden="true"
                          >
                            {post.authorName.charAt(0)}
                          </div>
                          <div className="text-xs font-medium text-slate-300 truncate">
                            {post.authorName}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleLike(post.slug)}
                          disabled={hasLiked}
                          aria-pressed={hasLiked}
                          aria-label={t.catalog.likePost(post.title, likeCount)}
                          className={`relative z-10 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors ${FOCUS_RING} ${
                            hasLiked
                              ? "bg-brand-500/15 border-brand-500/40 text-brand-200"
                              : "bg-slate-900 border-slate-800 text-slate-400 hover:text-brand-200 hover:border-brand-500/40"
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" aria-hidden="true" />
                          <span className="font-mono tabular-nums">{likeCount}</span>
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import MarkdownRenderer from "@/components/public/MarkdownRenderer";
import BlogCommentSection from "@/components/public/BlogCommentSection";
import BlogDetailClientBar from "@/components/public/BlogDetailClientBar";
import {
  getBlogPostBySlug,
  getBlogComments,
  getBlogPosts,
} from "@/lib/blog/blog-queries";
import { getSessionUser, userCan } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/format";
import { blogCategoryLabel, blogText } from "@/lib/i18n/public/blog";
import { SITE_URL } from "@/lib/site-url";
import { Clock, Calendar, ArrowLeft, Tag, BookOpen } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const FOCUS_RING =
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getServerLocale()]);
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: blogText[locale].meta.notFoundTitle };
  }

  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const ogImage = post.coverImage || "/brand/og-card.jpg";

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.authorName }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: "IUS Engineering Club",
      type: "article",
      locale: locale === "en" ? "en_US" : "tr_TR",
      publishedTime: post.publishedAt,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const [{ slug }, locale] = await Promise.all([params, getServerLocale()]);
  const t = blogText[locale];
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const [comments, sameCategoryPosts, user] = await Promise.all([
    getBlogComments(slug),
    getBlogPosts({ category: post.category }),
    getSessionUser(),
  ]);
  const relatedPosts = sameCategoryPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  // Only what the comment UI needs goes to the client.
  const commentUser = user ? { id: user.id, fullName: user.fullName } : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main id="main-content" className="flex-1 py-12 px-4 sm:px-6">
        <article className="max-w-4xl mx-auto space-y-8">
          <div>
            <Link
              href="/blog"
              className={`inline-flex items-center gap-2 rounded text-xs font-mono text-brand-700 hover:text-brand-800 transition-colors ${FOCUS_RING}`}
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{t.post.backToAll}</span>
            </Link>
          </div>

          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-md bg-brand-500/10 border border-brand-500/20 text-xs font-mono text-brand-700 font-semibold">
                {blogCategoryLabel(post.category, locale)}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                <Clock className="w-3.5 h-3.5 text-brand-600" aria-hidden="true" />
                <span>{t.post.readingTime(post.readingTimeMin)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span className="sr-only">{t.post.publishedOn}</span>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale)}</time>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl/none font-extrabold text-slate-900 font-display tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg/7 text-slate-600 leading-relaxed font-light">
              {post.excerpt}
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
              <div
                className="w-11 h-11 rounded-full bg-brand-500/20 border border-brand-500/40 overflow-hidden flex items-center justify-center font-bold text-slate-900 text-sm"
                aria-hidden="true"
              >
                {post.authorAvatar ? (
                  <img src={post.authorAvatar} alt="" className="w-full h-full object-cover" />
                ) : (
                  post.authorName.charAt(0)
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">{post.authorName}</div>
                <div className="text-xs text-brand-700 font-mono">{post.authorRole}</div>
              </div>
            </div>
          </header>

          {post.coverImage && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video shadow-2xl">
              <img src={post.coverImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-linear-to-t/srgb from-brand-950/15 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          <BlogDetailClientBar
            slug={post.slug}
            title={post.title}
            initialLikes={post.likesCount}
            isSignedIn={user !== null}
          />

          <div className="pt-4">
            <MarkdownRenderer content={post.content} />
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="pt-8 border-t border-slate-200 flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-brand-600 mr-1" aria-hidden="true" />
              <span className="sr-only">{t.post.tags}</span>
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className={`px-3 py-1 rounded-lg bg-slate-50 border border-slate-200 hover:border-brand-500/40 text-xs font-mono text-slate-600 hover:text-brand-800 transition-colors ${FOCUS_RING}`}
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <BlogCommentSection
            postSlug={post.slug}
            initialComments={comments}
            currentUser={commentUser}
            canModerate={userCan(user, "blog.moderate")}
          />

          {relatedPosts.length > 0 && (
            <section
              aria-labelledby="related-posts-heading"
              className="mt-16 pt-12 border-t border-slate-200 space-y-6"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-brand-600" aria-hidden="true" />
                <h2 id="related-posts-heading" className="text-lg font-bold text-slate-900 font-display">
                  {t.post.related}
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className={`glass-panel p-5 rounded-xl border border-slate-200 hover:border-brand-500/40 transition-colors flex flex-col justify-between group ${FOCUS_RING}`}
                  >
                    <div>
                      <span className="text-xs font-mono text-brand-700 bg-brand-500/10 px-2 py-0.5 rounded border border-brand-500/20">
                        {blogCategoryLabel(rel.category, locale)}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-800 transition-colors mt-2">
                        {rel.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{rel.excerpt}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 font-mono">
                      <span>{rel.authorName}</span>
                      <span>{t.post.readingTimeShort(rel.readingTimeMin)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}

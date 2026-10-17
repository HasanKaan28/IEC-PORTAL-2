import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, FileText, PenLine, Plus, Shield } from "lucide-react";
import AdminBlogDeleteButton from "@/components/portal/AdminBlogDeleteButton";
import { canAccessAdminSection } from "@/lib/admin/admin-access";
import { userCan } from "@/lib/auth/session";
import { getMyBlogPosts } from "@/lib/blog/blog-queries";
import type { BlogPostItem } from "@/lib/blog/blog-data";
import { formatDate } from "@/lib/i18n/format";
import { blogWriterText } from "@/lib/i18n/portal/blog-writer";
import { getServerLocale } from "@/lib/i18n/server";
import { guardPortalPage } from "@/lib/rbac/page-guard";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { SupportedLocale } from "@/lib/i18n/translations";

export async function generateMetadata(): Promise<Metadata> {
  return { title: blogWriterText[await getServerLocale()].list.title };
}

const focusRing = "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

function PostRow({ post, locale }: { post: BlogPostItem; locale: SupportedLocale }) {
  const t = blogWriterText[locale].list;
  const title = post.title.trim() || t.untitled;
  const published = post.status === "published";
  return (
    <li className="group relative flex gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 transition-colors hover:border-brand-200 sm:p-5">
      <div className="hidden h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-linear-to-br/srgb from-brand-100 via-accent-50 to-emerald-50 sm:block">
        {post.coverImage && <img src={post.coverImage} alt="" loading="lazy" className="h-full w-full object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-base font-bold text-slate-900">
          <Link
            href={`/portal/blog/yaz?id=${post.id}`}
            aria-label={t.edit(title)}
            className={`rounded-sm after:absolute after:inset-0 after:rounded-2xl hover:text-brand-800 ${focusRing}`}
          >
            <span className="line-clamp-2">{title}</span>
          </Link>
        </h3>
        {post.excerpt && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>}
        <p className="mt-2 text-xs text-slate-500">
          {published ? t.publishedOn(formatDate(post.publishedAt, locale)) : t.edited(formatDate(post.updatedAt, locale))}
          {" · "}
          {t.readingTime(post.readingTimeMin)}
        </p>
      </div>
      <div className="relative z-10 flex shrink-0 items-start gap-1">
        {published && (
          <Link
            href={`/blog/${post.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t.view(title)}
            title={t.view(title)}
            className={`rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600 ${focusRing}`}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
        {!published && <AdminBlogDeleteButton slug={post.slug} title={title} />}
      </div>
    </li>
  );
}

function PostSection({
  heading,
  empty,
  posts,
  locale,
}: {
  heading: string;
  empty: string;
  posts: BlogPostItem[];
  locale: SupportedLocale;
}) {
  const id = heading.replace(/\W+/g, "-").toLowerCase();
  return (
    <section aria-labelledby={id} className="space-y-3">
      <h2 id={id} className="text-sm font-semibold text-slate-700">
        {heading}
      </h2>
      {posts.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white/50 px-5 py-6 text-sm text-slate-500">{empty}</p>
      ) : (
        <ul className="space-y-3">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} locale={locale} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function PortalBlogPage() {
  const user = await guardPortalPage("blog");
  const locale = await getServerLocale();
  const t = blogWriterText[locale].list;
  const posts = await getMyBlogPosts();
  const drafts = posts.filter((post) => post.status !== "published");
  const published = posts.filter((post) => post.status === "published");
  const canPublish = userCan(user, "blog.publish");

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">{t.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{t.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canAccessAdminSection(user, "blog") && (
            <Link
              href="/portal/admin/blog"
              className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${focusRing}`}
            >
              <Shield className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span>{t.adminLink}</span>
            </Link>
          )}
          <Link
            href="/portal/blog/yaz"
            className={`inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 ${focusRing}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{t.newPost}</span>
          </Link>
        </div>
      </header>

      {!isSupabaseConfigured() && (
        <p className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-800">{t.notConfigured}</p>
      )}

      {!canPublish && (
        <p className="flex items-start gap-2 rounded-xl border border-brand-100 bg-white/70 px-4 py-3 text-sm text-slate-700">
          <PenLine className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
          <span>{t.reviewNote}</span>
        </p>
      )}

      {posts.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
          <FileText className="h-8 w-8 text-brand-500" aria-hidden="true" />
          <p className="mt-3 font-display text-lg font-semibold text-slate-900">{t.emptyDrafts}</p>
          <p className="mt-1 text-sm text-slate-600">{t.emptyHint}</p>
          <Link
            href="/portal/blog/yaz"
            className={`mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 ${focusRing}`}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>{t.newPost}</span>
          </Link>
        </div>
      ) : (
        <>
          <PostSection heading={t.drafts(drafts.length)} empty={t.emptyDrafts} posts={drafts} locale={locale} />
          <PostSection heading={t.published(published.length)} empty={t.emptyPublished} posts={published} locale={locale} />
        </>
      )}
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpen, Clock, Edit3, ExternalLink, MessageSquare, Plus, ThumbsUp } from "lucide-react";
import { getSessionUser, userCan } from "@/lib/auth/session";
import { canAccessAdminSection } from "@/lib/admin/admin-access";
import { getBlogPosts } from "@/lib/blog/blog-queries";
import { getServerLocale } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/format";
import { adminText } from "@/lib/i18n/portal/admin";
import { blogWriterText } from "@/lib/i18n/portal/blog-writer";
import AdminBlogDeleteButton from "@/components/portal/AdminBlogDeleteButton";
import { EmptyState, PageHeader, focusRing } from "../_components/AdminUi";
import { MemberName } from "@/components/portal/MemberCard";

export default async function AdminBlogListPage() {
  const user = await getSessionUser();
  if (!user || !canAccessAdminSection(user, "blog")) redirect("/portal/admin");

  const locale = await getServerLocale();
  const text = adminText[locale];
  const t = text.blogList;

  const posts = await getBlogPosts({ status: "all" });
  const canWrite = userCan(user, "blog.write");
  const canPublish = userCan(user, "blog.publish");
  const canModerate = userCan(user, "blog.moderate");

  const publishedCount = posts.filter((p) => p.status === "published").length;
  const draftCount = posts.filter((p) => p.status === "draft").length;
  const totalLikes = posts.reduce((acc, p) => acc + p.likesCount, 0);

  const stats = [
    { label: t.statTotal, value: posts.length, className: "text-slate-900" },
    { label: t.statPublished, value: publishedCount, className: "text-emerald-700" },
    { label: t.statDrafts, value: draftCount, className: "text-accent-700" },
    { label: t.statLikes, value: totalLikes, className: "text-brand-700" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <>
            {canModerate && (
              <Link
                href="/portal/admin/blog/yorumlar"
                className={`inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 ${focusRing}`}
              >
                <MessageSquare className="h-4 w-4 text-slate-500" aria-hidden="true" />
                <span>{t.moderation}</span>
              </Link>
            )}
            {canWrite && (
              <Link
                href="/portal/blog/yaz"
                className={`inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 ${focusRing}`}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                <span>{t.newPost}</span>
              </Link>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-medium text-slate-500">{stat.label}</div>
            <div className={`mt-1 text-2xl font-bold ${stat.className}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {posts.length === 0 ? (
          <EmptyState icon={BookOpen} message={t.empty} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3">{t.colTitle}</th>
                  <th scope="col" className="px-4 py-3">{t.colAuthor}</th>
                  <th scope="col" className="px-4 py-3">{t.colStatus}</th>
                  <th scope="col" className="px-4 py-3">{t.colDate}</th>
                  <th scope="col" className="px-4 py-3">{t.colLikes}</th>
                  <th scope="col" className="px-4 py-3 text-right">{t.colActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {posts.map((post) => {
                  const isAuthor = post.authorId === user.id;
                  const canEdit = isAuthor || canPublish;
                  const canDelete = canModerate || (isAuthor && post.status === "draft");
                  const shownDate = post.status === "published" ? post.publishedAt : post.updatedAt;
                  return (
                    <tr key={post.id} className="align-top">
                      <td className="max-w-xs px-4 py-3.5">
                        <div className="line-clamp-2 font-semibold text-slate-900">
                          {post.title || blogWriterText[locale].list.untitled}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                            {text.categories[post.category] ?? post.category}
                          </span>
                          <span className="font-mono text-xs text-slate-500">/{post.slug}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-medium text-slate-800">
                        <MemberName userId={post.authorId} name={post.authorName} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        {post.status === "published" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
                            {t.statusPublished}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-0.5 text-xs font-medium text-accent-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-accent-500" aria-hidden="true" />
                            {post.status === "draft" ? t.statusDraft : t.statusArchived}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                          <span>{t.readingTime(post.readingTimeMin)}</span>
                        </div>
                        <time dateTime={shownDate} className="mt-0.5 block text-slate-500">
                          {formatDate(shownDate, locale)}
                        </time>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-700">
                        <span className="inline-flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                          <span>{post.likesCount}</span>
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          {post.status === "published" && (
                            <Link
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`${t.view(post.title)} ${text.common.newTab}`}
                              title={t.view(post.title)}
                              className={`rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600 ${focusRing}`}
                            >
                              <ExternalLink className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          )}
                          {canEdit && (
                            <Link
                              href={`/portal/blog/yaz?id=${post.id}`}
                              aria-label={t.edit(post.title)}
                              title={t.edit(post.title)}
                              className={`rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-brand-600 ${focusRing}`}
                            >
                              <Edit3 className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          )}
                          {canDelete && <AdminBlogDeleteButton slug={post.slug} title={post.title} />}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

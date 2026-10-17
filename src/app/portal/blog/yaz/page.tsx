import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BlogWriter from "@/components/portal/blog/BlogWriter";
import { isBlogCategory } from "@/lib/admin/blog-meta";
import { userCan } from "@/lib/auth/session";
import { blogContentToDoc } from "@/lib/blog/blog-doc";
import { getBlogPostById } from "@/lib/blog/blog-queries";
import { blogWriterText } from "@/lib/i18n/portal/blog-writer";
import { getServerLocale } from "@/lib/i18n/server";
import { guardPortalPage } from "@/lib/rbac/page-guard";

export async function generateMetadata(): Promise<Metadata> {
  return { title: blogWriterText[await getServerLocale()].list.newPost };
}

/** The editor: /portal/blog/yaz starts a new post, /portal/blog/yaz?id=<post id> edits one. */
export default async function BlogWritePage({ searchParams }: { searchParams: Promise<{ id?: string | string[] }> }) {
  const user = await guardPortalPage("blog");
  const canPublish = userCan(user, "blog.publish");
  const { id } = await searchParams;
  if (!id) return <BlogWriter post={null} canPublish={canPublish} />;

  const post = typeof id === "string" ? await getBlogPostById(id) : null;
  // Authors edit their own posts; editors who can publish may edit anyone's.
  if (!post || (post.authorId !== user.id && !canPublish)) redirect("/portal/blog");

  return (
    <BlogWriter
      canPublish={canPublish}
      post={{
        id: post.id,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        doc: blogContentToDoc(post.content),
        category: isBlogCategory(post.category) ? post.category : "Genel",
        tags: post.tags,
        coverImage: post.coverImage ?? "",
        status: post.status === "published" ? "published" : "draft",
        authorName: post.authorName,
        isOwn: post.authorId === user.id,
        updatedAt: post.updatedAt,
      }}
    />
  );
}

import React from "react";
import { notFound, redirect } from "next/navigation";
import BlogEditorStudio from "@/components/portal/BlogEditorStudio";
import { getSessionUser, userCan } from "@/lib/auth/session";
import { getBlogPostBySlug } from "@/lib/blog/blog-queries";

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminBlogEditPage({ params }: EditPageProps) {
  const user = await getSessionUser();
  if (!user || !userCan(user, "blog.write")) redirect("/portal/admin/blog");

  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const canPublish = userCan(user, "blog.publish");
  // Same rule as saveBlogPostAction: the author, or anyone who can publish.
  if (post.authorId !== user.id && !canPublish) redirect("/portal/admin/blog");

  return <BlogEditorStudio initialPost={post} canPublish={canPublish} />;
}

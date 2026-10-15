import React from "react";
import { notFound } from "next/navigation";
import BlogEditorStudio from "@/components/portal/BlogEditorStudio";
import { getBlogPostBySlug } from "@/lib/blog/blog-queries";

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AdminBlogEditPage({ params }: EditPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogEditorStudio initialPost={post} />;
}

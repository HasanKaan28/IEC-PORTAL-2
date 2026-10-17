import { notFound, redirect } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/blog/blog-queries";

interface EditPageProps {
  params: Promise<{ slug: string }>;
}

/** Old address of the editor. Posts are now edited in the workspace editor, which checks access. */
export default async function AdminBlogEditPage({ params }: EditPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();
  redirect(`/portal/blog/yaz?id=${post.id}`);
}

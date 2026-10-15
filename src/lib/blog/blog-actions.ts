"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { BlogPostItem, BlogCommentItem } from "./blog-data";
import {
  memoryPosts,
  memoryComments,
  setMemoryComments,
  getBlogPosts,
  getBlogPostBySlug,
  getBlogComments,
  getAllBlogCommentsForAdmin,
} from "./blog-queries";

export {
  getBlogPosts as getBlogPostsAction,
  getBlogPostBySlug as getBlogPostBySlugAction,
  getBlogComments as getBlogCommentsAction,
  getAllBlogCommentsForAdmin as getAllBlogCommentsForAdminAction,
};

export async function likeBlogPostAction(slug: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: post } = (await supabase
        .from("blog_posts")
        .select("id")
        .eq("slug", slug)
        .single()) as any;
      if (post) {
        await (supabase.from("blog_likes") as any).insert({
          post_id: (post as any).id,
          user_id: user.id,
        });
      }
    }
  } catch {
    // Fallback in-memory
  }

  const p = memoryPosts.find((x) => x.slug === slug);
  if (p) {
    p.likesCount += 1;
  }

  revalidatePath(`/blog/${slug}`);
  revalidatePath("/blog");
  return { success: true, likesCount: p ? p.likesCount : 0 };
}

export async function addBlogCommentAction(data: {
  postSlug: string;
  parentId?: string | null;
  content: string;
}) {
  if (!data.content || data.content.trim().length < 3) {
    return { success: false, error: "Yorum en az 3 karakter olmalıdır." };
  }

  let currentUserId = "usr-demo";
  let currentUserName = "Kaan Mete Şenyıldız";
  let currentUserRole = "Öğrenci & Üye";
  let isAuthenticated = false;

  const cookieStore = await cookies();
  const hasDemo = cookieStore.get("iec_demo_session")?.value === "true";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      currentUserId = user.id;
      const { data: prof } = (await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()) as any;
      if (prof?.full_name) currentUserName = prof.full_name;
      isAuthenticated = true;
    } else if (hasDemo) {
      isAuthenticated = true;
    }
  } catch {
    if (hasDemo) isAuthenticated = true;
  }

  if (!isAuthenticated) {
    return {
      success: false,
      error: "Yorum yapabilmek için lütfen giriş yapınız.",
      requireAuth: true,
    };
  }

  const newComment: BlogCommentItem = {
    id: `c-${Date.now()}`,
    postId: "post-custom",
    postSlug: data.postSlug,
    parentId: data.parentId || null,
    userId: currentUserId,
    authorName: currentUserName,
    authorRole: currentUserRole,
    content: data.content.trim(),
    isFlagged: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const supabase = await createClient();
    const { data: post } = (await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", data.postSlug)
      .single()) as any;

    if (post) {
      await (supabase.from("blog_comments") as any).insert({
        post_id: (post as any).id,
        parent_id: data.parentId || null,
        user_id: currentUserId,
        content: data.content.trim(),
      });
    }
  } catch {
    // Fallback
  }

  memoryComments.push(newComment);

  revalidatePath(`/blog/${data.postSlug}`);
  return { success: true, comment: newComment };
}

export async function flagBlogCommentAction(commentId: string) {
  try {
    const admin = createAdminClient();
    await (admin.from("blog_comments") as any)
      .update({ is_flagged: true })
      .eq("id", commentId);
  } catch {
    // Fallback
  }

  const c = memoryComments.find((x) => x.id === commentId);
  if (c) c.isFlagged = true;

  return {
    success: true,
    message: "Yorum moderatör incelemesi için raporlandı.",
  };
}

export async function deleteBlogCommentAction(commentId: string) {
  try {
    const admin = createAdminClient();
    await (admin.from("blog_comments") as any).delete().eq("id", commentId);
  } catch {
    // Fallback
  }

  setMemoryComments(
    memoryComments.filter((c) => c.id !== commentId && c.parentId !== commentId)
  );

  revalidatePath("/portal/admin/blog/yorumlar");
  return { success: true };
}

export async function saveBlogPostAction(data: {
  id?: string;
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  category: "Gömülü Sistemler" | "Mühendislik Kültürü" | "Yapay Zekâ" | "Etkinlikler" | "Genel";
  tags: string[];
  coverImage?: string;
  status: "published" | "draft";
}) {
  if (!data.title || data.title.trim().length < 5) {
    return { success: false, error: "Başlık en az 5 karakter olmalıdır." };
  }
  if (!data.content || data.content.trim().length < 20) {
    return { success: false, error: "İçerik en az 20 karakter olmalıdır." };
  }

  const wordCount = data.content.trim().split(/\s+/).length;
  const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

  const slug =
    data.slug && data.slug.trim() !== ""
      ? slugify(data.slug)
      : slugify(data.title);

  const existingIndex = memoryPosts.findIndex(
    (p) => (data.id && p.id === data.id) || p.slug === slug
  );

  const postRecord: BlogPostItem = {
    id: data.id || `post-${Date.now()}`,
    slug,
    title: data.title.trim(),
    excerpt:
      data.excerpt?.trim() || data.content.slice(0, 160).replace(/[#*`]/g, "") + "...",
    content: data.content,
    coverImage:
      data.coverImage ||
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80",
    authorId: "usr-admin",
    authorName: "Kaan Mete Şenyıldız",
    authorRole: "Başkan & Sistem Yöneticisi",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    category: data.category,
    tags: data.tags && data.tags.length > 0 ? data.tags : ["Mühendislik", "IEC"],
    readingTimeMin,
    status: data.status,
    likesCount: existingIndex >= 0 ? memoryPosts[existingIndex].likesCount : 0,
    viewsCount: existingIndex >= 0 ? memoryPosts[existingIndex].viewsCount : 0,
    publishedAt:
      data.status === "published"
        ? new Date().toISOString()
        : existingIndex >= 0
        ? memoryPosts[existingIndex].publishedAt
        : new Date().toISOString(),
    createdAt:
      existingIndex >= 0
        ? memoryPosts[existingIndex].createdAt
        : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    const admin = createAdminClient();
    await (admin.from("blog_posts") as any).upsert({
      id: postRecord.id.startsWith("post-") ? undefined : postRecord.id,
      slug: postRecord.slug,
      title: postRecord.title,
      excerpt: postRecord.excerpt,
      content: postRecord.content,
      cover_image: postRecord.coverImage,
      author_id: "a0000000-0000-0000-0000-000000000001",
      status: postRecord.status,
      reading_time_min: postRecord.readingTimeMin,
      tags: postRecord.tags,
      published_at: postRecord.status === "published" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    });
  } catch {
    // Fallback
  }

  if (existingIndex >= 0) {
    memoryPosts[existingIndex] = postRecord;
  } else {
    memoryPosts.unshift(postRecord);
  }

  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/portal/admin/blog");
  return { success: true, post: postRecord };
}

export async function deleteBlogPostAction(slug: string) {
  try {
    const admin = createAdminClient();
    await (admin.from("blog_posts") as any).delete().eq("slug", slug);
  } catch {
    // Fallback
  }

  const idx = memoryPosts.findIndex((p) => p.slug === slug);
  if (idx >= 0) {
    memoryPosts.splice(idx, 1);
  }

  revalidatePath("/blog");
  revalidatePath("/portal/admin/blog");
  return { success: true };
}

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };
  return text
    .split("")
    .map((char) => trMap[char] || char)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

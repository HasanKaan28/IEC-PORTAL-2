import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  BlogPostItem,
  BlogCommentItem,
  initialBlogPosts,
  initialBlogComments,
} from "./blog-data";

// Shared runtime store
export const memoryPosts: BlogPostItem[] = [...initialBlogPosts];
export let memoryComments: BlogCommentItem[] = [...initialBlogComments];

export function setMemoryComments(newComments: BlogCommentItem[]) {
  memoryComments = newComments;
}

export async function getBlogPosts(options?: {
  query?: string;
  category?: string;
  tag?: string;
  status?: "published" | "draft" | "all";
}): Promise<BlogPostItem[]> {
  try {
    const supabase = await createClient();
    let q = supabase
      .from("blog_posts")
      .select("*, profiles:author_id(full_name, avatar_url)")
      .order("created_at", { ascending: false });

    if (options?.status && options.status !== "all") {
      q = q.eq("status", options.status);
    } else if (!options?.status) {
      q = q.eq("status", "published");
    }

    const { data } = await q;

    if (data && (data as any[]).length > 0) {
      const posts: BlogPostItem[] = (data as any[]).map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt || "",
        content: p.content,
        coverImage: p.cover_image,
        authorId: p.author_id,
        authorName: p.profiles?.full_name || "IEC Yazar",
        authorRole: "Mühendislik Kulübü",
        authorAvatar: p.profiles?.avatar_url,
        category: (p.tags && p.tags[0]) || "Genel",
        tags: p.tags || [],
        readingTimeMin: p.reading_time_min || 3,
        status: p.status,
        likesCount: 0,
        viewsCount: 1,
        publishedAt: p.published_at || p.created_at,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));

      return filterPosts(posts, options);
    }
  } catch {
    // Fallback to memory
  }

  return filterPosts(memoryPosts, options);
}

function filterPosts(
  posts: BlogPostItem[],
  options?: {
    query?: string;
    category?: string;
    tag?: string;
    status?: "published" | "draft" | "all";
  }
): BlogPostItem[] {
  let result = [...posts];

  if (options?.status && options.status !== "all") {
    result = result.filter((p) => p.status === options.status);
  } else if (!options?.status) {
    result = result.filter((p) => p.status === "published");
  }

  if (options?.category && options.category !== "all") {
    result = result.filter(
      (p) => p.category.toLowerCase() === options.category?.toLowerCase()
    );
  }

  if (options?.tag) {
    result = result.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === options.tag?.toLowerCase())
    );
  }

  if (options?.query && options.query.trim() !== "") {
    const q = options.query.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  return result;
}

export async function getBlogPostBySlug(
  slug: string
): Promise<BlogPostItem | null> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("blog_posts")
      .select("*, profiles:author_id(full_name, avatar_url)")
      .eq("slug", slug)
      .maybeSingle();

    if (data) {
      const p = data as any;
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt || "",
        content: p.content,
        coverImage: p.cover_image,
        authorId: p.author_id,
        authorName: p.profiles?.full_name || "IEC Yazar",
        authorRole: "Mühendislik Kulübü",
        authorAvatar: p.profiles?.avatar_url,
        category: (p.tags && p.tags[0]) || "Genel",
        tags: p.tags || [],
        readingTimeMin: p.reading_time_min || 3,
        status: p.status,
        likesCount: 0,
        viewsCount: 1,
        publishedAt: p.published_at || p.created_at,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    }
  } catch {
    // Fallback
  }

  const found = memoryPosts.find((p) => p.slug === slug);
  return found || null;
}

export async function getBlogComments(
  postSlug: string
): Promise<BlogCommentItem[]> {
  try {
    const supabase = await createClient();
    const { data: post } = (await supabase
      .from("blog_posts")
      .select("id")
      .eq("slug", postSlug)
      .single()) as any;

    if (post) {
      const { data: comments } = await supabase
        .from("blog_comments")
        .select("*, profiles:user_id(full_name, avatar_url)")
        .eq("post_id", (post as any).id)
        .order("created_at", { ascending: true });

      if (comments && comments.length > 0) {
        const mapped: BlogCommentItem[] = (comments as any[]).map((c: any) => ({
          id: c.id,
          postId: c.post_id,
          postSlug,
          parentId: c.parent_id,
          userId: c.user_id,
          authorName: c.profiles?.full_name || "Öğrenci",
          authorRole: "Üye",
          authorAvatar: c.profiles?.avatar_url,
          content: c.content,
          isFlagged: c.is_flagged,
          createdAt: c.created_at,
        }));

        return buildCommentTree(mapped);
      }
    }
  } catch {
    // Fallback
  }

  const postComments = memoryComments.filter((c) => c.postSlug === postSlug);
  return buildCommentTree(postComments);
}

export async function getAllBlogCommentsForAdmin(
  filter: "all" | "flagged" = "all"
): Promise<BlogCommentItem[]> {
  try {
    const admin = createAdminClient();
    let q = admin
      .from("blog_comments")
      .select(
        "*, profiles:user_id(full_name, email), blog_posts:post_id(title, slug)"
      )
      .order("created_at", { ascending: false });

    if (filter === "flagged") {
      q = q.eq("is_flagged", true);
    }

    const { data } = await q;
    if (data && data.length > 0) {
      return (data as any[]).map((c: any) => ({
        id: c.id,
        postId: c.post_id,
        postSlug: c.blog_posts?.slug || "",
        parentId: c.parent_id,
        userId: c.user_id,
        authorName: c.profiles?.full_name || "Kullanıcı",
        authorRole: "Üye",
        content: c.content,
        isFlagged: c.is_flagged,
        createdAt: c.created_at,
      }));
    }
  } catch {
    // Fallback
  }

  if (filter === "flagged") {
    return memoryComments.filter((c) => c.isFlagged);
  }
  return memoryComments;
}

export function buildCommentTree(
  flatList: BlogCommentItem[]
): BlogCommentItem[] {
  const rootComments: BlogCommentItem[] = [];
  const map: Record<string, BlogCommentItem> = {};

  flatList.forEach((c) => {
    map[c.id] = { ...c, replies: [] };
  });

  flatList.forEach((c) => {
    if (c.parentId && map[c.parentId]) {
      map[c.parentId].replies = map[c.parentId].replies || [];
      map[c.parentId].replies!.push(map[c.id]);
    } else {
      rootComments.push(map[c.id]);
    }
  });

  return rootComments;
}

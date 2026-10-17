import { createAdminClient, createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser, userCan } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { adminText } from "@/lib/i18n/portal/admin";
import { isBlogCategory, isSlugLike } from "@/lib/admin/blog-meta";
import type { BlogPostItem, BlogCommentItem } from "./blog-data";

/**
 * Blog reads. Everything goes through the user-scoped Supabase client, so row level security
 * decides what is visible (published posts for everyone, drafts only for their author and admins).
 * When Supabase is not configured these return empty results; there is no placeholder content.
 */

export interface AdminCommentItem extends BlogCommentItem {
  postTitle?: string;
  authorEmail?: string;
}

const POST_COLUMNS =
  "id, slug, title, excerpt, content, cover_image, author_id, status, reading_time_min, tags, published_at, created_at, updated_at, profiles:author_id(full_name, avatar_url)";

interface PostRow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  author_id: string;
  status: BlogPostItem["status"];
  reading_time_min: number | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

/** The category is stored as the first tag (blog_posts has no category column). */
function splitCategory(tags: string[] | null): { category: BlogPostItem["category"]; tags: string[] } {
  const list = tags ?? [];
  if (list.length > 0 && isBlogCategory(list[0])) {
    return { category: list[0], tags: list.slice(1) };
  }
  return { category: "Genel", tags: list };
}

function mapPost(row: PostRow, likes: number, text: { authorFallback: string; authorRole: string }): BlogPostItem {
  const { category, tags } = splitCategory(row.tags);
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || "",
    content: row.content,
    coverImage: row.cover_image || undefined,
    authorId: row.author_id,
    authorName: row.profiles?.full_name || text.authorFallback,
    authorRole: text.authorRole,
    authorAvatar: row.profiles?.avatar_url || undefined,
    category,
    tags,
    readingTimeMin: row.reading_time_min || 1,
    status: row.status,
    likesCount: likes,
    viewsCount: 0,
    publishedAt: row.published_at || row.created_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function countLikes(supabase: Awaited<ReturnType<typeof createClient>>, postIds: string[]) {
  const counts = new Map<string, number>();
  if (postIds.length === 0) return counts;
  const { data } = await (supabase.from("blog_likes") as any).select("post_id").in("post_id", postIds);
  for (const row of (data ?? []) as Array<{ post_id: string }>) {
    counts.set(row.post_id, (counts.get(row.post_id) ?? 0) + 1);
  }
  return counts;
}

async function postText() {
  const t = adminText[await getServerLocale()].actions;
  return { authorFallback: t.authorFallback, authorRole: t.authorRole };
}

export async function getBlogPosts(options?: {
  query?: string;
  category?: string;
  tag?: string;
  status?: "published" | "draft" | "all";
}): Promise<BlogPostItem[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const status = options?.status ?? "published";
    let q = (supabase.from("blog_posts") as any).select(POST_COLUMNS).order("created_at", { ascending: false });
    if (status !== "all") q = q.eq("status", status);

    const { data, error } = await q;
    if (error || !data) return [];
    const rows = data as PostRow[];
    const [likes, text] = await Promise.all([countLikes(supabase, rows.map((r) => r.id)), postText()]);
    return filterPosts(
      rows.map((row) => mapPost(row, likes.get(row.id) ?? 0, text)),
      options
    );
  } catch (error) {
    console.error("[blog] getBlogPosts failed", error);
    return [];
  }
}

function filterPosts(
  posts: BlogPostItem[],
  options?: { query?: string; category?: string; tag?: string }
): BlogPostItem[] {
  let result = posts;

  if (options?.category && options.category !== "all") {
    const category = options.category.toLowerCase();
    result = result.filter((p) => p.category.toLowerCase() === category);
  }

  if (options?.tag) {
    const tag = options.tag.toLowerCase();
    result = result.filter((p) => p.tags.some((t) => t.toLowerCase() === tag));
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

export async function getBlogPostBySlug(slug: string): Promise<BlogPostItem | null> {
  if (!isSupabaseConfigured() || !isSlugLike(slug)) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("blog_posts") as any)
      .select(POST_COLUMNS)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    const row = data as PostRow;
    const [likes, text] = await Promise.all([countLikes(supabase, [row.id]), postText()]);
    return mapPost(row, likes.get(row.id) ?? 0, text);
  } catch (error) {
    console.error("[blog] getBlogPostBySlug failed", error);
    return null;
  }
}

/** The signed-in member's own posts, drafts included, most recently edited first. */
export async function getMyBlogPosts(): Promise<BlogPostItem[]> {
  if (!isSupabaseConfigured()) return [];
  const user = await getSessionUser();
  if (!user) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("blog_posts") as any)
      .select(POST_COLUMNS)
      .eq("author_id", user.id)
      .order("updated_at", { ascending: false });
    if (error || !data) return [];
    const rows = data as PostRow[];
    const [likes, text] = await Promise.all([countLikes(supabase, rows.map((r) => r.id)), postText()]);
    return rows.map((row) => mapPost(row, likes.get(row.id) ?? 0, text));
  } catch (error) {
    console.error("[blog] getMyBlogPosts failed", error);
    return [];
  }
}

/** One post by id for the editor. Row level security limits drafts to their author and editors. */
export async function getBlogPostById(id: string): Promise<BlogPostItem | null> {
  if (!isSupabaseConfigured() || !/^[0-9a-f-]{36}$/i.test(id)) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("blog_posts") as any).select(POST_COLUMNS).eq("id", id).maybeSingle();
    if (error || !data) return null;
    return mapPost(data as PostRow, 0, await postText());
  } catch (error) {
    console.error("[blog] getBlogPostById failed", error);
    return null;
  }
}

export async function getBlogComments(postSlug: string): Promise<BlogCommentItem[]> {
  if (!isSupabaseConfigured() || !isSlugLike(postSlug)) return [];
  try {
    const supabase = await createClient();
    const { data: post } = await (supabase.from("blog_posts") as any)
      .select("id")
      .eq("slug", postSlug)
      .maybeSingle();
    if (!post) return [];

    const { data: comments, error } = await (supabase.from("blog_comments") as any)
      .select("id, post_id, parent_id, user_id, content, is_flagged, created_at, profiles:user_id(full_name, avatar_url)")
      .eq("post_id", (post as { id: string }).id)
      .order("created_at", { ascending: true });
    if (error || !comments) return [];

    const t = adminText[await getServerLocale()].actions;
    const mapped: BlogCommentItem[] = (comments as any[]).map((c) => ({
      id: c.id,
      postId: c.post_id,
      postSlug,
      parentId: c.parent_id,
      userId: c.user_id,
      authorName: c.profiles?.full_name || t.commenterFallback,
      authorRole: t.memberRole,
      authorAvatar: c.profiles?.avatar_url || undefined,
      content: c.content,
      isFlagged: Boolean(c.is_flagged),
      createdAt: c.created_at,
    }));

    return buildCommentTree(mapped);
  } catch (error) {
    console.error("[blog] getBlogComments failed", error);
    return [];
  }
}

/**
 * Every comment (newest first) for the moderation page. Only users with blog.moderate get
 * anything back; everyone else receives an empty list, so this can never leak commenter emails.
 */
export async function getAllBlogCommentsForAdmin(
  filter: "all" | "flagged" = "all"
): Promise<AdminCommentItem[]> {
  if (!isSupabaseConfigured()) return [];
  const user = await getSessionUser();
  if (!userCan(user, "blog.moderate")) return [];

  if (!isSupabaseAdminConfigured()) return [];

  try {
    // Commenter emails are server-only columns, so moderators read them with the service role.
    const supabase = createAdminClient();
    let q = (supabase.from("blog_comments") as any)
      .select(
        "id, post_id, parent_id, user_id, content, is_flagged, created_at, profiles:user_id(full_name, email), blog_posts:post_id(title, slug)"
      )
      .order("created_at", { ascending: false })
      .limit(500);
    if (filter === "flagged") q = q.eq("is_flagged", true);

    const { data, error } = await q;
    if (error || !data) return [];

    const t = adminText[await getServerLocale()].actions;
    return (data as any[]).map((c) => ({
      id: c.id,
      postId: c.post_id,
      postSlug: c.blog_posts?.slug || "",
      postTitle: c.blog_posts?.title || undefined,
      parentId: c.parent_id,
      userId: c.user_id,
      authorName: c.profiles?.full_name || t.commenterFallback,
      authorEmail: c.profiles?.email || undefined,
      authorRole: t.memberRole,
      content: c.content,
      isFlagged: Boolean(c.is_flagged),
      createdAt: c.created_at,
    }));
  } catch (error) {
    console.error("[blog] getAllBlogCommentsForAdmin failed", error);
    return [];
  }
}

export function buildCommentTree(flatList: BlogCommentItem[]): BlogCommentItem[] {
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

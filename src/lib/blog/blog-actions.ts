"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  guardedAction,
  requirePermission,
  requireUser,
  userCan,
  type ActionResult,
} from "@/lib/auth/session";
import { actionText, privilegedClient, writeAuditLog } from "@/lib/admin/server-utils";
import {
  BLOG_CATEGORIES,
  BLOG_LIMITS,
  isSlugLike,
  isValidCoverImage,
  isValidSlug,
  readingMinutes,
  slugify,
} from "@/lib/admin/blog-meta";
import { RATE_LIMITS, consumeRateLimit } from "@/lib/security/rate-limit";
import type { BlogPostItem, BlogCommentItem } from "./blog-data";
import {
  getBlogPosts,
  getBlogPostBySlug,
  getBlogComments,
  getAllBlogCommentsForAdmin,
  type AdminCommentItem,
} from "./blog-queries";

/**
 * Blog server actions. These are public HTTP endpoints: every one identifies the caller with
 * requireUser/requirePermission before doing anything, and the service-role client is only
 * created after that check.
 *
 * Permission rules:
 * - create a post: blog.write; publishing additionally needs blog.publish
 * - edit a post: its author or anyone with blog.publish
 * - delete a post: blog.moderate, or the author for their own draft
 * - comment / like: any signed-in user, attributed to that user
 * - flag / unflag / delete a comment: blog.moderate
 */

// Read wrappers kept for compatibility. They use the user-scoped client (RLS applies) and the
// admin comment list returns nothing unless the caller has blog.moderate.
export async function getBlogPostsAction(options?: {
  query?: string;
  category?: string;
  tag?: string;
  status?: "published" | "draft" | "all";
}): Promise<BlogPostItem[]> {
  return getBlogPosts(options);
}

export async function getBlogPostBySlugAction(slug: string): Promise<BlogPostItem | null> {
  return getBlogPostBySlug(slug);
}

export async function getBlogCommentsAction(postSlug: string): Promise<BlogCommentItem[]> {
  return getBlogComments(postSlug);
}

export async function getAllBlogCommentsForAdminAction(
  filter: "all" | "flagged" = "all"
): Promise<AdminCommentItem[]> {
  return getAllBlogCommentsForAdmin(filter);
}

/** For looking existing posts up; new slugs are checked with the strict isValidSlug on save. */
const slugSchema = z.string().refine((value) => isSlugLike(value));
const uuidSchema = z.string().uuid();

/** Keeps a markdown link only when its target is http(s), mailto, a site path, an anchor or relative. */
function sanitizeLinkTargets(segment: string): string {
  return segment.replace(/\]\(([^)]*)\)/g, (match, rawUrl: string) => {
    const url = rawUrl.replace(/[\u0000- \u007f]/g, "");
    if (/^(https?:\/\/|mailto:|#)/i.test(url)) return match;
    if (/^\/(?!\/)/.test(url)) return match;
    if (url.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(url)) return "](#)";
    return match;
  });
}

/**
 * Markdown is rendered with React (text is escaped, raw HTML is shown as text), so the remaining
 * injection risk is link targets such as javascript: or data: URLs. Neutralize those outside of
 * code blocks and inline code before saving.
 */
function sanitizeMarkdown(markdown: string): string {
  let inFence = false;
  return markdown
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => {
      if (line.trim().startsWith("```")) {
        inFence = !inFence;
        return line;
      }
      if (inFence) return line;
      return line
        .split(/(`[^`]+`)/g)
        .map((part) => (part.length > 1 && part.startsWith("`") && part.endsWith("`") ? part : sanitizeLinkTargets(part)))
        .join("");
    })
    .join("\n");
}

function deriveExcerpt(content: string): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*`>\[\]()_~-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > 160 ? `${plain.slice(0, 157).trimEnd()}...` : plain;
}

function revalidateBlog(...slugs: Array<string | null | undefined>) {
  revalidatePath("/blog");
  revalidatePath("/portal/admin/blog");
  revalidatePath("/portal/admin");
  for (const slug of new Set(slugs.filter(Boolean))) revalidatePath(`/blog/${slug}`);
}

/* ------------------------------------------------------------------ likes */

export async function likeBlogPostAction(
  slug: string
): Promise<{ success: true; likesCount: number; data: { likesCount: number }; message?: string } | { success: false; error: string }> {
  const result = await guardedAction<{ likesCount: number }>(async () => {
    const actor = await requireUser();
    const t = await actionText();
    if (!slugSchema.safeParse(slug).success) return { success: false, error: t.invalidInput };

    const supabase = await createClient();
    const { data: post } = await (supabase.from("blog_posts") as any)
      .select("id")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (!post) return { success: false, error: t.postNotFound };

    const { error } = await (supabase.from("blog_likes") as any).upsert(
      { post_id: post.id, user_id: actor.id },
      { onConflict: "post_id,user_id", ignoreDuplicates: true }
    );
    if (error) throw error;

    const { count } = await (supabase.from("blog_likes") as any)
      .select("post_id", { count: "exact", head: true })
      .eq("post_id", post.id);

    revalidatePath(`/blog/${slug}`);
    revalidatePath("/blog");
    return { success: true, data: { likesCount: count ?? 0 }, message: t.likeSaved };
  });

  if (!result.success) return result;
  const likesCount = result.data?.likesCount ?? 0;
  return { success: true, likesCount, data: { likesCount }, message: result.message };
}

/* --------------------------------------------------------------- comments */

const commentSchema = z.object({
  postSlug: slugSchema,
  parentId: uuidSchema.nullable().optional(),
  content: z.string().trim().min(BLOG_LIMITS.commentMin).max(BLOG_LIMITS.commentMax),
});

/** Adds a comment as the signed-in user. Replies to replies are attached to the thread's root. */
export async function addBlogCommentAction(data: {
  postSlug: string;
  parentId?: string | null;
  content: string;
}): Promise<
  | { success: true; comment: BlogCommentItem; data: BlogCommentItem; message?: string }
  | { success: false; error: string }
> {
  const result = await guardedAction<BlogCommentItem>(async () => {
    const actor = await requireUser();
    const t = await actionText();

    const parsed = commentSchema.safeParse(data);
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path[0];
      return { success: false, error: field === "content" ? t.commentLength : t.invalidInput };
    }
    const input = parsed.data;
    if (!(await consumeRateLimit(RATE_LIMITS.blogComment, actor.id))) {
      return { success: false, error: t.commentRateLimited };
    }

    const supabase = await createClient();
    const { data: post } = await (supabase.from("blog_posts") as any)
      .select("id, slug")
      .eq("slug", input.postSlug)
      .eq("status", "published")
      .maybeSingle();
    if (!post) return { success: false, error: t.commentPostMissing };

    let parentId: string | null = null;
    if (input.parentId) {
      const { data: parent } = await (supabase.from("blog_comments") as any)
        .select("id, parent_id, post_id")
        .eq("id", input.parentId)
        .maybeSingle();
      if (!parent || parent.post_id !== post.id) return { success: false, error: t.parentMissing };
      parentId = parent.parent_id ?? parent.id;
    }

    const { data: inserted, error } = await (supabase.from("blog_comments") as any)
      .insert({ post_id: post.id, parent_id: parentId, user_id: actor.id, content: input.content })
      .select("id, created_at")
      .single();
    if (error) throw error;

    const comment: BlogCommentItem = {
      id: inserted.id,
      postId: post.id,
      postSlug: post.slug,
      parentId,
      userId: actor.id,
      authorName: actor.fullName,
      authorRole: t.memberRole,
      authorAvatar: actor.avatarUrl ?? undefined,
      content: input.content,
      isFlagged: false,
      createdAt: inserted.created_at,
    };

    revalidatePath(`/blog/${post.slug}`);
    revalidatePath("/portal/admin/blog/yorumlar");
    return { success: true, data: comment, message: t.commentAdded };
  });

  if (!result.success) return result;
  const comment = result.data as BlogCommentItem;
  return { success: true, comment, data: comment, message: result.message };
}

/** Sets or clears a comment's moderation flag. Requires blog.moderate. */
export async function flagBlogCommentAction(commentId: string, flagged: boolean = true): Promise<ActionResult> {
  return guardedAction(async () => {
    const actor = await requirePermission("blog.moderate");
    const t = await actionText();
    if (!uuidSchema.safeParse(commentId).success || typeof flagged !== "boolean") {
      return { success: false, error: t.invalidInput };
    }

    const admin = await privilegedClient();
    const { data: comment, error } = await (admin.from("blog_comments") as any)
      .update({ is_flagged: flagged })
      .eq("id", commentId)
      .select("id, post_id, blog_posts:post_id(slug)")
      .maybeSingle();
    if (error) throw error;
    if (!comment) return { success: false, error: t.commentNotFound };

    try {
      await writeAuditLog(admin, {
        actorId: actor.id,
        action: flagged ? "blog.comment.flag" : "blog.comment.unflag",
        targetType: "blog_comment",
        targetId: commentId,
        details: { post_slug: comment.blog_posts?.slug ?? null },
      });
    } catch (auditError) {
      console.error("[blog] audit log for comment flag failed", auditError);
    }

    revalidatePath("/portal/admin/blog/yorumlar");
    if (comment.blog_posts?.slug) revalidatePath(`/blog/${comment.blog_posts.slug}`);
    return { success: true, message: flagged ? t.commentFlagged : t.commentUnflagged };
  });
}

/** Deletes a comment and (through the foreign key cascade) its replies. Requires blog.moderate. */
export async function deleteBlogCommentAction(commentId: string): Promise<ActionResult> {
  return guardedAction(async () => {
    const actor = await requirePermission("blog.moderate");
    const t = await actionText();
    if (!uuidSchema.safeParse(commentId).success) return { success: false, error: t.invalidInput };

    const admin = await privilegedClient();
    const { data: comment } = await (admin.from("blog_comments") as any)
      .select("id, user_id, content, blog_posts:post_id(slug)")
      .eq("id", commentId)
      .maybeSingle();
    if (!comment) return { success: false, error: t.commentNotFound };

    const { error } = await (admin.from("blog_comments") as any).delete().eq("id", commentId);
    if (error) throw error;

    try {
      await writeAuditLog(admin, {
        actorId: actor.id,
        action: "blog.comment.delete",
        targetType: "blog_comment",
        targetId: commentId,
        details: {
          post_slug: comment.blog_posts?.slug ?? null,
          author_id: comment.user_id ?? null,
          excerpt: String(comment.content ?? "").slice(0, 120),
        },
      });
    } catch (auditError) {
      console.error("[blog] audit log for comment delete failed", auditError);
    }

    revalidatePath("/portal/admin/blog/yorumlar");
    if (comment.blog_posts?.slug) revalidatePath(`/blog/${comment.blog_posts.slug}`);
    return { success: true, message: t.commentDeleted };
  });
}

/* ------------------------------------------------------------------ posts */

const postSchema = z.object({
  id: uuidSchema.optional(),
  slug: z.string().trim().max(BLOG_LIMITS.slugMax).optional(),
  title: z.string().trim().min(BLOG_LIMITS.titleMin).max(BLOG_LIMITS.titleMax),
  excerpt: z.string().trim().max(BLOG_LIMITS.excerptMax).optional(),
  content: z
    .string()
    .max(BLOG_LIMITS.contentMax)
    .refine((value) => value.trim().length >= BLOG_LIMITS.contentMin),
  category: z.enum(BLOG_CATEGORIES),
  tags: z.array(z.string().trim().min(1).max(BLOG_LIMITS.tagMax)).max(BLOG_LIMITS.tagsMax).optional(),
  coverImage: z.string().trim().max(BLOG_LIMITS.coverMax).optional(),
  status: z.enum(["published", "draft"]),
});

type PostField = keyof z.infer<typeof postSchema>;

export async function saveBlogPostAction(data: {
  id?: string;
  slug?: string;
  title: string;
  excerpt: string;
  content: string;
  category: BlogPostItem["category"];
  tags: string[];
  coverImage?: string;
  status: "published" | "draft";
}): Promise<ActionResult<{ id: string; slug: string }>> {
  return guardedAction(async () => {
    const actor = await requirePermission("blog.write");
    const t = await actionText();

    const parsed = postSchema.safeParse(data);
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path[0] as PostField | undefined;
      const messages: Partial<Record<PostField, string>> = {
        slug: t.slugFormat,
        title: t.titleLength,
        excerpt: t.excerptLength,
        content: t.contentLength,
        category: t.categoryInvalid,
        tags: t.tagsInvalid,
        coverImage: t.coverInvalid,
      };
      return { success: false, error: (field && messages[field]) || t.invalidInput };
    }
    const input = parsed.data;

    const slug = input.slug ? input.slug : slugify(input.title);
    if (!isValidSlug(slug)) return { success: false, error: t.slugFormat };

    const coverImage = input.coverImage ? input.coverImage : null;
    if (coverImage && !isValidCoverImage(coverImage)) return { success: false, error: t.coverInvalid };

    const canPublish = userCan(actor, "blog.publish");
    if (input.status === "published" && !canPublish) return { success: false, error: t.publishForbidden };

    const admin = await privilegedClient();

    let existing: { id: string; slug: string; author_id: string; status: string; published_at: string | null } | null =
      null;
    if (input.id) {
      const { data: row, error } = await (admin.from("blog_posts") as any)
        .select("id, slug, author_id, status, published_at")
        .eq("id", input.id)
        .maybeSingle();
      if (error) throw error;
      if (!row) return { success: false, error: t.postNotFound };
      if (row.author_id !== actor.id && !canPublish) return { success: false, error: t.editForbidden };
      existing = row;
    }

    const { data: clash } = await (admin.from("blog_posts") as any)
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (clash && clash.id !== existing?.id) return { success: false, error: t.slugTaken };

    const content = sanitizeMarkdown(input.content);
    const tags = (input.tags ?? []).filter((tag) => tag !== input.category);
    const now = new Date().toISOString();
    const row = {
      slug,
      title: input.title,
      excerpt: input.excerpt || deriveExcerpt(content),
      content,
      cover_image: coverImage,
      status: input.status,
      reading_time_min: readingMinutes(content),
      tags: [input.category, ...tags],
      published_at: input.status === "published" ? existing?.published_at ?? now : null,
      updated_at: now,
    };

    let savedId: string;
    if (existing) {
      const { error } = await (admin.from("blog_posts") as any).update(row).eq("id", existing.id);
      if (error) {
        if (error.code === "23505") return { success: false, error: t.slugTaken };
        throw error;
      }
      savedId = existing.id;
    } else {
      const { data: inserted, error } = await (admin.from("blog_posts") as any)
        .insert({ ...row, author_id: actor.id })
        .select("id")
        .single();
      if (error) {
        if (error.code === "23505") return { success: false, error: t.slugTaken };
        throw error;
      }
      savedId = inserted.id;
    }

    if (input.status === "published" && existing?.status !== "published") {
      try {
        await writeAuditLog(admin, {
          actorId: actor.id,
          action: "blog.post.publish",
          targetType: "blog_post",
          targetId: savedId,
          details: { title: input.title, slug },
        });
      } catch (auditError) {
        console.error("[blog] audit log for publish failed", auditError);
      }
    }

    revalidateBlog(slug, existing?.slug);
    return { success: true, data: { id: savedId, slug }, message: t.postSaved };
  });
}

export async function deleteBlogPostAction(slug: string): Promise<ActionResult> {
  return guardedAction(async () => {
    const actor = await requireUser();
    const isModerator = userCan(actor, "blog.moderate");
    if (!isModerator) await requirePermission("blog.write");
    const t = await actionText();
    if (!slugSchema.safeParse(slug).success) return { success: false, error: t.invalidInput };

    const admin = await privilegedClient();
    const { data: post, error: readError } = await (admin.from("blog_posts") as any)
      .select("id, slug, title, author_id, status")
      .eq("slug", slug)
      .maybeSingle();
    if (readError) throw readError;
    if (!post) return { success: false, error: t.postNotFound };

    const ownDraft = post.author_id === actor.id && post.status === "draft";
    if (!isModerator && !ownDraft) return { success: false, error: t.deleteForbidden };

    const { error } = await (admin.from("blog_posts") as any).delete().eq("id", post.id);
    if (error) throw error;

    try {
      await writeAuditLog(admin, {
        actorId: actor.id,
        action: "blog.post.delete",
        targetType: "blog_post",
        targetId: post.id,
        details: { title: post.title, slug: post.slug, status: post.status },
      });
    } catch (auditError) {
      console.error("[blog] audit log for post delete failed", auditError);
    }

    revalidateBlog(post.slug);
    return { success: true, message: t.postDeleted };
  });
}

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  category: "Gömülü Sistemler" | "Mühendislik Kültürü" | "Yapay Zekâ" | "Etkinlikler" | "Genel";
  tags: string[];
  readingTimeMin: number;
  status: "published" | "draft" | "archived";
  likesCount: number;
  viewsCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface BlogCommentItem {
  id: string;
  postId: string;
  postSlug: string;
  parentId?: string | null;
  userId: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  content: string;
  isFlagged: boolean;
  createdAt: string;
  replies?: BlogCommentItem[];
}

// Posts and comments come from Supabase (blog_posts, blog_comments). This fallback stays empty so the
// site never shows placeholder articles or comments attributed to real members.
export const initialBlogPosts: BlogPostItem[] = [];

export const initialBlogComments: BlogCommentItem[] = [];
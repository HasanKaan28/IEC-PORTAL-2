import type { BlogPostItem } from "@/lib/blog/blog-data";

/**
 * Blog rules shared by the editor (client) and the server actions, so both validate the same way.
 * The server is the authority; the client copies are only for early feedback.
 */

export const BLOG_CATEGORIES = [
  "Gömülü Sistemler",
  "Mühendislik Kültürü",
  "Yapay Zekâ",
  "Etkinlikler",
  "Genel",
] as const satisfies readonly BlogPostItem["category"][];

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_LIMITS = {
  titleMin: 5,
  titleMax: 160,
  slugMin: 3,
  slugMax: 120,
  excerptMax: 300,
  contentMin: 20,
  contentMax: 50_000,
  tagsMax: 8,
  tagMax: 30,
  coverMax: 500,
  commentMin: 3,
  commentMax: 2_000,
} as const;

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Loose check for looking a post up by slug (older slugs may not follow the strict save rule). */
export function isSlugLike(value: unknown): value is string {
  return typeof value === "string" && /^[A-Za-z0-9-]{1,200}$/.test(value);
}

export function isBlogCategory(value: unknown): value is BlogCategory {
  return typeof value === "string" && (BLOG_CATEGORIES as readonly string[]).includes(value);
}

export function isValidSlug(value: string): boolean {
  return (
    value.length >= BLOG_LIMITS.slugMin && value.length <= BLOG_LIMITS.slugMax && SLUG_PATTERN.test(value)
  );
}

/** Cover images: an https URL or a same-site path. Nothing else ends up in an <img src>. */
export function isValidCoverImage(value: string): boolean {
  if (value.length > BLOG_LIMITS.coverMax) return false;
  return /^https:\/\/[^\s"'<>\\]+$/i.test(value) || /^\/(?!\/)[^\s"'<>\\]*$/.test(value);
}

const TR_MAP: Record<string, string> = {
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
  â: "a",
  Â: "a",
};

export function slugify(text: string): string {
  return text
    .split("")
    .map((char) => TR_MAP[char] ?? char)
    .join("")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, BLOG_LIMITS.slugMax)
    .replace(/-+$/g, "");
}

export function parseTags(input: string): string[] {
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const raw of input.split(",")) {
    const tag = raw.trim();
    if (!tag || seen.has(tag.toLowerCase())) continue;
    seen.add(tag.toLowerCase());
    tags.push(tag);
  }
  return tags;
}

export function countWords(content: string): number {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

export function readingMinutes(content: string): number {
  return Math.max(1, Math.ceil(countWords(content) / 200));
}

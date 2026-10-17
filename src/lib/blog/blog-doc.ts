/**
 * Blog post body format. The editor (Tiptap) produces a ProseMirror JSON tree; we store it in
 * blog_posts.content as {"format":"iec-doc/1","doc":{...}}. Older posts are plain Markdown and keep
 * rendering through MarkdownRenderer.
 *
 * Nothing here ever becomes raw HTML. sanitizeBlogDoc keeps only the node types, marks and
 * attributes listed below, checks every link and image address, and caps the size. The server runs
 * it before saving, and the renderer runs it again when reading, so a hand-edited row cannot slip
 * anything through either.
 *
 * This module has no server-only imports: the editor uses the same rules for early feedback.
 */

export const BLOG_DOC_FORMAT = "iec-doc/1";

export const IMAGE_LAYOUTS = ["inline", "wide", "full"] as const;
export type ImageLayout = (typeof IMAGE_LAYOUTS)[number];

export const BLOG_DOC_LIMITS = {
  depth: 12,
  nodes: 20_000,
  /** Characters of readable text. */
  textChars: 60_000,
  /** Size of the stored JSON string. */
  storedChars: 600_000,
  altMax: 300,
  languageMax: 30,
  hrefMax: 2_000,
  srcMax: 1_000,
  minWords: 3,
} as const;

export type BlogMark =
  | { type: "bold" }
  | { type: "italic" }
  | { type: "underline" }
  | { type: "strike" }
  | { type: "code" }
  | { type: "link"; attrs: { href: string } };

export interface BlogTextNode {
  type: "text";
  text: string;
  marks?: BlogMark[];
}

export type BlogInline = BlogTextNode | { type: "hardBreak" };

export interface BlogListItem {
  type: "listItem";
  content: BlogBlock[];
}

export interface BlogImageAttrs {
  src: string;
  alt: string;
  layout: ImageLayout;
  /** Pixel size, when known, so the page reserves room for the photo before it loads. */
  width?: number;
  height?: number;
}

export type BlogBlock =
  | { type: "paragraph"; content?: BlogInline[] }
  | { type: "heading"; attrs: { level: 2 | 3 }; content?: BlogInline[] }
  | { type: "blockquote"; content: BlogBlock[] }
  | { type: "bulletList"; content: BlogListItem[] }
  | { type: "orderedList"; attrs: { start: number }; content: BlogListItem[] }
  | { type: "codeBlock"; attrs: { language: string | null }; content?: BlogTextNode[] }
  | { type: "horizontalRule" }
  | { type: "blogImage"; attrs: BlogImageAttrs; content?: BlogInline[] };

export interface BlogDoc {
  type: "doc";
  content: BlogBlock[];
}

export type ParsedBlogContent = { kind: "doc"; doc: BlogDoc } | { kind: "markdown"; markdown: string };

/* ------------------------------------------------------------- addresses */

const UNSAFE_URL_CHARS = /[\s"'<>\\`]/;

/** Link targets: http(s), mailto, a same-site path or an anchor. Anything else is dropped. */
export function safeLinkHref(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const href = raw.trim();
  if (!href || href.length > BLOG_DOC_LIMITS.hrefMax || UNSAFE_URL_CHARS.test(href)) return null;
  if (/^(https?:\/\/|mailto:)/i.test(href)) return href;
  if (/^\/(?!\/)/.test(href) || href.startsWith("#")) return href;
  return null;
}

/** Public URL prefix of the blog-images bucket, or null when Supabase is not configured. */
export function blogImagePublicPrefix(): string | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || !url.startsWith("https://") || url.includes("placeholder")) return null;
  return `${url.replace(/\/+$/, "")}/storage/v1/object/public/blog-images/`;
}

/**
 * Images inside a post come from our own bucket (uploaded through the portal) or from this site.
 * Outside addresses are refused, so a post cannot embed tracking pixels or hotlinked files.
 */
export function isAllowedBlogImageSrc(raw: unknown): raw is string {
  if (typeof raw !== "string") return false;
  const src = raw.trim();
  if (!src || src.length > BLOG_DOC_LIMITS.srcMax || UNSAFE_URL_CHARS.test(src) || src.includes("..")) return false;
  const prefix = blogImagePublicPrefix();
  if (prefix && src.startsWith(prefix) && src.length > prefix.length) return true;
  return /^\/(?!\/)/.test(src);
}

/* -------------------------------------------------------------- sanitize */

interface Budget {
  nodes: number;
  textChars: number;
}

const SIMPLE_MARKS = new Set(["bold", "italic", "underline", "strike", "code"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function childList(node: Record<string, unknown>): unknown[] {
  return Array.isArray(node.content) ? node.content : [];
}

function cleanText(value: unknown, budget: Budget): string {
  if (typeof value !== "string") return "";
  // Control characters other than tab and newline have no place in a post.
  const text = value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
  const room = Math.max(0, BLOG_DOC_LIMITS.textChars - budget.textChars);
  const kept = text.slice(0, room);
  budget.textChars += kept.length;
  return kept;
}

function sanitizeMarks(raw: unknown): BlogMark[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const marks: BlogMark[] = [];
  const seen = new Set<string>();
  for (const mark of raw) {
    if (!isRecord(mark) || typeof mark.type !== "string" || seen.has(mark.type)) continue;
    if (SIMPLE_MARKS.has(mark.type)) {
      marks.push({ type: mark.type } as BlogMark);
      seen.add(mark.type);
    } else if (mark.type === "link") {
      const href = safeLinkHref(isRecord(mark.attrs) ? mark.attrs.href : null);
      if (href) {
        marks.push({ type: "link", attrs: { href } });
        seen.add("link");
      }
    }
  }
  return marks.length > 0 ? marks : undefined;
}

function sanitizeInline(raw: unknown[], budget: Budget, allowMarks = true): BlogInline[] {
  const out: BlogInline[] = [];
  for (const node of raw) {
    if (!isRecord(node) || budget.nodes >= BLOG_DOC_LIMITS.nodes) continue;
    if (node.type === "hardBreak") {
      budget.nodes += 1;
      out.push({ type: "hardBreak" });
    } else if (node.type === "text") {
      const text = cleanText(node.text, budget);
      if (!text) continue;
      budget.nodes += 1;
      const marks = allowMarks ? sanitizeMarks(node.marks) : undefined;
      out.push(marks ? { type: "text", text, marks } : { type: "text", text });
    }
  }
  return out;
}

function pixelSize(value: unknown): number | null {
  const size = Number(value);
  return Number.isInteger(size) && size > 0 && size <= 20_000 ? size : null;
}

function sanitizeListItems(raw: unknown[], budget: Budget, depth: number): BlogListItem[] {
  const items: BlogListItem[] = [];
  for (const node of raw) {
    if (!isRecord(node) || node.type !== "listItem") continue;
    const content = sanitizeBlocks(childList(node), budget, depth + 1);
    items.push({ type: "listItem", content: content.length > 0 ? content : [{ type: "paragraph" }] });
  }
  return items;
}

function sanitizeBlock(node: Record<string, unknown>, budget: Budget, depth: number): BlogBlock | null {
  const attrs = isRecord(node.attrs) ? node.attrs : {};
  switch (node.type) {
    case "paragraph": {
      const content = sanitizeInline(childList(node), budget);
      return content.length > 0 ? { type: "paragraph", content } : { type: "paragraph" };
    }
    case "heading": {
      const level = Number(attrs.level) >= 3 ? 3 : 2;
      const content = sanitizeInline(childList(node), budget);
      return content.length > 0 ? { type: "heading", attrs: { level }, content } : { type: "heading", attrs: { level } };
    }
    case "blockquote": {
      const content = sanitizeBlocks(childList(node), budget, depth + 1);
      return { type: "blockquote", content: content.length > 0 ? content : [{ type: "paragraph" }] };
    }
    case "bulletList": {
      const content = sanitizeListItems(childList(node), budget, depth);
      return content.length > 0 ? { type: "bulletList", content } : null;
    }
    case "orderedList": {
      const content = sanitizeListItems(childList(node), budget, depth);
      const start = Math.min(10_000, Math.max(1, Math.floor(Number(attrs.start) || 1)));
      return content.length > 0 ? { type: "orderedList", attrs: { start }, content } : null;
    }
    case "codeBlock": {
      const language =
        typeof attrs.language === "string" && /^[A-Za-z0-9+#._-]{1,30}$/.test(attrs.language) ? attrs.language : null;
      const content = sanitizeInline(childList(node), budget, false).filter(
        (child): child is BlogTextNode => child.type === "text"
      );
      return content.length > 0
        ? { type: "codeBlock", attrs: { language }, content }
        : { type: "codeBlock", attrs: { language } };
    }
    case "horizontalRule":
      return { type: "horizontalRule" };
    case "blogImage": {
      if (!isAllowedBlogImageSrc(attrs.src)) return null;
      const alt = typeof attrs.alt === "string" ? cleanText(attrs.alt, budget).trim().slice(0, BLOG_DOC_LIMITS.altMax) : "";
      const layout = (IMAGE_LAYOUTS as readonly unknown[]).includes(attrs.layout) ? (attrs.layout as ImageLayout) : "inline";
      const width = pixelSize(attrs.width);
      const height = pixelSize(attrs.height);
      const imageAttrs: BlogImageAttrs = { src: attrs.src.trim(), alt, layout };
      if (width && height) Object.assign(imageAttrs, { width, height });
      const caption = sanitizeInline(childList(node), budget);
      const image: BlogBlock = { type: "blogImage", attrs: imageAttrs };
      return caption.length > 0 ? { ...image, content: caption } : image;
    }
    default:
      return null;
  }
}

function sanitizeBlocks(raw: unknown[], budget: Budget, depth: number): BlogBlock[] {
  if (depth > BLOG_DOC_LIMITS.depth) return [];
  const blocks: BlogBlock[] = [];
  for (const node of raw) {
    if (!isRecord(node) || budget.nodes >= BLOG_DOC_LIMITS.nodes) continue;
    budget.nodes += 1;
    const block = sanitizeBlock(node, budget, depth);
    if (block) blocks.push(block);
  }
  return blocks;
}

/** Returns a clean copy that only holds what the renderer knows, or null if this is not a document. */
export function sanitizeBlogDoc(input: unknown): BlogDoc | null {
  if (!isRecord(input) || input.type !== "doc") return null;
  const content = sanitizeBlocks(childList(input), { nodes: 0, textChars: 0 }, 0);
  return { type: "doc", content: content.length > 0 ? content : [{ type: "paragraph" }] };
}

/* ------------------------------------------------------- store and read */

export function serializeBlogDoc(doc: BlogDoc): string {
  return JSON.stringify({ format: BLOG_DOC_FORMAT, doc });
}

export function isBlogDocContent(content: string): boolean {
  return content.startsWith('{"format":"iec-doc/');
}

export function parseBlogContent(content: string): ParsedBlogContent {
  if (isBlogDocContent(content)) {
    try {
      const parsed: unknown = JSON.parse(content);
      if (isRecord(parsed) && parsed.format === BLOG_DOC_FORMAT) {
        const doc = sanitizeBlogDoc(parsed.doc);
        if (doc) return { kind: "doc", doc };
      }
    } catch {
      // Falls through to Markdown, which shows the text safely.
    }
  }
  return { kind: "markdown", markdown: content };
}

/* ------------------------------------------------------------ plain text */

function inlineText(content: BlogInline[] | undefined): string {
  return (content ?? []).map((node) => (node.type === "text" ? node.text : "\n")).join("");
}

function blockText(block: BlogBlock): string {
  switch (block.type) {
    case "paragraph":
    case "heading":
    case "blogImage":
      return inlineText(block.content);
    case "codeBlock":
      return inlineText(block.content);
    case "blockquote":
      return block.content.map(blockText).join("\n");
    case "bulletList":
    case "orderedList":
      return block.content.map((item) => item.content.map(blockText).join("\n")).join("\n");
    case "horizontalRule":
      return "";
  }
}

export function blogDocPlainText(doc: BlogDoc): string {
  return doc.content.map(blockText).filter(Boolean).join("\n");
}

function markdownPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#*`>\[\]()_~-]/g, " ");
}

/** Readable text of a stored post body, whichever format it is in. */
export function blogContentPlainText(content: string): string {
  const parsed = parseBlogContent(content);
  return parsed.kind === "doc" ? blogDocPlainText(parsed.doc) : markdownPlainText(parsed.markdown);
}

export function countTextWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function readingMinutesForWords(words: number): number {
  return Math.max(1, Math.ceil(words / 200));
}

export function excerptFromText(text: string, max = 160): string {
  const plain = text.replace(/\s+/g, " ").trim();
  return plain.length > max ? `${plain.slice(0, max - 3).trimEnd()}...` : plain;
}

/** Every image address in the document, for cleaning up storage when a post is deleted. */
export function blogDocImageSrcs(doc: BlogDoc): string[] {
  const found: string[] = [];
  const walk = (blocks: BlogBlock[]) => {
    for (const block of blocks) {
      if (block.type === "blogImage") found.push(block.attrs.src);
      else if (block.type === "blockquote") walk(block.content);
      else if (block.type === "bulletList" || block.type === "orderedList") {
        for (const item of block.content) walk(item.content);
      }
    }
  };
  walk(doc.content);
  return found;
}

/* ------------------------------------------------- Markdown to document */

const INLINE_TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;

/** Same inline rules as MarkdownRenderer: `code`, **bold**, *italic* and [text](url). */
function markdownInline(text: string): BlogInline[] {
  const out: BlogInline[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_TOKEN)) {
    const token = match[0];
    const index = match.index ?? 0;
    if (index > last) out.push({ type: "text", text: text.slice(last, index) });
    if (token.startsWith("`")) out.push({ type: "text", text: token.slice(1, -1), marks: [{ type: "code" }] });
    else if (token.startsWith("**")) out.push({ type: "text", text: token.slice(2, -2), marks: [{ type: "bold" }] });
    else if (token.startsWith("*")) out.push({ type: "text", text: token.slice(1, -1), marks: [{ type: "italic" }] });
    else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const href = link ? safeLinkHref(link[2]) : null;
      if (link) out.push(href ? { type: "text", text: link[1], marks: [{ type: "link", attrs: { href } }] } : { type: "text", text: link[1] });
    }
    last = index + token.length;
  }
  if (last < text.length) out.push({ type: "text", text: text.slice(last) });
  return out.filter((node) => node.type !== "text" || node.text.length > 0);
}

function paragraph(text: string): BlogBlock {
  const content = markdownInline(text);
  return content.length > 0 ? { type: "paragraph", content } : { type: "paragraph" };
}

/**
 * Turns a Markdown post into a document so it opens in the editor. It follows the same line rules as
 * MarkdownRenderer, so an older post looks the same after it is saved in the new format.
 */
export function markdownToBlogDoc(markdown: string): BlogDoc {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: BlogBlock[] = [];
  let code: { language: string | null; lines: string[] } | null = null;

  const appendItem = (type: "bulletList" | "orderedList", text: string) => {
    const item: BlogListItem = { type: "listItem", content: [paragraph(text)] };
    const previous = blocks[blocks.length - 1];
    if (previous && previous.type === type) previous.content.push(item);
    else if (type === "bulletList") blocks.push({ type, content: [item] });
    else blocks.push({ type, attrs: { start: 1 }, content: [item] });
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("```")) {
      if (code) {
        const text = code.lines.join("\n");
        blocks.push(
          text
            ? { type: "codeBlock", attrs: { language: code.language }, content: [{ type: "text", text }] }
            : { type: "codeBlock", attrs: { language: code.language } }
        );
        code = null;
      } else {
        const language = trimmed.slice(3).trim();
        code = { language: /^[A-Za-z0-9+#._-]{1,30}$/.test(language) ? language : null, lines: [] };
      }
      continue;
    }
    if (code) {
      code.lines.push(line);
      continue;
    }
    if (!trimmed) continue;
    if (line.startsWith("### ")) blocks.push({ type: "heading", attrs: { level: 3 }, content: markdownInline(line.slice(4)) });
    else if (line.startsWith("## ")) blocks.push({ type: "heading", attrs: { level: 2 }, content: markdownInline(line.slice(3)) });
    else if (line.startsWith("# ")) blocks.push({ type: "heading", attrs: { level: 2 }, content: markdownInline(line.slice(2)) });
    else if (line.startsWith("> ")) blocks.push({ type: "blockquote", content: [paragraph(line.slice(2))] });
    else if (/^[-*]\s+/.test(trimmed)) appendItem("bulletList", trimmed.replace(/^[-*]\s+/, ""));
    else if (/^\d+\.\s+/.test(trimmed)) appendItem("orderedList", trimmed.replace(/^\d+\.\s+/, ""));
    else if (/^-{3,}$/.test(trimmed)) blocks.push({ type: "horizontalRule" });
    else blocks.push(paragraph(line));
  }
  if (code) {
    const text = code.lines.join("\n");
    blocks.push(text ? { type: "codeBlock", attrs: { language: code.language }, content: [{ type: "text", text }] } : { type: "codeBlock", attrs: { language: code.language } });
  }
  return sanitizeBlogDoc({ type: "doc", content: blocks }) ?? { type: "doc", content: [{ type: "paragraph" }] };
}

/** The editor's starting document for a stored post body. */
export function blogContentToDoc(content: string): BlogDoc {
  const parsed = parseBlogContent(content);
  return parsed.kind === "doc" ? parsed.doc : markdownToBlogDoc(parsed.markdown);
}

import React from "react";
import BlogCodeBlock from "./BlogCodeBlock";
import { readingSerif } from "@/lib/fonts/reading-font";
import type { BlogBlock, BlogDoc, BlogInline, BlogListItem, ImageLayout } from "@/lib/blog/blog-doc";

/**
 * Renders a sanitized blog document with React elements only, so text is always escaped and only
 * the node types the sanitizer allows can appear. Works on the server and inside client components.
 *
 * Text sits in a reading column; photos can break out to a wide column or the full screen width.
 * A page that shows full-width photos should clip horizontal overflow (overflow-x-clip).
 */

const COLUMN = "mx-auto w-full max-w-[42rem]";

export const BLOG_IMAGE_LAYOUT_CLASS: Record<ImageLayout, string> = {
  inline: COLUMN,
  wide: "mx-auto w-full max-w-[60rem]",
  full: "relative left-1/2 w-screen max-w-none -translate-x-1/2",
};

const LINK_CLASS =
  "rounded-sm text-brand-700 underline decoration-brand-500/40 underline-offset-4 transition-colors hover:text-brand-800 hover:decoration-brand-600 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-400/70";

function renderInline(nodes: BlogInline[] | undefined, keyPrefix: string): React.ReactNode[] {
  return (nodes ?? []).map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    if (node.type === "hardBreak") return <br key={key} />;
    let element: React.ReactNode = node.text;
    for (const mark of node.marks ?? []) {
      switch (mark.type) {
        case "bold":
          element = <strong className="font-semibold text-slate-900">{element}</strong>;
          break;
        case "italic":
          element = <em>{element}</em>;
          break;
        case "underline":
          element = <u className="underline-offset-4">{element}</u>;
          break;
        case "strike":
          element = <s>{element}</s>;
          break;
        case "code":
          element = (
            <code className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-brand-800">{element}</code>
          );
          break;
        case "link": {
          const external = /^(https?:)?\/\//i.test(mark.attrs.href);
          element = (
            <a
              href={mark.attrs.href}
              className={LINK_CLASS}
              {...(external ? { target: "_blank", rel: "noopener noreferrer nofollow ugc" } : {})}
            >
              {element}
            </a>
          );
          break;
        }
      }
    }
    return <React.Fragment key={key}>{element}</React.Fragment>;
  });
}

function renderListItems(items: BlogListItem[], keyPrefix: string) {
  return items.map((item, index) => (
    <li key={`${keyPrefix}-${index}`} className="pl-1.5 marker:text-brand-600 [&>p]:my-1.5">
      {item.content.map((block, blockIndex) => renderBlock(block, `${keyPrefix}-${index}-${blockIndex}`, true))}
    </li>
  ));
}

function renderBlock(block: BlogBlock, key: string, nested = false): React.ReactNode {
  const column = nested ? "" : COLUMN;
  switch (block.type) {
    case "paragraph":
      return (
        <p key={key} className={`${column} my-5 min-h-[1em] text-pretty`}>
          {renderInline(block.content, key)}
        </p>
      );
    case "heading":
      return block.attrs.level === 2 ? (
        <h2
          key={key}
          className={`${column} mt-12 mb-3 font-display text-2xl font-bold tracking-tight text-balance text-slate-900 sm:text-[1.75rem]/9`}
        >
          {renderInline(block.content, key)}
        </h2>
      ) : (
        <h3 key={key} className={`${column} mt-9 mb-2 font-display text-xl font-semibold text-balance text-slate-900`}>
          {renderInline(block.content, key)}
        </h3>
      );
    case "blockquote":
      return (
        <blockquote key={key} className={`${column} my-7 border-l-[3px] border-brand-600 pl-5 italic text-slate-700`}>
          {block.content.map((child, index) => renderBlock(child, `${key}-${index}`, true))}
        </blockquote>
      );
    case "bulletList":
      return (
        <ul key={key} className={`${column} my-5 list-disc space-y-1 pl-7`}>
          {renderListItems(block.content, key)}
        </ul>
      );
    case "orderedList":
      return (
        <ol key={key} start={block.attrs.start} className={`${column} my-5 list-decimal space-y-1 pl-7`}>
          {renderListItems(block.content, key)}
        </ol>
      );
    case "codeBlock":
      return (
        <div key={key} className={`${column} font-sans`}>
          <BlogCodeBlock
            language={block.attrs.language ?? ""}
            code={(block.content ?? []).map((node) => node.text).join("")}
          />
        </div>
      );
    case "horizontalRule":
      return (
        <div key={key} role="separator" className={`${column} my-10 text-center text-2xl tracking-[0.6em] text-slate-400`}>
          <span aria-hidden="true">...</span>
        </div>
      );
    case "blogImage": {
      const { src, alt, layout, width, height } = block.attrs;
      const hasCaption = (block.content ?? []).length > 0;
      return (
        <figure key={key} className={`${BLOG_IMAGE_LAYOUT_CLASS[layout]} my-9`}>
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading="lazy"
            decoding="async"
            className={`h-auto w-full bg-slate-100 object-cover ${layout === "full" ? "" : "rounded-lg"}`}
          />
          {hasCaption && (
            <figcaption className="mx-auto mt-3 max-w-[42rem] px-4 text-center font-sans text-sm text-slate-500">
              {renderInline(block.content, `${key}-caption`)}
            </figcaption>
          )}
        </figure>
      );
    }
  }
}

export default function BlogDocRenderer({ doc }: { doc: BlogDoc }) {
  return (
    <div
      className={`${readingSerif.variable} font-[family-name:var(--font-reading)] text-lg/8 text-slate-800 sm:text-[1.25rem]/[2.05rem]`}
    >
      {doc.content.map((block, index) => renderBlock(block, `b${index}`))}
    </div>
  );
}

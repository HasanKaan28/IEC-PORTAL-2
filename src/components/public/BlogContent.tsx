import React from "react";
import BlogDocRenderer from "./BlogDocRenderer";
import MarkdownRenderer from "./MarkdownRenderer";
import { parseBlogContent } from "@/lib/blog/blog-doc";

/** A post body in either format: editor documents (new posts) or Markdown (older posts). */
export default function BlogContent({ content }: { content: string }) {
  const parsed = parseBlogContent(content);
  return parsed.kind === "doc" ? <BlogDocRenderer doc={parsed.doc} /> : <MarkdownRenderer content={parsed.markdown} />;
}

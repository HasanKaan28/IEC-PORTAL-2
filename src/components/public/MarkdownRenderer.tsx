"use client";

import React from "react";
import CodeBlock from "./BlogCodeBlock";

interface MarkdownRendererProps {
  content: string;
}

const SAFE_LINK_PREFIXES = ["http://", "https://", "mailto:", "/", "#"];

/**
 * Returns the link target only when it starts with an allowed prefix, otherwise null, so
 * `javascript:`, `data:`, `vbscript:` and anything unrecognised is shown as plain text.
 */
function toSafeHref(raw: string): string | null {
  const href = raw.trim();
  const lower = href.toLowerCase();
  return SAFE_LINK_PREFIXES.some((prefix) => lower.startsWith(prefix)) ? href : null;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  // Simple, resilient parser that handles standard Markdown elements
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeLanguage = "";
  let codeBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code blocks ```
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <CodeBlock
            key={`code-${i}`}
            language={codeLanguage}
            code={codeBuffer.join("\n")}
          />
        );
        codeBuffer = [];
        inCodeBlock = false;
        codeLanguage = "";
      } else {
        // Start code block
        inCodeBlock = true;
        codeLanguage = line.trim().replace(/^```/, "").trim();
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Empty lines
    if (line.trim() === "") {
      elements.push(<div key={`empty-${i}`} className="h-4" />);
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-8 mb-4 font-display"
        >
          {renderFormattedInline(line.replace("# ", ""))}
        </h1>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-8 mb-3 pb-2 border-b border-slate-200 font-display flex items-center gap-2"
        >
          <span className="w-1.5 h-5 bg-brand-500 rounded-full inline-block" />
          {renderFormattedInline(line.replace("## ", ""))}
        </h2>
      );
      continue;
    }

    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={`h3-${i}`}
          className="text-lg font-semibold text-brand-800 mt-6 mb-2"
        >
          {renderFormattedInline(line.replace("### ", ""))}
        </h3>
      );
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <blockquote
          key={`quote-${i}`}
          className="border-l-4 border-brand-500/80 bg-brand-500/5 px-4 py-3 rounded-r-xl my-4 text-slate-600 italic text-sm leading-relaxed"
        >
          {renderFormattedInline(line.replace("> ", ""))}
        </blockquote>
      );
      continue;
    }

    // Unordered lists
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      elements.push(
        <li
          key={`li-${i}`}
          className="ml-6 list-disc text-slate-600 text-sm sm:text-base/6 leading-relaxed my-1 marker:text-brand-600"
        >
          {renderFormattedInline(line.trim().replace(/^[-*]\s+/, ""))}
        </li>
      );
      continue;
    }

    // Ordered lists
    if (/^\d+\.\s+/.test(line.trim())) {
      elements.push(
        <li
          key={`oli-${i}`}
          className="ml-6 list-decimal text-slate-600 text-sm sm:text-base/6 leading-relaxed my-1 marker:text-brand-600 font-mono"
        >
          <span className="font-sans">
            {renderFormattedInline(line.trim().replace(/^\d+\.\s+/, ""))}
          </span>
        </li>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p
        key={`p-${i}`}
        className="text-slate-600 text-sm sm:text-base/6 leading-relaxed my-2"
      >
        {renderFormattedInline(line)}
      </p>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}

function renderFormattedInline(text: string): React.ReactNode {
  // Replace inline bold, italic, code, and links
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  // Regex patterns for inline markdown
  // 1. `code`
  // 2. **bold**
  // 3. *italic*
  // 4. [text](url)
  const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={`code-in-${keyIdx++}`}
          className="px-1.5 py-0.5 rounded bg-brand-50 border border-brand-500/30 text-brand-700 font-mono text-xs"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={`bold-${keyIdx++}`} className="font-semibold text-slate-900">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={`em-${keyIdx++}`} className="italic text-slate-700">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const href = toSafeHref(linkMatch[2]);
        parts.push(
          href ? (
            <a
              key={`link-${keyIdx++}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              className="rounded text-brand-700 hover:text-brand-800 underline underline-offset-4 decoration-brand-500/50 hover:decoration-brand-400 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-400/70"
            >
              {linkMatch[1]}
            </a>
          ) : (
            // Unsafe target (e.g. javascript:): keep the words, drop the link.
            <span key={`link-${keyIdx++}`}>{linkMatch[1]}</span>
          )
        );
      }
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { NodeSelection } from "@tiptap/pm/state";
import { useEditorState, type Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { Bold, Code, Heading2, Heading3, Italic, Link as LinkIcon, Quote, Unlink, type LucideIcon } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { blogWriterText } from "@/lib/i18n/portal/blog-writer";
import { safeLinkHref } from "@/lib/blog/blog-doc";

/** Turns "example.com" into "https://example.com"; anything still unsafe returns null. */
function normaliseHref(input: string): string | null {
  const value = input.trim();
  if (!value) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("/") && !value.startsWith("#") && /\.[a-z]{2,}/i.test(value)) {
    return safeLinkHref(`https://${value}`);
  }
  return safeLinkHref(value);
}

const button =
  "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-200 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80";

/**
 * Floating toolbar over selected text, like Medium's: bold, italic, link, two heading sizes,
 * quote and inline code. Ctrl/Cmd+K opens the link field (linkRequest counts those presses).
 */
export default function BlogTextBubble({ editor, linkRequest }: { editor: Editor; linkRequest: number }) {
  const { locale } = useLocale();
  const t = blogWriterText[locale].toolbar;
  const [linkMode, setLinkMode] = useState(false);
  const [href, setHref] = useState("");
  const [invalid, setInvalid] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  const active = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      link: e.isActive("link"),
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      quote: e.isActive("blockquote"),
      code: e.isActive("code"),
      linkHref: (e.getAttributes("link").href as string | undefined) ?? "",
    }),
  });

  const openLink = () => {
    setHref(active.linkHref);
    setInvalid(false);
    setLinkMode(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  useEffect(() => {
    if (linkRequest > 0 && !editor.state.selection.empty) openLink();
    // Only a new Ctrl/Cmd+K press should open the field.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkRequest]);

  const closeLink = () => {
    setLinkMode(false);
    editor.commands.focus();
  };

  const applyLink = (event: React.FormEvent) => {
    event.preventDefault();
    if (!href.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkMode(false);
      return;
    }
    const safe = normaliseHref(href);
    if (!safe) {
      setInvalid(true);
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: safe }).run();
    setLinkMode(false);
  };

  const tools: Array<{ key: string; label: string; icon: LucideIcon; pressed: boolean; run: () => void }> = [
    { key: "bold", label: t.bold, icon: Bold, pressed: active.bold, run: () => editor.chain().focus().toggleBold().run() },
    { key: "italic", label: t.italic, icon: Italic, pressed: active.italic, run: () => editor.chain().focus().toggleItalic().run() },
    { key: "link", label: t.link, icon: LinkIcon, pressed: active.link, run: openLink },
    { key: "h2", label: t.h2, icon: Heading2, pressed: active.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { key: "h3", label: t.h3, icon: Heading3, pressed: active.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { key: "quote", label: t.quote, icon: Quote, pressed: active.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
    { key: "code", label: t.code, icon: Code, pressed: active.code, run: () => editor.chain().focus().toggleCode().run() },
  ];

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: "top", offset: 10 }}
      shouldShow={({ editor: e, state, from, to, element }) => {
        if (!e.isEditable || from === to || state.selection instanceof NodeSelection) return false;
        if (e.isActive("codeBlock") || e.isActive("blogImage")) return false;
        return e.view.hasFocus() || element.contains(document.activeElement);
      }}
      className="z-40 rounded-xl bg-slate-900 p-1 font-sans shadow-xl"
    >
      {linkMode ? (
        <form onSubmit={applyLink} className="flex flex-wrap items-center gap-1 p-0.5">
          <label className="sr-only" htmlFor={`${errorId}-href`}>
            {t.linkLabel}
          </label>
          <input
            ref={inputRef}
            id={`${errorId}-href`}
            type="text"
            inputMode="url"
            autoComplete="url"
            spellCheck={false}
            value={href}
            placeholder={t.linkPlaceholder}
            aria-invalid={invalid}
            aria-describedby={invalid ? errorId : undefined}
            onChange={(event) => {
              setHref(event.target.value);
              setInvalid(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                closeLink();
              }
            }}
            className="h-9 w-64 max-w-[60vw] rounded-lg bg-white/10 px-3 text-sm text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-white/70"
          />
          <button type="submit" className="h-9 rounded-lg bg-white px-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80">
            {t.linkApply}
          </button>
          {active.link && (
            <button
              type="button"
              aria-label={t.linkRemove}
              title={t.linkRemove}
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                setLinkMode(false);
              }}
              className={button}
            >
              <Unlink className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          <button type="button" onClick={closeLink} className="h-9 rounded-lg px-2 text-sm text-slate-300 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80">
            {t.linkCancel}
          </button>
          {invalid && (
            <p id={errorId} role="alert" className="basis-full px-1 pb-1 text-xs text-rose-200">
              {t.linkInvalid}
            </p>
          )}
        </form>
      ) : (
        <div role="toolbar" aria-label={t.label} className="flex items-center">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <React.Fragment key={tool.key}>
                {index === 3 && <span className="mx-0.5 h-5 w-px bg-white/20" aria-hidden="true" />}
                <button
                  type="button"
                  aria-label={tool.label}
                  aria-pressed={tool.pressed}
                  title={tool.label}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={tool.run}
                  className={`${button} ${tool.pressed ? "bg-white/20 text-sky-200" : ""}`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </BubbleMenu>
  );
}

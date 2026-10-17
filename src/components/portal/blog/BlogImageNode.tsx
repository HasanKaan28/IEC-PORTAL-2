"use client";

import React, { useId, useState } from "react";
import { Node, type Editor } from "@tiptap/core";
import { NodeSelection } from "@tiptap/pm/state";
import {
  NodeViewContent,
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type ReactNodeViewProps,
} from "@tiptap/react";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Loader2,
  RectangleHorizontal,
  Maximize2,
  Square,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { blogWriterText } from "@/lib/i18n/portal/blog-writer";
import { IMAGE_LAYOUTS, type ImageLayout } from "@/lib/blog/blog-doc";

/**
 * A photo block with a caption. Drag it by its handle to move it anywhere in the text, or use the
 * up and down buttons from the keyboard. Width follows Medium: text width, wide, or full width.
 *
 * While a photo uploads, src is a local blob: address and uploadId marks the node so the editor
 * can swap in the real address afterwards. The server drops blob: images, so a half-finished
 * upload never gets saved.
 */

export interface BlogImageInsert {
  src: string;
  alt?: string;
  layout?: ImageLayout;
  width?: number | null;
  height?: number | null;
  uploadId?: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    blogImage: {
      insertBlogImage: (attrs: BlogImageInsert, position?: number) => ReturnType;
    };
  }
}

const LAYOUT_ICONS: Record<ImageLayout, LucideIcon> = {
  inline: Square,
  wide: RectangleHorizontal,
  full: Maximize2,
};

/** Width of the photo inside the editor, matching BlogDocRenderer on the site. */
const EDITOR_LAYOUT_CLASS: Record<ImageLayout, string> = {
  inline: "mx-auto max-w-[42rem]",
  wide: "mx-auto max-w-[60rem]",
  full: "relative left-1/2 w-screen max-w-none -translate-x-1/2",
};

const toolButton =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-slate-200 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/80 disabled:opacity-40";

/** Moves the block at pos one place up or down among its siblings and keeps it selected. */
function moveBlock(editor: Editor, pos: number, direction: -1 | 1) {
  const { state } = editor;
  const node = state.doc.nodeAt(pos);
  if (!node) return;
  const $pos = state.doc.resolve(pos);
  const index = $pos.index();
  const parent = $pos.parent;
  const neighbourIndex = index + direction;
  if (neighbourIndex < 0 || neighbourIndex >= parent.childCount) return;

  const neighbour = parent.child(neighbourIndex);
  const tr = state.tr.delete(pos, pos + node.nodeSize);
  const target = direction === -1 ? pos - neighbour.nodeSize : pos + neighbour.nodeSize;
  tr.insert(target, node);
  tr.setSelection(NodeSelection.create(tr.doc, target));
  editor.view.dispatch(tr.scrollIntoView());
  editor.view.focus();
}

function BlogImageView({ node, editor, getPos, selected, updateAttributes, deleteNode }: ReactNodeViewProps) {
  const { locale } = useLocale();
  const t = blogWriterText[locale].image;
  const [hovered, setHovered] = useState(false);
  const [altOpen, setAltOpen] = useState(false);
  const altId = useId();

  const layout: ImageLayout = (IMAGE_LAYOUTS as readonly string[]).includes(node.attrs.layout)
    ? node.attrs.layout
    : "inline";
  const uploading = Boolean(node.attrs.uploadId);
  const editable = editor.isEditable;
  const showTools = editable && (selected || hovered || altOpen);
  const captionEmpty = node.content.size === 0;

  const move = (direction: -1 | 1) => {
    const pos = getPos();
    if (typeof pos === "number") moveBlock(editor, pos, direction);
  };

  return (
    <NodeViewWrapper
      as="figure"
      data-layout={layout}
      className={`${EDITOR_LAYOUT_CLASS[layout]} group/image relative my-9`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div contentEditable={false} className="relative">
        {showTools && (
          <div
            role="toolbar"
            aria-label={t.toolbarLabel}
            className="absolute left-1/2 top-3 z-10 flex max-w-[calc(100%-1rem)] -translate-x-1/2 flex-wrap items-center gap-0.5 rounded-xl bg-slate-900/90 p-1 shadow-lg backdrop-blur-sm"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                editor.commands.focus();
              }
            }}
          >
            <span
              data-drag-handle=""
              draggable="true"
              title={t.drag}
              aria-hidden="true"
              className="inline-flex h-9 w-7 cursor-grab items-center justify-center rounded-lg text-slate-300 active:cursor-grabbing"
            >
              <GripVertical className="h-4 w-4" />
            </span>
            <span role="group" aria-label={t.layoutLabel} className="flex items-center">
              {IMAGE_LAYOUTS.map((option) => {
                const Icon = LAYOUT_ICONS[option];
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={layout === option}
                    aria-label={t.layouts[option]}
                    title={t.layouts[option]}
                    onClick={() => updateAttributes({ layout: option })}
                    className={`${toolButton} ${layout === option ? "bg-white/20 text-white" : ""}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                );
              })}
            </span>
            <span className="mx-0.5 h-5 w-px bg-white/20" aria-hidden="true" />
            <button type="button" aria-label={t.moveUp} title={t.moveUp} onClick={() => move(-1)} className={toolButton}>
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
            <button type="button" aria-label={t.moveDown} title={t.moveDown} onClick={() => move(1)} className={toolButton}>
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="mx-0.5 h-5 w-px bg-white/20" aria-hidden="true" />
            <button
              type="button"
              aria-expanded={altOpen}
              aria-controls={altId}
              onClick={() => setAltOpen((open) => !open)}
              className={`${toolButton} text-xs font-semibold ${node.attrs.alt ? "" : "text-accent-200"}`}
              title={node.attrs.alt ? t.altLabel : t.altMissing}
            >
              ALT
            </button>
            <button type="button" aria-label={t.remove} title={t.remove} onClick={deleteNode} className={toolButton}>
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}

        <img
          src={node.attrs.src}
          alt={node.attrs.alt || ""}
          width={node.attrs.width ?? undefined}
          height={node.attrs.height ?? undefined}
          draggable={false}
          // ProseMirror only selects leaf nodes on a plain click; this photo has a caption, so select it here.
          onClick={() => {
            const pos = getPos();
            if (editable && typeof pos === "number") editor.chain().setNodeSelection(pos).focus(undefined, { scrollIntoView: false }).run();
          }}
          className={`block h-auto w-full cursor-pointer bg-slate-100 object-cover transition-[outline-color] ${
            layout === "full" ? "" : "rounded-lg"
          } ${uploading ? "opacity-60" : ""} ${
            selected ? "outline-3 outline-offset-2 outline-brand-500" : "outline-3 outline-offset-2 outline-transparent"
          }`}
        />

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center" role="status">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 font-sans text-sm font-medium text-slate-700 shadow">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t.uploading}
            </span>
          </div>
        )}

        {altOpen && editable && (
          <div id={altId} className="mx-auto mt-3 max-w-[42rem] px-4 font-sans">
            <label htmlFor={`${altId}-input`} className="mb-1 block text-xs font-semibold text-slate-600">
              {t.altLabel}
            </label>
            <input
              id={`${altId}-input`}
              type="text"
              value={node.attrs.alt ?? ""}
              maxLength={300}
              autoFocus
              placeholder={t.altPlaceholder}
              onChange={(event) => updateAttributes({ alt: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === "Escape") {
                  event.preventDefault();
                  setAltOpen(false);
                  editor.commands.focus();
                }
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        )}
      </div>

      <div className="relative mx-auto mt-3 max-w-[42rem] px-4 text-center font-sans text-sm text-slate-500">
        {captionEmpty && editable && (selected || hovered) && (
          <span contentEditable={false} aria-hidden="true" className="pointer-events-none absolute inset-x-4 top-0 select-none text-slate-400">
            {t.captionPlaceholder}
          </span>
        )}
        <NodeViewContent as="div" className="min-h-[1.25rem] outline-hidden" />
      </div>
    </NodeViewWrapper>
  );
}

export const BlogImage = Node.create({
  name: "blogImage",
  group: "block",
  content: "inline*",
  marks: "bold italic link",
  draggable: true,
  isolating: true,
  defining: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      layout: { default: "inline" },
      width: { default: null },
      height: { default: null },
      uploadId: { default: null, rendered: false },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-blog-image]",
        contentElement: "figcaption",
        getAttrs: (element) => {
          const img = (element as HTMLElement).querySelector("img");
          if (!img?.getAttribute("src")) return false;
          return {
            src: img.getAttribute("src"),
            alt: img.getAttribute("alt") ?? "",
            layout: (element as HTMLElement).getAttribute("data-layout") ?? "inline",
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    return [
      "figure",
      { "data-blog-image": "", "data-layout": node.attrs.layout },
      ["img", { src: node.attrs.src, alt: node.attrs.alt }],
      ["figcaption", 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BlogImageView, { selectedOnTextSelection: true });
  },

  addCommands() {
    return {
      insertBlogImage:
        (attrs, position) =>
        ({ commands, state }) => {
          const { $from, from, to } = state.selection;
          // On an empty line the photo takes the line's place instead of leaving it behind.
          const onEmptyLine = $from.parent.type.name === "paragraph" && $from.parent.content.size === 0 && $from.depth > 0;
          const range = position ?? (onEmptyLine ? { from: $from.before(), to: $from.after() } : { from, to });
          return commands.insertContentAt(range, { type: this.name, attrs: { layout: "inline", alt: "", ...attrs } });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Enter inside a caption starts a new paragraph below the photo instead of splitting it.
      Enter: ({ editor }) => {
        const { $from, empty } = editor.state.selection;
        if (!empty || $from.parent.type.name !== this.name) return false;
        const after = $from.after();
        return editor.chain().insertContentAt(after, { type: "paragraph" }).setTextSelection(after + 1).run();
      },
    };
  },
});

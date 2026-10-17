"use client";

import React, { useId, useLayoutEffect, useState } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { Code2, ImagePlus, List, Minus, Plus, type LucideIcon } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { blogWriterText } from "@/lib/i18n/portal/blog-writer";

interface BlogInsertMenuProps {
  editor: Editor;
  /** The positioned element that holds the editor; the button is placed relative to it. */
  container: HTMLElement | null;
  onPickImage: () => void;
}

const itemClass =
  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500";

/**
 * Medium's "+" on an empty line: opens a row of blocks to insert (photo, divider, code block, list).
 * It sits in the left margin on wide screens and at the end of the line on phones.
 */
export default function BlogInsertMenu({ editor, container, onPickImage }: BlogInsertMenuProps) {
  const { locale } = useLocale();
  const t = blogWriterText[locale].insert;
  const [open, setOpen] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const [place, setPlace] = useState<{ top: number; left: number | null } | null>(null);
  const menuId = useId();

  const line = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const { $from, empty } = e.state.selection;
      const emptyLine = empty && $from.parent.type.name === "paragraph" && $from.parent.content.size === 0 && $from.depth === 1;
      return { emptyLine, pos: emptyLine ? $from.before() : -1, focused: e.isFocused, editable: e.isEditable };
    },
  });

  const visible = line.editable && line.emptyLine && (line.focused || focusInside || open);

  useLayoutEffect(() => {
    if (!visible || !container) {
      setPlace(null);
      return;
    }
    const dom = editor.view.nodeDOM(line.pos);
    if (!(dom instanceof HTMLElement)) return;
    const box = container.getBoundingClientRect();
    const row = dom.getBoundingClientRect();
    const roomOnLeft = row.left - box.left;
    setPlace({
      top: row.top - box.top + row.height / 2 - 18,
      left: roomOnLeft >= 52 ? roomOnLeft - 48 : null,
    });
  }, [visible, line.pos, container, editor]);

  if (!visible || !place) return null;

  const run = (action: () => void) => {
    action();
    setOpen(false);
    setFocusInside(false);
  };

  const items: Array<{ key: string; label: string; icon: LucideIcon; action: () => void }> = [
    { key: "image", label: t.image, icon: ImagePlus, action: onPickImage },
    { key: "divider", label: t.divider, icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run() },
    { key: "code", label: t.codeBlock, icon: Code2, action: () => editor.chain().focus().setCodeBlock().run() },
    { key: "list", label: t.bulletList, icon: List, action: () => editor.chain().focus().toggleBulletList().run() },
  ];

  return (
    <div
      className="absolute z-20 flex items-center gap-2 font-sans"
      style={place.left === null ? { top: place.top, right: 0 } : { top: place.top, left: place.left }}
      onFocus={() => setFocusInside(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocusInside(false);
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          setOpen(false);
          editor.commands.focus();
        }
      }}
    >
      <button
        type="button"
        aria-label={open ? t.close : t.open}
        title={open ? t.close : t.open}
        aria-expanded={open}
        aria-controls={menuId}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setOpen((value) => !value)}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border bg-white text-slate-600 shadow-xs transition-[transform,color,border-color] duration-200 hover:border-brand-500 hover:text-brand-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 motion-reduce:transition-none ${
          open ? "rotate-45 border-brand-500 text-brand-700" : "border-slate-300"
        }`}
      >
        <Plus className="h-5 w-5" aria-hidden="true" />
      </button>
      {open && (
        <div
          id={menuId}
          role="group"
          aria-label={t.menuLabel}
          className={`absolute top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-lg ${
            place.left === null ? "right-11 flex-col items-stretch" : "left-11"
          }`}
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => run(item.action)}
                className={itemClass}
              >
                <Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

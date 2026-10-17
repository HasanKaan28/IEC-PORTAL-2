"use client";

import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Extension, type JSONContent } from "@tiptap/core";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder } from "@tiptap/extensions";
import { AlertCircle, ArrowLeft, Check, Eye, ExternalLink, ImagePlus, Loader2, PenLine } from "lucide-react";
import BlogDocRenderer from "@/components/public/BlogDocRenderer";
import { saveBlogPostAction } from "@/lib/blog/blog-actions";
import {
  blogDocPlainText,
  countTextWords,
  excerptFromText,
  isAllowedBlogImageSrc,
  readingMinutesForWords,
  safeLinkHref,
  sanitizeBlogDoc,
  type BlogDoc,
} from "@/lib/blog/blog-doc";
import { BLOG_LIMITS, type BlogCategory } from "@/lib/admin/blog-meta";
import { readingSerif } from "@/lib/fonts/reading-font";
import { useLocale } from "@/lib/i18n/locale-context";
import { blogWriterText } from "@/lib/i18n/portal/blog-writer";
import { adminText } from "@/lib/i18n/portal/admin";
import { BlogImage } from "./BlogImageNode";
import BlogInsertMenu from "./BlogInsertMenu";
import BlogTextBubble from "./BlogTextBubble";
import BlogPublishDialog, { type PublishSettings, type PublishTarget } from "./BlogPublishDialog";
import { imageFilesFrom, prepareImage, uploadPreparedImage } from "./blog-image-upload";
import styles from "./blog-editor.module.css";

export interface BlogWriterPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  doc: BlogDoc;
  category: BlogCategory;
  tags: string[];
  coverImage: string;
  status: "draft" | "published";
  authorName: string;
  isOwn: boolean;
  updatedAt: string;
}

interface BlogWriterProps {
  post: BlogWriterPost | null;
  canPublish: boolean;
}

type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY_MS = 2000;
const focusRing = "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

/** Ctrl/Cmd+K asks the bubble toolbar to open its link field. */
const LinkShortcut = Extension.create<{ onLink: () => void }>({
  name: "linkShortcut",
  addOptions() {
    return { onLink: () => {} };
  },
  addKeyboardShortcuts() {
    return {
      "Mod-k": () => {
        if (this.editor.state.selection.empty) return false;
        this.options.onLink();
        return true;
      },
    };
  },
});

/** The first finished photo in the document, for the cover suggestion. */
function firstImageSrc(doc: JSONContent | undefined): string | null {
  for (const node of doc?.content ?? []) {
    if (node.type === "blogImage" && isAllowedBlogImageSrc(node.attrs?.src)) return node.attrs?.src as string;
    const nested = firstImageSrc(node);
    if (nested) return nested;
  }
  return null;
}

function findUpload(editor: Editor, uploadId: string): { pos: number; attrs: Record<string, unknown>; size: number } | null {
  let found: { pos: number; attrs: Record<string, unknown>; size: number } | null = null;
  editor.state.doc.descendants((node, pos) => {
    if (found) return false;
    if (node.type.name === "blogImage" && node.attrs.uploadId === uploadId) {
      found = { pos, attrs: node.attrs, size: node.nodeSize };
      return false;
    }
    return true;
  });
  return found;
}

/** A textarea that grows with its text, for the title and subtitle. */
function GrowingField(props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { fieldRef: React.RefObject<HTMLTextAreaElement | null> }) {
  const { fieldRef, value, ...rest } = props;
  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight}px`;
  }, [value, fieldRef]);
  return <textarea ref={fieldRef} rows={1} value={value} {...rest} />;
}

/**
 * Medium-style writing page: a large title and subtitle, flowing body text, a floating toolbar for
 * selected text, a "+" menu on empty lines, photos by button, drag and drop or paste, autosave for
 * drafts, a preview, and a publish dialog with the cover photo.
 */
export default function BlogWriter({ post, canPublish }: BlogWriterProps) {
  const { locale } = useLocale();
  const text = blogWriterText[locale];
  const t = text.editor;

  const [postId, setPostId] = useState<string | null>(post?.id ?? null);
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [status, setStatus] = useState<"draft" | "published">(post?.status ?? "draft");
  const [title, setTitle] = useState(post?.title ?? "");
  const [subtitle, setSubtitle] = useState(post?.excerpt ?? "");
  const [settings, setSettings] = useState<PublishSettings>({
    slug: post?.slug ?? "",
    category: post?.category ?? "Genel",
    tags: post?.tags ?? [],
    coverImage: post?.coverImage ?? "",
  });
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notice, setNotice] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [linkRequest, setLinkRequest] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  const titleRef = useRef<HTMLTextAreaElement>(null);
  const subtitleRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const versionRef = useRef(0);
  const lastErrorRef = useRef<string | null>(null);
  const savingRef = useRef<Promise<unknown> | null>(null);
  const insertFilesRef = useRef<(files: File[], position?: number) => void>(() => {});
  const bodyUsedRef = useRef(false);

  // Published posts are not autosaved: a change only reaches the site when it is published again.
  const autosave = status === "draft";
  const editingOthers = Boolean(post && !post.isOwn);

  const showNotice = useCallback((kind: "error" | "success", message: string) => {
    setNotice({ kind, text: message });
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), notice.kind === "error" ? 7000 : 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        dropcursor: { color: "#1f5a94", width: 3 },
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          defaultProtocol: "https",
          isAllowedUri: (url) => safeLinkHref(url) !== null,
          HTMLAttributes: { rel: "noopener noreferrer nofollow", target: null },
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => (node.type.name === "paragraph" ? t.bodyPlaceholder : ""),
      }),
      BlogImage,
      LinkShortcut.configure({ onLink: () => setLinkRequest((count) => count + 1) }),
    ],
    content: (post?.doc ?? { type: "doc", content: [{ type: "paragraph" }] }) as JSONContent,
    editorProps: {
      attributes: {
        class: styles.prose,
        "aria-label": t.bodyLabel,
        "aria-multiline": "true",
        role: "textbox",
        spellcheck: "true",
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = imageFilesFrom(event.dataTransfer?.files);
        setDragOver(false);
        if (files.length === 0) return false;
        event.preventDefault();
        const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
        insertFilesRef.current(files, coords?.pos);
        return true;
      },
      handlePaste: (_view, event) => {
        const files = imageFilesFrom(event.clipboardData?.files);
        if (files.length === 0) return false;
        event.preventDefault();
        insertFilesRef.current(files);
        return true;
      },
    },
    onUpdate: () => markDirtyRef.current(),
  });

  const [stats, setStats] = useState({ words: 0, minutes: 1 });
  useEffect(() => {
    if (!editor) return;
    const count = () => {
      const words = countTextWords(editor.getText());
      setStats((previous) => (previous.words === words ? previous : { words, minutes: readingMinutesForWords(words) }));
    };
    count();
    const markBodyUsed = () => {
      bodyUsedRef.current = true;
    };
    editor.on("focus", markBodyUsed);
    editor.on("update", count);
    return () => {
      editor.off("update", count);
      editor.off("focus", markBodyUsed);
    };
  }, [editor]);

  /** The photo button in the header: adds at the cursor, or at the end if the text was never clicked. */
  const pickImage = () => {
    if (!editor) return;
    if (!bodyUsedRef.current) editor.commands.focus("end");
    fileRef.current?.click();
  };

  /* ---------------------------------------------------------- saving */

  const latest = useRef({ title, subtitle, settings, postId, status });
  latest.current = { title, subtitle, settings, postId, status };
  const saveStateRef = useRef(saveState);
  saveStateRef.current = saveState;

  const save = useCallback(
    async (target: PublishTarget, override?: Partial<PublishSettings>, explicitSlug = false): Promise<string | null> => {
      if (!editor) return null;
      if (timerRef.current) clearTimeout(timerRef.current);
      while (savingRef.current) await savingRef.current.catch(() => undefined);

      const current = latest.current;
      const doc = editor.getJSON();
      const nothingYet =
        !current.postId && !current.title.trim() && !current.subtitle.trim() && editor.isEmpty && target === "draft";
      if (nothingYet) {
        setSaveState("idle");
        return null;
      }

      const version = versionRef.current;
      const nextSettings = { ...current.settings, ...override };
      setSaveState("saving");
      const request = saveBlogPostAction({
        id: current.postId ?? undefined,
        slug: explicitSlug && nextSettings.slug ? nextSettings.slug : undefined,
        title: current.title.trim(),
        excerpt: current.subtitle.trim(),
        doc,
        category: nextSettings.category,
        tags: nextSettings.tags,
        coverImage: nextSettings.coverImage || undefined,
        status: target,
      });
      savingRef.current = request;
      let result: Awaited<typeof request>;
      try {
        result = await request;
      } catch {
        result = { success: false, error: t.saveFailed };
      } finally {
        savingRef.current = null;
      }

      if (!result.success || !result.data) {
        const message = result.success ? t.saveFailed : result.error;
        setSaveState("error");
        // Autosave retries on the next change; the reason is shown once, not on every attempt.
        if (lastErrorRef.current !== message) showNotice("error", message);
        lastErrorRef.current = message;
        return message;
      }
      lastErrorRef.current = null;

      const saved = result.data;
      // Same route with ?id=, so a reload opens this draft and nothing remounts the editor now.
      if (!current.postId) window.history.replaceState(window.history.state, "", `/portal/blog/yaz?id=${saved.id}`);
      setPostId(saved.id);
      setSlug(saved.slug);
      setStatus(saved.status);
      setSettings({ ...nextSettings, slug: saved.slug });
      setSavedAt(saved.savedAt);
      setSaveState(versionRef.current === version ? "saved" : "dirty");
      return null;
    },
    [editor, t.saveFailed]
  );

  // Every change restarts the timer. A save that starts while another runs waits for it, then sends
  // the newest text.
  const markDirty = () => {
    versionRef.current += 1;
    setSaveState("dirty");
    if (timerRef.current) clearTimeout(timerRef.current);
    if (latest.current.status === "draft") {
      timerRef.current = setTimeout(() => void save("draft"), AUTOSAVE_DELAY_MS);
    }
  };
  const markDirtyRef = useRef(markDirty);
  markDirtyRef.current = markDirty;

  useEffect(() => {
    const flush = () => {
      if (document.visibilityState === "hidden" && latest.current.status === "draft" && saveStateRef.current === "dirty") {
        void save("draft");
      }
    };
    const warn = (event: BeforeUnloadEvent) => {
      if (saveStateRef.current === "dirty" || saveStateRef.current === "saving" || saveStateRef.current === "error") {
        event.preventDefault();
      }
    };
    document.addEventListener("visibilitychange", flush);
    window.addEventListener("beforeunload", warn);
    return () => {
      document.removeEventListener("visibilitychange", flush);
      window.removeEventListener("beforeunload", warn);
    };
  }, [save]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  /* ---------------------------------------------------------- photos */

  insertFilesRef.current = async (files: File[], position?: number) => {
    if (!editor) return;
    let at = position;
    if (typeof at === "number") {
      // Drop between blocks: place the photo after the block under the pointer.
      const $pos = editor.state.doc.resolve(Math.min(at, editor.state.doc.content.size));
      at = $pos.depth > 0 ? $pos.after(1) : at;
    }
    for (const file of files) {
      const prepared = await prepareImage(file);
      if (typeof prepared === "string") {
        showNotice("error", text.upload[prepared]);
        continue;
      }
      const uploadId = crypto.randomUUID();
      const localUrl = URL.createObjectURL(prepared.file);
      editor
        .chain()
        .focus()
        .insertBlogImage({ src: localUrl, uploadId, width: prepared.width, height: prepared.height }, at)
        .run();
      at = undefined;
      setPendingUploads((count) => count + 1);

      void uploadPreparedImage(prepared).then((result) => {
        const found = findUpload(editor, uploadId);
        if ("url" in result) {
          if (found) {
            editor.view.dispatch(
              editor.state.tr
                .setNodeMarkup(found.pos, undefined, { ...found.attrs, src: result.url, uploadId: null })
                .setMeta("addToHistory", false)
            );
          }
        } else {
          if (found) editor.view.dispatch(editor.state.tr.delete(found.pos, found.pos + found.size).setMeta("addToHistory", false));
          showNotice("error", result.error ?? text.upload.failed);
        }
        setPendingUploads((count) => count - 1);
        setTimeout(() => URL.revokeObjectURL(localUrl), 10_000);
      });
    }
  };

  /* -------------------------------------------------------- publishing */

  const publishMode: "publish" | "update" | "draft" = !canPublish ? "draft" : status === "published" ? "update" : "publish";
  // Read from the editor only while the dialog is open, not on every keystroke.
  const dialogDoc = dialogOpen && editor ? editor.getJSON() : undefined;
  const bodyText = (doc: JSONContent | undefined) => blogDocPlainText(sanitizeBlogDoc(doc) ?? { type: "doc", content: [] });
  const excerptPreview = dialogOpen ? subtitle.trim() || excerptFromText(bodyText(dialogDoc)) : "";

  const confirmPublish = async (next: PublishSettings, target: PublishTarget): Promise<string | null> => {
    if (pendingUploads > 0) return text.publish.errUploading;
    if (target === "published" && bodyText(editor?.getJSON()).trim().length < BLOG_LIMITS.contentMin) {
      return text.publish.errContent;
    }
    setSettings(next);
    const problem = await save(target, next, target === "published");
    if (problem) return problem;
    setDialogOpen(false);
    showNotice("success", target === "published" ? t.publishedToast : t.draftSavedToast);
    return null;
  };

  const unpublish = async (): Promise<string | null> => {
    const problem = await save("draft");
    if (problem) return problem;
    setDialogOpen(false);
    showNotice("success", t.unpublishedToast);
    return null;
  };

  /* ------------------------------------------------------------ render */

  const timeFormat = useMemo(() => new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { hour: "2-digit", minute: "2-digit" }), [locale]);
  const saveLabel =
    saveState === "saving"
      ? t.saving
      : saveState === "error"
      ? t.saveFailed
      : saveState === "dirty" && !autosave
      ? t.unsaved
      : savedAt
      ? t.savedAt(timeFormat.format(new Date(savedAt)))
      : "";

  const previewDoc = mode === "preview" && editor ? sanitizeBlogDoc(editor.getJSON()) : null;

  return (
    <div
      className={`${readingSerif.variable} min-h-screen overflow-x-clip bg-[#fbfbf8] bg-[radial-gradient(70rem_22rem_at_50%_-6rem,rgba(160,194,232,0.28),transparent_70%)] text-slate-900`}
    >
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#fbfbf8]/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[60rem] items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/portal/blog"
              onClick={() => {
                if (saveStateRef.current === "dirty" && latest.current.status === "draft") void save("draft");
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${focusRing}`}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">{t.back}</span>
            </Link>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                status === "published" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-accent-50 text-accent-800 ring-1 ring-accent-200"
              }`}
            >
              {status === "published" ? t.statusPublished : t.statusDraft}
            </span>
            <span role="status" aria-live="polite" className="flex min-w-0 items-center gap-1.5 truncate text-sm text-slate-500">
              {saveState === "saving" && <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden="true" />}
              {saveState === "saved" && <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden="true" />}
              {saveState === "error" && <AlertCircle className="h-3.5 w-3.5 shrink-0 text-rose-600" aria-hidden="true" />}
              <span className={`truncate ${saveState === "error" ? "text-rose-700" : ""}`}>{saveLabel}</span>
            </span>
            {saveState === "error" && autosave && (
              <button
                type="button"
                onClick={() => void save("draft")}
                className={`shrink-0 rounded-md text-sm font-semibold text-brand-700 hover:underline ${focusRing}`}
              >
                {t.retry}
              </button>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <span className="hidden text-sm tabular-nums text-slate-500 md:inline">
              {t.words(stats.words)} · {t.reading(stats.minutes)}
            </span>
            {status === "published" && slug && (
              <a
                href={`/blog/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t.viewLive}
                title={t.viewLive}
                className={`rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${focusRing}`}
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            )}
            {mode === "edit" && (
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={pickImage}
                disabled={!editor}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 ${focusRing}`}
              >
                {pendingUploads > 0 ? (
                  <Loader2 className="h-4 w-4 animate-spin text-brand-600" aria-hidden="true" />
                ) : (
                  <ImagePlus className="h-4 w-4 text-brand-600" aria-hidden="true" />
                )}
                <span className="sr-only sm:not-sr-only">{t.addPhoto}</span>
              </button>
            )}
            <button
              type="button"
              aria-pressed={mode === "preview"}
              onClick={() => setMode((value) => (value === "edit" ? "preview" : "edit"))}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 ${focusRing}`}
            >
              {mode === "edit" ? <Eye className="h-4 w-4" aria-hidden="true" /> : <PenLine className="h-4 w-4" aria-hidden="true" />}
              <span className="sr-only sm:not-sr-only">{mode === "edit" ? t.preview : t.backToEdit}</span>
            </button>
            <button
              type="button"
              onClick={() => setDialogOpen(true)}
              disabled={!editor}
              className={`rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60 ${focusRing}`}
            >
              {publishMode === "draft" ? t.saveDraft : publishMode === "update" ? t.publishChanges : t.publish}
            </button>
          </div>
        </div>
      </header>

      {(editingOthers || status === "published") && (
        <div className="mx-auto max-w-[42rem] px-4 pt-4 font-sans">
          <p className="rounded-xl border border-brand-100 bg-white/70 px-4 py-2.5 text-sm text-slate-700">
            {editingOthers && post ? `${t.editingOthers(post.authorName)} ` : ""}
            {status === "published" ? (canPublish ? t.publishedEditNote : t.publishedEditNoteNoRights) : ""}
          </p>
        </div>
      )}

      <main className="mx-auto max-w-[60rem] px-4 pb-40 pt-10 sm:pt-16">
        {mode === "preview" ? (
          <article aria-label={t.previewNote}>
            <p className="mx-auto mb-8 max-w-[42rem] rounded-xl bg-brand-50 px-4 py-2.5 font-sans text-sm text-brand-800">{t.previewNote}</p>
            <header className="mx-auto max-w-[42rem] space-y-4">
              <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-balance text-slate-900 sm:text-5xl/tight">
                {title || text.list.untitled}
              </h1>
              {subtitle && <p className="font-sans text-lg text-slate-600 sm:text-xl/8">{subtitle}</p>}
            </header>
            {settings.coverImage && (
              <img src={settings.coverImage} alt="" className="mx-auto mt-8 aspect-video w-full max-w-[56rem] rounded-2xl object-cover" />
            )}
            <div className="mt-8">{previewDoc && <BlogDocRenderer doc={previewDoc} />}</div>
          </article>
        ) : (
          <>
            <div className="mx-auto max-w-[42rem]">
              <label htmlFor="blog-title" className="sr-only">
                {t.titleLabel}
              </label>
              <GrowingField
                id="blog-title"
                fieldRef={titleRef}
                value={title}
                maxLength={BLOG_LIMITS.titleMax}
                placeholder={t.titlePlaceholder}
                onChange={(event) => {
                  setTitle(event.target.value.replace(/\n/g, " "));
                  markDirty();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    subtitleRef.current?.focus();
                  }
                }}
                className={`${styles.titleField} font-display text-4xl font-extrabold leading-tight tracking-tight text-balance text-slate-900 sm:text-5xl/tight`}
              />
              <label htmlFor="blog-subtitle" className="sr-only">
                {t.subtitleLabel}
              </label>
              <GrowingField
                id="blog-subtitle"
                fieldRef={subtitleRef}
                value={subtitle}
                maxLength={BLOG_LIMITS.excerptMax}
                placeholder={t.subtitlePlaceholder}
                onChange={(event) => {
                  setSubtitle(event.target.value.replace(/\n/g, " "));
                  markDirty();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    editor?.commands.focus("start");
                  }
                }}
                className={`${styles.subtitleField} mt-4 font-sans text-xl leading-8 text-slate-500 sm:text-2xl/9`}
              />
            </div>

            <div
              ref={setContainer}
              className="relative mt-6"
              onDragOver={(event) => {
                if (event.dataTransfer.types.includes("Files")) setDragOver(true);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOver(false);
              }}
              onDrop={() => setDragOver(false)}
            >
              {editor ? (
                <>
                  <EditorContent editor={editor} />
                  <BlogTextBubble editor={editor} linkRequest={linkRequest} />
                  <BlogInsertMenu editor={editor} container={container} onPickImage={() => fileRef.current?.click()} />
                </>
              ) : (
                <div className="mx-auto h-[40vh] max-w-[42rem] animate-pulse rounded-xl bg-slate-100/70" aria-hidden="true" />
              )}
              {dragOver && (
                <div className="pointer-events-none absolute inset-0 z-10 flex items-start justify-center rounded-2xl border-2 border-dashed border-brand-400 bg-brand-50/60 pt-24 font-sans">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-800 shadow">
                    <ImagePlus className="h-4 w-4" aria-hidden="true" />
                    {text.insert.dropHint}
                  </span>
                </div>
              )}
            </div>

            <p className="mx-auto mt-10 max-w-[42rem] font-sans text-sm tabular-nums text-slate-500 md:hidden">
              {t.words(stats.words)} · {t.reading(stats.minutes)}
            </p>
          </>
        )}
      </main>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label={text.upload.chooseFile}
        onChange={(event) => {
          const files = imageFilesFrom(event.target.files);
          event.target.value = "";
          if (files.length > 0) insertFilesRef.current(files);
          else if (event.target.files?.length) showNotice("error", text.upload.invalidType);
        }}
      />

      <BlogPublishDialog
        open={dialogOpen}
        mode={publishMode}
        title={title}
        excerpt={excerptPreview}
        initial={{ ...settings, slug: settings.slug || slug }}
        firstImage={firstImageSrc(dialogDoc)}
        canUnpublish={canPublish && status === "published"}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmPublish}
        onUnpublish={unpublish}
      />

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 font-sans">
        {notice && (
          <p
            role={notice.kind === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex max-w-md items-start gap-2 rounded-xl px-4 py-3 text-sm shadow-lg ${
              notice.kind === "error" ? "bg-rose-700 text-white" : "bg-slate-900 text-white"
            }`}
          >
            {notice.kind === "error" ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            ) : (
              <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            )}
            <span>{notice.text}</span>
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AlertCircle, ImagePlus, Loader2, X } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { blogWriterText } from "@/lib/i18n/portal/blog-writer";
import { adminText } from "@/lib/i18n/portal/admin";
import {
  BLOG_CATEGORIES,
  BLOG_LIMITS,
  isValidSlug,
  parseTags,
  slugify,
  type BlogCategory,
} from "@/lib/admin/blog-meta";
import { prepareImage, uploadPreparedImage } from "./blog-image-upload";

export type PublishTarget = "published" | "draft";

export interface PublishSettings {
  slug: string;
  category: BlogCategory;
  tags: string[];
  coverImage: string;
}

interface BlogPublishDialogProps {
  open: boolean;
  /** publish: first time live. update: already live. draft: the writer cannot publish. */
  mode: "publish" | "update" | "draft";
  title: string;
  excerpt: string;
  initial: PublishSettings;
  /** Address of the first finished photo in the post, offered as the cover. */
  firstImage: string | null;
  canUnpublish: boolean;
  onClose: () => void;
  /** Saves with these settings. Resolves to an error message, or null when it worked. */
  onConfirm: (settings: PublishSettings, target: PublishTarget) => Promise<string | null>;
  onUnpublish: () => Promise<string | null>;
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:outline-hidden focus:ring-2 focus:ring-brand-500/20";
const focusRing = "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";

/**
 * Last step before a post goes live, like Medium's story preview: cover photo, category, tags and
 * the link address, with a card showing how the post appears in the blog list.
 */
export default function BlogPublishDialog(props: BlogPublishDialogProps) {
  const { open, mode, title, excerpt, initial, firstImage, canUnpublish, onClose, onConfirm, onUnpublish } = props;
  const { locale } = useLocale();
  const text = blogWriterText[locale];
  const t = text.publish;
  const categories = adminText[locale].categories;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const ids = useId();

  const [slug, setSlug] = useState(initial.slug);
  const [category, setCategory] = useState<BlogCategory>(initial.category);
  const [tagsInput, setTagsInput] = useState(initial.tags.join(", "));
  const [coverImage, setCoverImage] = useState(initial.coverImage);
  const [coverBusy, setCoverBusy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setSlug(initial.slug || slugify(title));
      setCategory(initial.category);
      setTagsInput(initial.tags.join(", "));
      setCoverImage(initial.coverImage);
      setError(null);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
    // The form resets each time the dialog opens, not while it is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const uploadCover = async (file: File | undefined) => {
    if (!file) return;
    setCoverBusy(true);
    setError(null);
    const prepared = await prepareImage(file);
    if (typeof prepared === "string") {
      setError(text.upload[prepared]);
    } else {
      const result = await uploadPreparedImage(prepared);
      if ("url" in result) setCoverImage(result.url);
      else setError(result.error ?? text.upload.failed);
    }
    setCoverBusy(false);
  };

  const submit = async (target: PublishTarget) => {
    const tags = parseTags(tagsInput);
    if (target === "published" && (title.trim().length < BLOG_LIMITS.titleMin || title.trim().length > BLOG_LIMITS.titleMax)) {
      setError(t.errTitle);
      return;
    }
    if (tags.length > BLOG_LIMITS.tagsMax || tags.some((tag) => tag.length > BLOG_LIMITS.tagMax)) {
      setError(t.errTags);
      return;
    }
    const finalSlug = slug.trim() || slugify(title);
    if (target === "published" && !isValidSlug(finalSlug)) {
      setError(t.errSlug);
      return;
    }
    setBusy(true);
    setError(null);
    const problem = await onConfirm({ slug: isValidSlug(finalSlug) ? finalSlug : "", category, tags, coverImage }, target);
    setBusy(false);
    if (problem) setError(problem);
  };

  const unpublish = async () => {
    setBusy(true);
    setError(null);
    const problem = await onUnpublish();
    setBusy(false);
    if (problem) setError(problem);
  };

  const confirmLabel = mode === "publish" ? t.confirmPublish : mode === "update" ? t.confirmUpdate : t.confirmDraft;
  const target: PublishTarget = mode === "draft" ? "draft" : "published";

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`${ids}-heading`}
      onClose={onClose}
      onCancel={(event) => {
        if (busy) event.preventDefault();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-3xl rounded-2xl border border-slate-200 bg-white p-0 font-sans text-slate-900 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur-xs"
    >
      <form
        method="dialog"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(target);
        }}
        className="flex max-h-[calc(100dvh-2rem)] flex-col"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <h2 id={`${ids}-heading`} className="font-display text-lg font-bold">
            {mode === "draft" ? t.titleDraft : t.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={t.close}
            className={`rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 ${focusRing}`}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="grid flex-1 gap-6 overflow-y-auto px-5 py-5 md:grid-cols-2">
          <section aria-labelledby={`${ids}-preview`} className="space-y-3">
            <h3 id={`${ids}-preview`} className="text-sm font-semibold text-slate-700">
              {t.previewHeading}
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="relative aspect-video bg-linear-to-br/srgb from-brand-100 via-accent-50 to-emerald-50">
                {coverImage && <img src={coverImage} alt={t.coverAlt} className="h-full w-full object-cover" />}
                {coverBusy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60" role="status">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-700" aria-hidden="true" />
                    <span className="sr-only">{text.image.uploading}</span>
                  </div>
                )}
              </div>
              <div className="space-y-1 p-4">
                <p className="text-xs font-semibold text-brand-700">{categories[category] ?? category}</p>
                <p className="line-clamp-2 font-display text-base font-bold text-slate-900">{title || text.list.untitled}</p>
                {excerpt && <p className="line-clamp-2 text-sm text-slate-600">{excerpt}</p>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={coverBusy}
                className={`inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60 ${focusRing}`}
              >
                <ImagePlus className="h-4 w-4 text-brand-600" aria-hidden="true" />
                {coverImage ? t.coverChange : t.coverUpload}
              </button>
              {firstImage && firstImage !== coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage(firstImage)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 ${focusRing}`}
                >
                  {t.coverFromBody}
                </button>
              )}
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className={`rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 ${focusRing}`}
                >
                  {t.coverRemove}
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                  void uploadCover(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </div>
            <p className="text-xs text-slate-500">{t.coverHint}</p>
          </section>

          <section className="space-y-4">
            <div>
              <label htmlFor={`${ids}-category`} className="mb-1.5 block text-sm font-medium text-slate-700">
                {t.category}
              </label>
              <select
                id={`${ids}-category`}
                value={category}
                onChange={(event) => setCategory(event.target.value as BlogCategory)}
                className={inputClass}
              >
                {BLOG_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {categories[value] ?? value}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={`${ids}-tags`} className="mb-1.5 block text-sm font-medium text-slate-700">
                {t.tags}
              </label>
              <input
                id={`${ids}-tags`}
                type="text"
                value={tagsInput}
                autoComplete="off"
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder={t.tagsPlaceholder}
                aria-describedby={`${ids}-tags-hint`}
                className={inputClass}
              />
              <p id={`${ids}-tags-hint`} className="mt-1 text-xs text-slate-500">
                {t.tagsHint}
              </p>
            </div>

            {mode !== "draft" && (
              <div>
                <label htmlFor={`${ids}-slug`} className="mb-1.5 block text-sm font-medium text-slate-700">
                  {t.slug}
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-500/20">
                  <span className="border-r border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-500" aria-hidden="true">
                    /blog/
                  </span>
                  <input
                    id={`${ids}-slug`}
                    type="text"
                    value={slug}
                    maxLength={BLOG_LIMITS.slugMax}
                    autoComplete="off"
                    spellCheck={false}
                    aria-describedby={`${ids}-slug-hint`}
                    onChange={(event) => setSlug(event.target.value.toLowerCase())}
                    className="w-full min-w-0 px-3 py-2.5 font-mono text-sm text-slate-800 focus:outline-hidden"
                  />
                </div>
                <p id={`${ids}-slug-hint`} className="mt-1 text-xs text-slate-500">
                  {mode === "update" ? t.slugLockedHint : t.slugHint}
                </p>
              </div>
            )}

            {mode === "draft" && (
              <p className="rounded-xl border border-accent-200 bg-accent-50 px-3.5 py-2.5 text-sm text-accent-800">
                {t.noPublishRights}
              </p>
            )}
          </section>
        </div>

        <div className="space-y-3 border-t border-slate-200 px-5 py-4">
          {error && (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {canUnpublish ? (
              <button
                type="button"
                onClick={() => void unpublish()}
                disabled={busy}
                title={text.editor.unpublishConfirm}
                className={`rounded-lg px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60 ${focusRing}`}
              >
                {text.editor.unpublish}
              </button>
            ) : (
              <span />
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 ${focusRing}`}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={busy || coverBusy}
                className={`inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60 ${focusRing}`}
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </form>
    </dialog>
  );
}

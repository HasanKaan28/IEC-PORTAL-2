"use client";

import React, { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Bold,
  Code,
  Columns2,
  Edit3,
  Eye,
  FileCode,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Quote,
  Save,
} from "lucide-react";
import MarkdownRenderer from "@/components/public/MarkdownRenderer";
import type { BlogPostItem } from "@/lib/blog/blog-data";
import { saveBlogPostAction } from "@/lib/blog/blog-actions";
import {
  BLOG_CATEGORIES,
  BLOG_LIMITS,
  countWords,
  isValidCoverImage,
  isValidSlug,
  parseTags,
  readingMinutes,
  slugify,
  type BlogCategory,
} from "@/lib/admin/blog-meta";
import { useLocale } from "@/lib/i18n/locale-context";
import { adminText } from "@/lib/i18n/portal/admin";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2";
const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20";

interface BlogEditorStudioProps {
  initialPost?: BlogPostItem;
  /** Whether the current user has blog.publish. The server enforces this regardless. */
  canPublish?: boolean;
}

type ViewMode = "split" | "edit" | "preview";

export default function BlogEditorStudio({ initialPost, canPublish = false }: BlogEditorStudioProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const text = adminText[locale];
  const t = text.editor;
  const [isPending, startTransition] = useTransition();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [autoSlug, setAutoSlug] = useState(!initialPost);
  const [category, setCategory] = useState<BlogCategory>(
    initialPost && (BLOG_CATEGORIES as readonly string[]).includes(initialPost.category)
      ? (initialPost.category as BlogCategory)
      : "Genel"
  );
  const [tagsInput, setTagsInput] = useState(initialPost?.tags?.join(", ") ?? "");
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage ?? "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [status, setStatus] = useState<"published" | "draft">(
    canPublish && initialPost?.status === "published" ? "published" : "draft"
  );
  const [view, setView] = useState<ViewMode>("split");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const wordCount = countWords(content);
  const minutes = readingMinutes(content);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (autoSlug) setSlug(slugify(value));
  };

  const insertFormatting = (prefix: string, suffix = "", sample = t.sampleText) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || sample;
    setContent(content.substring(0, start) + prefix + selected + suffix + content.substring(end));
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    });
  };

  const validate = (): string | null => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length < BLOG_LIMITS.titleMin || trimmedTitle.length > BLOG_LIMITS.titleMax) return t.errTitle;
    const finalSlug = slug.trim() || slugify(title);
    if (!isValidSlug(finalSlug)) return t.errSlug;
    if (content.trim().length < BLOG_LIMITS.contentMin) return t.errContent;
    const cover = coverImage.trim();
    if (cover && !isValidCoverImage(cover)) return t.errCover;
    const tags = parseTags(tagsInput);
    if (tags.length > BLOG_LIMITS.tagsMax || tags.some((tag) => tag.length > BLOG_LIMITS.tagMax)) return t.errTags;
    return null;
  };

  const handleSave = () => {
    setErrorMsg(null);
    const problem = validate();
    if (problem) {
      setErrorMsg(problem);
      return;
    }

    startTransition(async () => {
      const result = await saveBlogPostAction({
        id: initialPost?.id,
        slug: slug.trim() || slugify(title),
        title: title.trim(),
        excerpt: excerpt.trim(),
        content,
        category,
        tags: parseTags(tagsInput),
        coverImage: coverImage.trim() || undefined,
        status: canPublish ? status : "draft",
      });

      if (!result.success) {
        setErrorMsg(result.error || t.saveFailed);
        return;
      }
      router.push("/portal/admin/blog");
      router.refresh();
    });
  };

  const tools: { label: string; icon: React.ComponentType<{ className?: string }>; run: () => void }[] = [
    { label: t.tools.bold, icon: Bold, run: () => insertFormatting("**", "**") },
    { label: t.tools.italic, icon: Italic, run: () => insertFormatting("*", "*") },
    { label: t.tools.h2, icon: Heading2, run: () => insertFormatting("## ") },
    { label: t.tools.h3, icon: Heading3, run: () => insertFormatting("### ") },
    { label: t.tools.inlineCode, icon: Code, run: () => insertFormatting("`", "`") },
    { label: t.tools.codeBlock, icon: FileCode, run: () => insertFormatting("```\n", "\n```", t.sampleCode) },
    { label: t.tools.quote, icon: Quote, run: () => insertFormatting("> ") },
    { label: t.tools.list, icon: List, run: () => insertFormatting("- ") },
    { label: t.tools.orderedList, icon: ListOrdered, run: () => insertFormatting("1. ") },
    { label: t.tools.link, icon: LinkIcon, run: () => insertFormatting("[", "](https://)", t.sampleLinkText) },
  ];

  const views: { key: ViewMode; label: string; icon: React.ComponentType<{ className?: string }>; className?: string }[] = [
    { key: "edit", label: t.viewEdit, icon: Edit3 },
    { key: "preview", label: t.viewPreview, icon: Eye },
    { key: "split", label: t.viewSplit, icon: Columns2, className: "hidden md:inline-flex" },
  ];

  const showEditor = view === "split" || view === "edit";
  const showPreview = view === "split" || view === "preview";

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 lg:flex-row lg:items-center">
        <div className="flex items-center gap-3">
          <Link
            href="/portal/admin/blog"
            aria-label={t.back}
            title={t.back}
            className={`rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 ${focusRing}`}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {initialPost ? t.titleEdit : t.titleNew}
            </h2>
            <p className="text-xs text-slate-500">{t.stats(minutes, wordCount)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div role="radiogroup" aria-label={t.statusLabel} className="flex items-center rounded-xl bg-slate-100 p-1 text-sm font-medium">
            <button
              type="button"
              role="radio"
              aria-checked={status === "draft"}
              onClick={() => setStatus("draft")}
              className={`rounded-lg px-3 py-1.5 transition-colors ${focusRing} ${
                status === "draft" ? "bg-white font-semibold text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.draft}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={status === "published"}
              onClick={() => setStatus("published")}
              disabled={!canPublish}
              className={`rounded-lg px-3 py-1.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${
                status === "published" ? "bg-emerald-600 font-semibold text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {t.published}
            </button>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className={`inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60 ${focusRing}`}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{isPending ? t.saving : t.save}</span>
          </button>
        </div>
      </div>

      {!canPublish && (
        <p className="rounded-xl border border-accent-200 bg-accent-50 px-4 py-3 text-sm text-accent-800">{t.publishLocked}</p>
      )}

      {errorMsg && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Meta */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="post-title" className="mb-1.5 block text-sm font-medium text-slate-700">
              {t.fieldTitle} <span aria-hidden="true" className="text-rose-600">*</span>
            </label>
            <input
              id="post-title"
              type="text"
              required
              maxLength={BLOG_LIMITS.titleMax}
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={t.titlePlaceholder}
              className={inputClass}
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <label htmlFor="post-slug" className="text-sm font-medium text-slate-700">
                {t.fieldSlug} <span aria-hidden="true" className="text-rose-600">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!autoSlug) setSlug(slugify(title));
                  setAutoSlug(!autoSlug);
                }}
                className={`rounded-md text-xs font-medium text-brand-600 hover:underline ${focusRing}`}
              >
                {autoSlug ? t.slugToManual : t.slugToAuto}
              </button>
            </div>
            <div className="flex items-center overflow-hidden rounded-xl border border-slate-300 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-500/20">
              <span className="border-r border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-xs text-slate-500" aria-hidden="true">
                /blog/
              </span>
              <input
                id="post-slug"
                type="text"
                value={slug}
                readOnly={autoSlug}
                maxLength={BLOG_LIMITS.slugMax}
                aria-describedby="post-slug-hint"
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                className="w-full px-3 py-2.5 font-mono text-sm text-slate-800 read-only:bg-slate-50 focus:outline-none"
              />
            </div>
            <p id="post-slug-hint" className="mt-1 text-xs text-slate-500">
              {t.slugHint}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="post-category" className="mb-1.5 block text-sm font-medium text-slate-700">
              {t.fieldCategory}
            </label>
            <select
              id="post-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as BlogCategory)}
              className={inputClass}
            >
              {BLOG_CATEGORIES.map((value) => (
                <option key={value} value={value}>
                  {text.categories[value] ?? value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="post-tags" className="mb-1.5 block text-sm font-medium text-slate-700">
              {t.fieldTags}
            </label>
            <input
              id="post-tags"
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t.tagsPlaceholder}
              aria-describedby="post-tags-hint"
              className={inputClass}
            />
            <p id="post-tags-hint" className="mt-1 text-xs text-slate-500">
              {t.tagsHint}
            </p>
          </div>

          <div>
            <label htmlFor="post-cover" className="mb-1.5 block text-sm font-medium text-slate-700">
              {t.fieldCover}
            </label>
            <input
              id="post-cover"
              type="url"
              inputMode="url"
              maxLength={BLOG_LIMITS.coverMax}
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder={t.coverPlaceholder}
              aria-describedby="post-cover-hint"
              className={inputClass}
            />
            <p id="post-cover-hint" className="mt-1 text-xs text-slate-500">
              {t.coverHint}
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="post-excerpt" className="mb-1.5 block text-sm font-medium text-slate-700">
            {t.fieldExcerpt}
          </label>
          <textarea
            id="post-excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            maxLength={BLOG_LIMITS.excerptMax}
            placeholder={t.excerptPlaceholder}
            aria-describedby="post-excerpt-count"
            className={`${inputClass} resize-none`}
          />
          <p id="post-excerpt-count" className="mt-1 text-right text-xs text-slate-500">
            {t.excerptCount(excerpt.length, BLOG_LIMITS.excerptMax)}
          </p>
        </div>
      </div>

      {/* Editor and preview */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 p-2.5">
          <div role="toolbar" aria-label={t.toolbarLabel} className="flex flex-wrap items-center gap-1">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <React.Fragment key={tool.label}>
                  {(index === 2 || index === 4) && <span className="mx-1 h-4 w-px bg-slate-300" aria-hidden="true" />}
                  <button
                    type="button"
                    onClick={tool.run}
                    disabled={!showEditor}
                    aria-label={tool.label}
                    title={tool.label}
                    className={`rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-40 ${focusRing}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          <div role="group" aria-label={t.viewLabel} className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-sm">
            {views.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.key}
                  type="button"
                  aria-pressed={view === option.key}
                  onClick={() => setView(option.key)}
                  className={`${option.className ?? "inline-flex"} items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors ${focusRing} ${
                    view === option.key ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={`grid min-h-[500px] grid-cols-1 divide-y divide-slate-200 ${view === "split" ? "md:grid-cols-2 md:divide-x md:divide-y-0" : ""}`}>
          {showEditor && (
            <div className="flex flex-col p-4">
              <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                <label htmlFor="markdown-editor-area" className="font-medium text-slate-700">
                  {t.contentLabel}
                </label>
                <span>{t.words(wordCount)}</span>
              </div>
              <textarea
                id="markdown-editor-area"
                ref={textareaRef}
                value={content}
                maxLength={BLOG_LIMITS.contentMax}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t.contentPlaceholder}
                className="min-h-[460px] w-full flex-1 resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-sm leading-relaxed text-slate-900 placeholder-slate-400 focus:border-brand-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          )}

          {showPreview && (
            <section aria-label={t.previewLabel} className="max-h-[640px] overflow-y-auto bg-ink-950 p-6">
              <p className="mb-4 border-b border-slate-800 pb-2 text-xs font-medium text-slate-400">{t.previewLabel}</p>
              {content.trim() ? (
                <MarkdownRenderer content={content} />
              ) : (
                <p className="text-sm text-slate-400">{t.previewEmpty}</p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

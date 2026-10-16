"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Eye,
  Edit3,
  ArrowLeft,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Code,
  FileCode,
  Quote,
  List,
  ListOrdered,
  Link as LinkIcon,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import MarkdownRenderer from "@/components/public/MarkdownRenderer";
import { BlogPostItem } from "@/lib/blog/blog-data";
import { saveBlogPostAction } from "@/lib/blog/blog-actions";

interface BlogEditorStudioProps {
  initialPost?: BlogPostItem;
}

export default function BlogEditorStudio({
  initialPost,
}: BlogEditorStudioProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initialPost?.title || "");
  const [slug, setSlug] = useState(initialPost?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!initialPost);
  const [category, setCategory] = useState<BlogPostItem["category"]>(
    initialPost?.category || "Gömülü Sistemler"
  );
  const [tagsInput, setTagsInput] = useState(
    initialPost?.tags?.join(", ") || "ESP32, Donanım, IoT"
  );
  const [coverImage, setCoverImage] = useState(
    initialPost?.coverImage ||
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80"
  );
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || "");
  const [content, setContent] = useState(
    initialPost?.content ||
      `# Makale Başlığı\n\nBuraya teknik makalenizin giriş paragrafını yazabilirsiniz.\n\n## Mimari ve Bileşenler\n\nProjede kullanılan temel donanım veya yazılım mimarisi:\n- Çekirdek 1: Donanım SPI kontrolü\n- Çekirdek 2: Telemetri ve ağ iletişimi\n\n\`\`\`cpp\n// Örnek kod bloğu\nvoid setup() {\n  Serial.begin(115200);\n}\n\`\`\`\n\n> "Gömülü sistemlerde paralel iş parçacıkları kilitlenmeleri önler."\n`
  );
  const [status, setStatus] = useState<"published" | "draft">(
    initialPost?.status === "draft" ? "draft" : "published"
  );
  const [activeTab, setActiveTab] = useState<"split" | "edit" | "preview">(
    "split"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-generate slug on title change if enabled
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  // Word count & Reading time
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = document.getElementById(
      "markdown-editor-area"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || "metin"}${suffix}`;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected ? selected.length : 5)
      );
    }, 50);
  };

  const handleSave = () => {
    setErrorMsg(null);
    if (!title.trim()) {
      setErrorMsg("Lütfen bir makale başlığı girin.");
      return;
    }
    if (!content.trim() || content.trim().length < 20) {
      setErrorMsg("İçerik en az 20 karakter olmalıdır.");
      return;
    }

    startTransition(async () => {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await saveBlogPostAction({
        id: initialPost?.id,
        slug: slug.trim() || slugify(title),
        title,
        excerpt,
        content,
        category,
        tags,
        coverImage,
        status,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Makale kaydedilemedi.");
      } else {
        router.push("/portal/admin/blog");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/portal/admin/blog"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              {initialPost ? "Makaleyi Düzenle" : "Yeni Teknik Yazı Stüdyosu"}
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Tahmini Okuma Süresi: {readingTime} dk ({wordCount} kelime)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setStatus("draft")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                status === "draft"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Taslak
            </button>
            <button
              type="button"
              onClick={() => setStatus("published")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                status === "published"
                  ? "bg-emerald-600 text-white shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Yayında
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition-all shadow-brand-600/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isPending ? "Kaydediliyor..." : "Kaydet & Tamamla"}</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Meta Properties Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Makale Başlığı *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Örn: ESP32 ve RFID ile Otonom Güç İstasyonu"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-700">
                URL Slug *
              </label>
              <button
                type="button"
                onClick={() => setAutoSlug(!autoSlug)}
                className="text-[10px] text-brand-600 font-mono hover:underline"
              >
                {autoSlug ? "Manuel Düzenle" : "Otomatik Oluştur"}
              </button>
            </div>
            <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-600">
              <span className="bg-slate-50 px-3 py-2.5 text-xs text-slate-400 font-mono border-r border-slate-200">
                /blog/
              </span>
              <input
                type="text"
                value={slug}
                disabled={autoSlug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none disabled:bg-slate-50"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as BlogPostItem["category"])
              }
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-600"
            >
              <option value="Gömülü Sistemler">Gömülü Sistemler</option>
              <option value="Mühendislik Kültürü">Mühendislik Kültürü</option>
              <option value="Yapay Zekâ">Yapay Zekâ</option>
              <option value="Etkinlikler">Etkinlikler</option>
              <option value="Genel">Genel</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Etiketler (Virgülle ayırın)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ESP32, C++, Hardware"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Kapak Görseli URL
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-600"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1.5">
            Kısa Özet (Excerpt / Meta Description)
          </label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Arama motorları ve sosyal kartlar için 1-2 cümlelik vurucu teknik özet..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-brand-600 resize-none"
          />
        </div>
      </div>

      {/* Editor & Preview Header Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-wrap items-center justify-between p-2.5 border-b border-slate-200 bg-slate-50 gap-2">
          {/* Formatting buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => insertFormatting("**", "**")}
              title="Kalın"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs transition-colors"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("*", "*")}
              title="İtalik"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs transition-colors"
            >
              <Italic className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting("## ")}
              title="Başlık 2"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs transition-colors"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("### ")}
              title="Başlık 3"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs transition-colors"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <div className="h-4 w-px bg-slate-300 mx-1" />
            <button
              type="button"
              onClick={() => insertFormatting("`", "`")}
              title="Satır içi Kod"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs transition-colors"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                insertFormatting("```cpp\n// Kodunuz buraya\n", "\n```")
              }
              title="Kod Bloğu"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs transition-colors"
            >
              <FileCode className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("> ")}
              title="Alıntı"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs transition-colors"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("- ")}
              title="Liste"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs transition-colors"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("1. ")}
              title="Numaralı Liste"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs transition-colors"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting("[bağlantı metni](", ")")}
              title="Link Ekle"
              className="p-1.5 rounded hover:bg-slate-200 text-slate-700 text-xs transition-colors"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === "edit"
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-1">
                <Edit3 className="w-3.5 h-3.5" /> Editör
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === "preview"
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Canlı Önizleme
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("split")}
              className={`hidden md:block px-2.5 py-1 rounded transition-colors ${
                activeTab === "split"
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Yan Yana (Split)
            </button>
          </div>
        </div>

        {/* Dual-Pane Studio Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 min-h-[500px]">
          {/* Edit Pane */}
          {(activeTab === "split" || activeTab === "edit") && (
            <div className="p-4 flex flex-col bg-ink-900">
              <div className="text-[11px] font-mono text-purple-400 mb-2 flex items-center justify-between">
                <span>MARKDOWN KAYNAK KODU</span>
                <span>{wordCount} kelime</span>
              </div>
              <textarea
                id="markdown-editor-area"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Markdown içeriğinizi buraya yazın..."
                className="w-full flex-1 min-h-[460px] bg-transparent text-slate-100 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none resize-none selection:bg-purple-900"
              />
            </div>
          )}

          {/* Preview Pane */}
          {(activeTab === "split" || activeTab === "preview") && (
            <div className="p-6 overflow-y-auto max-h-[600px] bg-ink-950">
              <div className="text-[11px] font-mono text-slate-400 mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                <span>CANLI ÖNİZLEME (DARK CINEMATIC)</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Render Edildi
                </span>
              </div>
              <MarkdownRenderer content={content} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function slugify(text: string): string {
  const trMap: Record<string, string> = {
    ç: "c",
    ğ: "g",
    ı: "i",
    ö: "o",
    ş: "s",
    ü: "u",
    Ç: "c",
    Ğ: "g",
    İ: "i",
    Ö: "o",
    Ş: "s",
    Ü: "u",
  };
  return text
    .split("")
    .map((char) => trMap[char] || char)
    .join("")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

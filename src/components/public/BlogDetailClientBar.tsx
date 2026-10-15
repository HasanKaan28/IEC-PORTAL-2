"use client";

import React, { useState, useEffect } from "react";
import {
  Heart,
  Share2,
  Copy,
  Check,
  MessageCircle,
  Twitter,
  Linkedin,
} from "lucide-react";
import { likeBlogPostAction } from "@/lib/blog/blog-actions";

interface BlogDetailClientBarProps {
  slug: string;
  title: string;
  initialLikes: number;
}

export default function BlogDetailClientBar({
  slug,
  title,
  initialLikes,
}: BlogDetailClientBarProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll for reading progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = async () => {
    if (hasLiked) return;
    setHasLiked(true);
    setLikes((prev) => prev + 1);
    await likeBlogPostAction(slug);
  };

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${title} - IUS Engineering Club: ${currentUrl}`
  )}`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(currentUrl)}&via=IUS_Club`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    currentUrl
  )}`;

  return (
    <>
      {/* 1. Top Viewport Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-900/50">
        <div
          className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 transition-all duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Interactive Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#090e1c]/90 border border-slate-800/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={handleLike}
            disabled={hasLiked}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              hasLiked
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-purple-500/40"
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                hasLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
              }`}
            />
            <span>{hasLiked ? "Beğendiniz" : "Yazıyı Beğen"}</span>
            <span className="font-mono ml-1 px-1.5 py-0.2 rounded bg-black/40 text-[11px]">
              {likes}
            </span>
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 hidden sm:inline">
            Paylaş:
          </span>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="WhatsApp ile Paylaş"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-400 hover:text-emerald-400 text-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
          </a>

          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="X (Twitter) ile Paylaş"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-slate-400 hover:text-sky-400 text-xs transition-colors"
          >
            <Twitter className="w-4 h-4" />
          </a>

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="LinkedIn ile Paylaş"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-slate-400 hover:text-blue-400 text-xs transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </a>

          <button
            onClick={handleCopyLink}
            title="Bağlantıyı Kopyala"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white text-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Kopyalandı</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Kopyala</span>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Copy, Check, MessageCircle, Twitter, Linkedin } from "lucide-react";
import { likeBlogPostAction } from "@/lib/blog/blog-actions";
import { useLocale } from "@/lib/i18n/locale-context";
import { blogSignInHref, blogText } from "@/lib/i18n/public/blog";

interface BlogDetailClientBarProps {
  slug: string;
  title: string;
  initialLikes: number;
  /** Liking needs a session; signed-out visitors get a sign-in prompt instead of a request. */
  isSignedIn: boolean;
}

type LikeResult = Awaited<ReturnType<typeof likeBlogPostAction>>;
type LikeNotice = { kind: "error"; text: string } | { kind: "signIn" };

type CopyState = "idle" | "copied" | "failed";

const FOCUS_RING =
  "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

const SHARE_LINK_CLASS = `p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-xs transition-colors ${FOCUS_RING}`;

export default function BlogDetailClientBar({
  slug,
  title,
  initialLikes,
  isSignedIn,
}: BlogDetailClientBarProps) {
  const { locale } = useLocale();
  const t = blogText[locale].bar;
  const authText = blogText[locale].auth;
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeNotice, setLikeNotice] = useState<LikeNotice | null>(null);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const [scrollProgress, setScrollProgress] = useState(0);
  // Read after mount so the server and client render the same share links.
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(window.location.href);

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLike = async () => {
    if (!isSignedIn) {
      setLikeNotice({ kind: "signIn" });
      return;
    }
    if (hasLiked) return;
    setLikeNotice(null);
    setHasLiked(true);
    setLikes((prev) => prev + 1);

    let res: LikeResult;
    try {
      res = await likeBlogPostAction(slug);
    } catch {
      res = { success: false, error: t.likeFailed };
    }

    if (res.success) {
      // A repeat like is ignored on the server, so trust its count over the optimistic one.
      setLikes(res.likesCount);
    } else {
      setHasLiked(false);
      setLikes((prev) => Math.max(0, prev - 1));
      setLikeNotice({ kind: "error", text: res.error || t.likeFailed });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl || window.location.href);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2500);
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
      {/* Reading progress bar (decorative) */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-slate-50" aria-hidden="true">
        <div
          className="h-full bg-linear-to-r/srgb from-brand-600 via-brand-500 to-accent-400 transition-[width] duration-150 ease-out motion-reduce:transition-none"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div
        role="group"
        aria-label={t.actionsLabel}
        className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/70 border border-slate-200 backdrop-blur-md shadow-soft"
      >
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={handleLike}
            disabled={hasLiked}
            aria-pressed={hasLiked}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${FOCUS_RING} ${
              hasLiked
                ? "bg-rose-500/20 text-rose-700 border border-rose-500/40"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 hover:border-brand-500/40"
            }`}
          >
            <Heart
              aria-hidden="true"
              className={`w-4 h-4 transition-transform motion-reduce:transition-none ${
                hasLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
              }`}
            />
            <span>{hasLiked ? t.liked : t.like}</span>
            <span className="font-mono tabular-nums ml-1 px-1.5 rounded bg-slate-900/30 text-xs">
              <span aria-hidden="true">{likes}</span>
              <span className="sr-only">{t.likeCount(likes)}</span>
            </span>
          </button>
          {likeNotice?.kind === "error" && (
            <p role="alert" className="text-xs text-rose-600">
              {likeNotice.text}
            </p>
          )}
          {likeNotice?.kind === "signIn" && (
            <p role="alert" className="text-xs text-slate-600">
              {authText.signInToLike}{" "}
              <Link
                href={blogSignInHref(`/blog/${slug}`)}
                className={`font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-800 rounded ${FOCUS_RING}`}
              >
                {authText.signIn}
              </Link>
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-500 hidden sm:inline" aria-hidden="true">
            {t.share}
          </span>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.shareWhatsApp} ${t.newTab}`}
            title={t.shareWhatsApp}
            className={`${SHARE_LINK_CLASS} hover:border-emerald-500/50 hover:text-emerald-600`}
          >
            <MessageCircle className="w-4 h-4" aria-hidden="true" />
          </a>

          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.shareX} ${t.newTab}`}
            title={t.shareX}
            className={`${SHARE_LINK_CLASS} hover:border-brand-500/50 hover:text-brand-700`}
          >
            <Twitter className="w-4 h-4" aria-hidden="true" />
          </a>

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.shareLinkedIn} ${t.newTab}`}
            title={t.shareLinkedIn}
            className={`${SHARE_LINK_CLASS} hover:border-brand-500/50 hover:text-brand-700`}
          >
            <Linkedin className="w-4 h-4" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={handleCopyLink}
            title={t.copyLink}
            aria-label={t.copyLink}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-brand-500/50 text-slate-600 hover:text-slate-900 text-xs transition-colors ${FOCUS_RING}`}
          >
            {copyState === "copied" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span className="text-emerald-600">{t.copied}</span>
              </>
            ) : copyState === "failed" ? (
              <span className="text-rose-600">{t.copyFailed}</span>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                <span>{t.copy}</span>
              </>
            )}
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {copyState === "copied" ? t.linkCopied : copyState === "failed" ? t.copyFailed : ""}
          </span>
        </div>
      </div>
    </>
  );
}

"use client";

import React, { useState } from "react";
import { getInitials, safeHttpUrl } from "@/lib/messages/utils";

const SIZES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-20 h-20 text-2xl",
} as const;

const PALETTE = [
  "bg-brand-100 text-brand-800",
  "bg-accent-100 text-accent-800",
  "bg-emerald-100 text-emerald-800",
  "bg-slate-200 text-slate-700",
] as const;

function paletteFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

interface MemberAvatarProps {
  name: string;
  src?: string | null;
  size?: keyof typeof SIZES;
  locale?: "tr" | "en" | "bs";
  className?: string;
}

/** Member photo when they uploaded one, otherwise their initials. Decorative: the name is shown next to it. */
export default function MemberAvatar({ name, src, size = "md", locale = "tr", className = "" }: MemberAvatarProps) {
  const [failed, setFailed] = useState(false);
  const url = safeHttpUrl(src);
  const showImage = Boolean(url) && !failed;

  return (
    <span
      aria-hidden="true"
      className={`${SIZES[size]} ${showImage ? "bg-slate-100" : paletteFor(name)} relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold select-none ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url!}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        getInitials(name, locale)
      )}
    </span>
  );
}

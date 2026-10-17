"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLocale } from "@/lib/i18n/locale-context";

interface ProjectGalleryProps {
  images: string[];
  alt: string;
  sizes: string;
  /** Aspect and sizing classes for the frame, e.g. "aspect-video". */
  className?: string;
  priority?: boolean;
}

/**
 * Photo frame with one dot per photo. Dots appear on hover or keyboard focus (always on touch screens);
 * hovering, focusing or clicking a dot shows that photo.
 */
export default function ProjectGallery({ images, alt, sizes, className = "", priority = false }: ProjectGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { t } = useLocale();
  const hasMany = images.length > 1;

  return (
    <div className={`group/gallery relative w-full overflow-hidden bg-slate-50 ${className}`}>
      {images.map((src, index) => (
        <Image
          key={src}
          src={src}
          alt={index === activeIndex ? `${alt} (${index + 1}/${images.length})` : ""}
          aria-hidden={index === activeIndex ? undefined : true}
          fill
          sizes={sizes}
          priority={priority && index === 0}
          className={`object-cover transition-opacity duration-500 ${index === activeIndex ? "opacity-100" : "opacity-0"}`}
        />
      ))}

      {hasMany && (
        <div
          role="group"
          aria-label={t.projects.photos}
          className="absolute inset-x-0 bottom-3 flex justify-center gap-1 opacity-0 transition-opacity duration-200 group-hover/gallery:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100"
        >
          {images.map((src, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setActiveIndex(index)}
                onMouseEnter={() => setActiveIndex(index)}
                onFocus={() => setActiveIndex(index)}
                aria-label={`${t.projects.photo} ${index + 1}/${images.length}`}
                aria-pressed={isActive}
                className="grid h-6 w-6 place-items-center rounded-full"
              >
                <span
                  className={`block h-2.5 w-2.5 rounded-full border border-slate-200 shadow transition-colors ${
                    isActive ? "bg-white" : "bg-slate-900/30 hover:bg-white/70"
                  }`}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

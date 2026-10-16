import React from "react";
import Image from "next/image";

interface ClubLogoProps {
  /** Rendered width and height in CSS pixels. */
  size: number;
  className?: string;
  priority?: boolean;
  /** Pass an empty string when the logo sits next to visible club name text. */
  alt?: string;
}

/** The official IUS Engineering Club seal (public/brand). */
export default function ClubLogo({ size, className = "", priority = false, alt = "IUS Engineering Club logosu" }: ClubLogoProps) {
  const src = size > 64 ? "/brand/iec-logo-256.png" : "/brand/iec-logo-128.png";
  return (
    <Image
      src={src}
      alt={alt}
      width={size}
      height={size}
      priority={priority}
      className={`shrink-0 rounded-full ${className}`}
    />
  );
}

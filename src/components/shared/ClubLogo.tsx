import React from "react";
import Image from "next/image";

interface ClubLogoProps {
  /** Rendered width and height in CSS pixels. */
  size: number;
  /** "white" for dark or brand-coloured surfaces, "color" (navy seal on white) for light surfaces. */
  variant?: "white" | "color";
  className?: string;
  priority?: boolean;
  /** Pass an empty string when the logo sits next to visible club name text. */
  alt?: string;
}

/** The official IUS Engineering Club seal (assets in public/brand). */
export default function ClubLogo({
  size,
  variant = "white",
  className = "",
  priority = false,
  alt = "IUS Engineering Club logo",
}: ClubLogoProps) {
  const resolution = size > 64 ? 256 : 128;
  const src = variant === "white" ? `/brand/iec-logo-white-${resolution}.png` : `/brand/iec-logo-${resolution}.png`;
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

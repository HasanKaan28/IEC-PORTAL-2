import React from "react";
import Image from "next/image";

interface ClubLogoProps {
  /** Rendered width and height in CSS pixels. */
  size: number;
  /**
   * "badge" (default): the white seal on a red-violet disc, for the light site.
   * "white": the bare white seal, for brand-coloured surfaces.
   * "color": the original navy seal, for printed-style documents such as certificates.
   */
  variant?: "badge" | "white" | "color";
  className?: string;
  priority?: boolean;
  /** Pass an empty string when the logo sits next to visible club name text. */
  alt?: string;
}

/** The official IUS Engineering Club seal (assets in public/brand). */
export default function ClubLogo({
  size,
  variant = "badge",
  className = "",
  priority = false,
  alt = "IUS Engineering Club logo",
}: ClubLogoProps) {
  if (variant === "badge") {
    // The seal keeps a thin margin inside the disc so its outer ring stays visible.
    const sealSize = Math.round(size * 0.84);
    const resolution = sealSize > 64 ? 256 : 128;
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className={`inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 shadow-glow ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={`/brand/iec-logo-white-${resolution}.png`}
          alt=""
          width={sealSize}
          height={sealSize}
          priority={priority}
          className="rounded-full"
        />
      </span>
    );
  }

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

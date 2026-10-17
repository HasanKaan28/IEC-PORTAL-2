/** Small pure helpers shared by the messages, notifications and profile code (server and client). */

import { INTL_LOCALE } from "@/lib/i18n/format";
import type { SupportedLocale } from "@/lib/i18n/translations";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MESSAGE_MAX_LENGTH = 2000;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/** Returns the URL only when it is an absolute http(s) link, so stored values can't become javascript: hrefs. */
export function safeHttpUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Notification links must stay inside the site (no protocol-relative or external redirects). */
export function safeInternalLink(value: string | null | undefined, fallback = "/portal"): string {
  if (!value) return fallback;
  const link = value.trim();
  if (!link.startsWith("/") || link.startsWith("//") || link.startsWith("/\\")) return fallback;
  return link;
}

/** Accepts #rgb / #rrggbb / #rrggbbaa only. */
export function safeHexColor(value: string | null | undefined, fallback = "#1f5a94"): string {
  return value && /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value) ? value : fallback;
}

/** Up to two initials from the first and last word of a name. */
export function getInitials(name: string, locale: SupportedLocale = "tr"): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  const first = words[0].charAt(0);
  const last = words.length > 1 ? words[words.length - 1].charAt(0) : "";
  return (first + last).toLocaleUpperCase(INTL_LOCALE[locale]);
}

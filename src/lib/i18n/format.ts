import type { SupportedLocale } from "./translations";

export const INTL_LOCALE: Record<SupportedLocale, string> = { tr: "tr-TR", en: "en-GB", bs: "bs-BA" };

/** Open Graph locale tags for page metadata. */
export const OG_LOCALE: Record<SupportedLocale, string> = { tr: "tr_TR", en: "en_US", bs: "bs_BA" };

/**
 * Members write database content (project titles, plan weeks) in Turkish and English only.
 * Bosnian readers get the English version, which they are far more likely to read than Turkish.
 */
export function contentLocale(locale: SupportedLocale): "tr" | "en" {
  return locale === "tr" ? "tr" : "en";
}

function toDate(value: string | number | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

/** "17 Ekim 2026" / "17 October 2026" by default; pass options for other shapes. */
export function formatDate(
  value: string | number | Date,
  locale: SupportedLocale,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], options).format(toDate(value));
}

/** "17 Eki 2026 14:30" / "17 Oct 2026, 14:30". */
export function formatDateTime(value: string | number | Date, locale: SupportedLocale): string {
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(toDate(value));
}

/** Short relative time such as "5 dk önce" / "5 min ago", falling back to a date after a week. */
export function formatRelative(value: string | number | Date, locale: SupportedLocale): string {
  const diffSeconds = Math.round((toDate(value).getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], { numeric: "auto", style: "short" });
  if (abs < 60) return rtf.format(diffSeconds, "second");
  if (abs < 3600) return rtf.format(Math.round(diffSeconds / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSeconds / 3600), "hour");
  if (abs < 604800) return rtf.format(Math.round(diffSeconds / 86400), "day");
  return formatDate(value, locale, { day: "numeric", month: "short", year: "numeric" });
}

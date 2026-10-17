import type { SupportedLocale } from "./translations";

/**
 * First-visit locale from the browser's Accept-Language header: Turkish when the visitor ranks it
 * at or above English, English otherwise (including when the header is missing, as with crawlers).
 */
export function localeFromAcceptLanguage(header: string | null | undefined): SupportedLocale {
  let best: { locale: SupportedLocale; q: number } | null = null;

  for (const entry of (header ?? "").split(",")) {
    const [tag, ...params] = entry.trim().toLowerCase().split(";");
    const base = tag.split("-")[0];
    if (base !== "tr" && base !== "en") continue;

    const qParam = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
    const q = qParam ? Number(qParam.slice(2)) : 1;
    if (!(q > 0)) continue;

    // Strictly greater: on a tie the language listed first wins.
    if (!best || q > best.q) best = { locale: base, q };
  }

  return best?.locale ?? "en";
}

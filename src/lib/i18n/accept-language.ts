import type { SupportedLocale } from "./translations";

/** Browser language tags we map onto a site locale. Croatian and Serbian readers get Bosnian. */
const TAG_TO_LOCALE: Record<string, SupportedLocale> = {
  tr: "tr",
  en: "en",
  bs: "bs",
  hr: "bs",
  sr: "bs",
  sh: "bs",
};

/**
 * First-visit locale from the browser's Accept-Language header: the supported language the visitor
 * ranks highest, English when none matches (including when the header is missing, as with crawlers).
 */
export function localeFromAcceptLanguage(header: string | null | undefined): SupportedLocale {
  let best: { locale: SupportedLocale; q: number } | null = null;

  for (const entry of (header ?? "").split(",")) {
    const [tag, ...params] = entry.trim().toLowerCase().split(";");
    const locale = TAG_TO_LOCALE[tag.split("-")[0]];
    if (!locale) continue;

    const qParam = params.map((param) => param.trim()).find((param) => param.startsWith("q="));
    const q = qParam ? Number(qParam.slice(2)) : 1;
    if (!(q > 0)) continue;

    // Strictly greater: on a tie the language listed first wins.
    if (!best || q > best.q) best = { locale, q };
  }

  return best?.locale ?? "en";
}

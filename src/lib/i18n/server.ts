import { cookies, headers } from "next/headers";
import type { SupportedLocale } from "./translations";
import { localeFromAcceptLanguage } from "./accept-language";

export const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Locale chosen by the visitor (cookie set by the language switcher). Without a choice yet, the
 * browser language decides: Turkish browsers get Turkish, Bosnian, Croatian and Serbian browsers get
 * Bosnian, everyone else English. For server
 * components and actions.
 */
export async function getServerLocale(): Promise<SupportedLocale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (value === "en" || value === "tr" || value === "bs") return value;
  return localeFromAcceptLanguage((await headers()).get("accept-language"));
}

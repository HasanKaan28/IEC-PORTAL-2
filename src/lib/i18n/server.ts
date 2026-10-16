import { cookies } from "next/headers";
import type { SupportedLocale } from "./translations";

export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Locale chosen by the visitor (cookie set by the language switcher); Turkish by default. For server components and actions. */
export async function getServerLocale(): Promise<SupportedLocale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return value === "en" ? "en" : "tr";
}

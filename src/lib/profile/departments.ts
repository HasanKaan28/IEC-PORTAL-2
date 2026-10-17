import type { SupportedLocale } from "@/lib/i18n/translations";

/**
 * Departments offered in sign-up and profile forms. Stored values are English so member lists stay
 * consistent; labels follow the UI language. Members outside these choose "Other" and type their
 * department's English name, which is stored as typed.
 */
export const DEPARTMENTS = [
  { value: "Computer Sciences and Engineering", tr: "Bilgisayar Bilimleri ve Mühendisliği", en: "Computer Sciences and Engineering" },
  { value: "Software Engineering", tr: "Yazılım Mühendisliği", en: "Software Engineering" },
  { value: "Electrical and Electronics Engineering", tr: "Elektrik ve Elektronik Mühendisliği", en: "Electrical and Electronics Engineering" },
  { value: "Mechanical Engineering", tr: "Makine Mühendisliği", en: "Mechanical Engineering" },
  { value: "Industrial Engineering", tr: "Endüstri Mühendisliği", en: "Industrial Engineering" },
  { value: "Architecture", tr: "Mimarlık", en: "Architecture" },
] as const;

/** Select value for "Other". It is never stored: the typed English name is stored instead. */
export const OTHER_DEPARTMENT_OPTION = "__other__";

export const OTHER_DEPARTMENT_TEXT = {
  tr: {
    option: "Diğer",
    label: "Bölüm adı (İngilizce)",
    placeholder: "Örn. Data Science and Artificial Intelligence",
    hint: "Bölümünün İngilizce adını yaz. Türkçe karakter (ç, ğ, ı, ö, ş, ü) kullanma.",
    error: "Bölüm adını İngilizce yaz; yalnızca Latin harfleri kullan, Türkçe karakter kullanma.",
  },
  en: {
    option: "Other",
    label: "Department name (in English)",
    placeholder: "e.g. Data Science and Artificial Intelligence",
    hint: "Write your department's English name, without Turkish or Bosnian letters.",
    error: "Write the department name in English, using plain Latin letters only.",
  },
} satisfies Record<SupportedLocale, Record<string, string>>;

/** Values stored by earlier versions of the forms, mapped to the current list. */
const LEGACY_DEPARTMENTS: Record<string, string> = {
  "Computer Sciences and Engineering (CSE)": "Computer Sciences and Engineering",
  "Software Engineering (SE)": "Software Engineering",
  "Electrical and Electronics (EE)": "Electrical and Electronics Engineering",
  "Electrical and Electronics Engineering (EE)": "Electrical and Electronics Engineering",
  "Mechanical Engineering (ME)": "Mechanical Engineering",
  "Industrial Engineering (IE)": "Industrial Engineering",
};

/** Older generic "other" values that carry no department name. */
const GENERIC_OTHER = new Set(["Other", "Diğer", "Diğer Fakülte / Bölüm"]);

/** Latin letters (no Turkish or Bosnian characters), digits, spaces and simple punctuation. */
const ENGLISH_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9 &,.()'/-]{1,79}$/;

/** Collapses whitespace; returns the cleaned name. */
export function cleanDepartmentName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

/** True when a typed "Other" department name is written in English (plain Latin letters). */
export function isEnglishDepartmentName(value: string): boolean {
  const name = cleanDepartmentName(value);
  return ENGLISH_NAME_PATTERN.test(name) && /[A-Za-z]{2}/.test(name);
}

export function normalizeDepartment(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return LEGACY_DEPARTMENTS[trimmed] ?? trimmed;
}

export function isListedDepartment(value: string | null | undefined): boolean {
  const normalized = normalizeDepartment(value);
  return Boolean(normalized && DEPARTMENTS.some((d) => d.value === normalized));
}

/** True for a value that may be stored: a listed department or an English name typed for "Other". */
export function isAcceptableDepartment(value: string): boolean {
  return isListedDepartment(value) || isEnglishDepartmentName(value);
}

export function isGenericOtherDepartment(value: string | null | undefined): boolean {
  return Boolean(value && GENERIC_OTHER.has(value.trim()));
}

/** Label for a stored department in the given language; typed English names are shown as stored. */
export function departmentLabel(value: string | null | undefined, locale: SupportedLocale): string | null {
  const normalized = normalizeDepartment(value);
  if (!normalized) return null;
  if (GENERIC_OTHER.has(normalized)) return OTHER_DEPARTMENT_TEXT[locale].option;
  const listed = DEPARTMENTS.find((d) => d.value === normalized);
  return listed ? listed[locale] : normalized;
}

"use client";

import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  CheckSquare,
  FolderGit2,
  LoaderCircle,
  Search,
  SearchX,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react";
import PortalAvatar from "@/components/portal/PortalAvatar";
import { useMemberCard } from "@/components/portal/MemberCard";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate } from "@/lib/i18n/format";
import { EVENT_TIME_ZONE } from "@/lib/events/event-types";
import type { SupportedLocale } from "@/lib/i18n/translations";
import { portalSearchText, type PortalSearchText } from "@/lib/i18n/portal/search";
import { portalSearchAction } from "@/lib/search/search-actions";
import {
  SEARCH_GROUPS,
  SEARCH_QUERY_MAX,
  SEARCH_QUERY_MIN,
  type PortalSearchResults,
  type SearchGroup,
} from "@/lib/search/search-types";

/** A portal page offered as a search result. keywords holds its label in both languages. */
export interface SearchPageLink {
  href: string;
  label: string;
  keywords: string;
  icon: LucideIcon;
}

type SectionKey = "pages" | SearchGroup;
type Status = "idle" | "loading" | "done" | "error";
type Surface = "inline" | "sheet";

interface SearchOption {
  key: string;
  title: string;
  subtitle: string | null;
  date?: string | null;
  href?: string;
  memberId?: string;
  avatarUrl?: string | null;
  icon?: LucideIcon;
}

interface SearchSection {
  key: SectionKey;
  options: SearchOption[];
}

const DEBOUNCE_MS = 250;
const INTL_LOCALE: Record<SupportedLocale, string> = { tr: "tr-TR", en: "en-GB" };

const GROUP_STYLE: Record<Exclude<SectionKey, "members">, { icon?: LucideIcon; tone: string }> = {
  pages: { tone: "bg-slate-100 text-slate-600" },
  projects: { icon: FolderGit2, tone: "bg-brand-50 text-brand-700" },
  tasks: { icon: CheckSquare, tone: "bg-emerald-50 text-emerald-700" },
  events: { icon: Calendar, tone: "bg-accent-50 text-accent-700" },
  hackathons: { icon: Trophy, tone: "bg-brand-100 text-brand-800" },
};

/** Debounced server search. Answers to an older query are dropped. */
function useServerSearch(query: string, locale: SupportedLocale) {
  const [results, setResults] = useState<PortalSearchResults | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestRef.current;
    if (query.length < SEARCH_QUERY_MIN) {
      setResults(null);
      setStatus("idle");
      setError(null);
      return;
    }
    setStatus("loading");
    const timer = window.setTimeout(async () => {
      const result = await portalSearchAction(query, locale).catch(() => null);
      if (requestId !== requestRef.current) return;
      if (result?.success && result.data) {
        setResults(result.data);
        setStatus("done");
        setError(null);
      } else {
        setResults(null);
        setStatus("error");
        setError(result && !result.success ? result.error : null);
      }
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [query, locale]);

  return { results, status, error };
}

function buildSections(
  pages: SearchPageLink[],
  query: string,
  results: PortalSearchResults | null,
  locale: SupportedLocale
): SearchSection[] {
  const needle = query.toLocaleLowerCase(INTL_LOCALE[locale]);
  const pageOptions: SearchOption[] = pages
    .filter((page) => !needle || page.keywords.toLocaleLowerCase(INTL_LOCALE[locale]).includes(needle))
    .map((page) => ({ key: `page-${page.href}`, title: page.label, subtitle: null, href: page.href, icon: page.icon }));

  const sections: SearchSection[] = [];
  if (pageOptions.length > 0) sections.push({ key: "pages", options: pageOptions });
  if (!results) return sections;

  for (const group of SEARCH_GROUPS) {
    const hits = results[group];
    if (hits.length === 0) continue;
    sections.push({
      key: group,
      options: hits.map((hit) => ({ ...hit, key: `${group}-${hit.id}` })),
    });
  }
  return sections;
}

/** The part of text that matches the query, marked. Skipped when lowercasing changes the length. */
function Highlight({ text, query, locale }: { text: string; query: string; locale: SupportedLocale }) {
  if (!query) return <>{text}</>;
  const lower = text.toLocaleLowerCase(INTL_LOCALE[locale]);
  const start = lower.length === text.length ? lower.indexOf(query.toLocaleLowerCase(INTL_LOCALE[locale])) : -1;
  if (start < 0) return <>{text}</>;
  const end = start + query.length;
  return (
    <>
      {text.slice(0, start)}
      <mark className="rounded-sm bg-accent-100 text-inherit">{text.slice(start, end)}</mark>
      {text.slice(end)}
    </>
  );
}

function OptionIcon({ section, option }: { section: SectionKey; option: SearchOption }) {
  if (section === "members") return <PortalAvatar name={option.title} avatarUrl={option.avatarUrl} />;
  const style = GROUP_STYLE[section];
  const Icon = option.icon ?? style.icon ?? Search;
  return (
    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${style.tone}`} aria-hidden="true">
      <Icon className="h-4 w-4" />
    </span>
  );
}

interface ResultsProps {
  surface: Surface;
  listboxId: string;
  optionId: (index: number) => string;
  sections: SearchSection[];
  activeIndex: number;
  onHover: (index: number) => void;
  onChoose: (option: SearchOption) => void;
  query: string;
  status: Status;
  error: string | null;
  locale: SupportedLocale;
  t: PortalSearchText;
}

function SearchResults({
  surface,
  listboxId,
  optionId,
  sections,
  activeIndex,
  onHover,
  onChoose,
  query,
  status,
  error,
  locale,
  t,
}: ResultsProps) {
  const total = sections.reduce((sum, section) => sum + section.options.length, 0);
  const searchable = query.length >= SEARCH_QUERY_MIN;
  let index = -1;

  return (
    <>
      <div
        role="listbox"
        id={listboxId}
        aria-label={t.resultsLabel}
        className={surface === "inline" ? "max-h-[min(28rem,70dvh)] overflow-y-auto py-2" : "flex-1 overflow-y-auto py-2"}
      >
        {!searchable && (
          <p role="presentation" className="px-5 pb-1 pt-2 text-xs leading-relaxed text-slate-500">
            {t.typeToSearch}
          </p>
        )}

        {sections.map((section) => {
          const headingId = `${listboxId}-${section.key}`;
          return (
            <ul key={section.key} role="group" aria-labelledby={headingId} className="px-2 pb-1">
              <li
                role="presentation"
                id={headingId}
                className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {t.groups[section.key]}
              </li>
              {section.options.map((option) => {
                index += 1;
                const optionIndex = index;
                const active = optionIndex === activeIndex;
                return (
                  <li
                    key={option.key}
                    id={optionId(optionIndex)}
                    role="option"
                    aria-selected={active}
                    onMouseMove={() => {
                      if (!active) onHover(optionIndex);
                    }}
                    onClick={() => onChoose(option)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 ${
                      active ? "bg-brand-50 ring-1 ring-inset ring-brand-200" : ""
                    }`}
                  >
                    <OptionIcon section={section.key} option={option} />
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-sm font-medium ${active ? "text-brand-800" : "text-slate-900"}`}>
                        <Highlight text={option.title} query={query} locale={locale} />
                      </span>
                      {option.subtitle && <span className="block truncate text-xs text-slate-500">{option.subtitle}</span>}
                    </span>
                    {option.date && (
                      <time dateTime={option.date} className="shrink-0 text-xs tabular-nums text-slate-500">
                        {formatDate(option.date, locale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          timeZone: EVENT_TIME_ZONE,
                        })}
                      </time>
                    )}
                  </li>
                );
              })}
            </ul>
          );
        })}


        {searchable && status === "loading" && (
          <p className="flex items-center gap-2 px-5 py-3 text-sm text-slate-500">
            <LoaderCircle className="h-4 w-4 animate-spin text-brand-600" aria-hidden="true" />
            {t.searching}
          </p>
        )}

        {searchable && status === "error" && error && <p className="px-5 py-3 text-sm text-rose-700">{error}</p>}

        {searchable && status === "done" && total === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <SearchX className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="break-words text-sm text-slate-600">{t.noResults(query)}</p>
          </div>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {searchable && status === "loading" ? t.searching : ""}
        {searchable && status === "done" ? (total === 0 ? t.noResults(query) : t.resultCount(total)) : ""}
      </p>

      {surface === "inline" && (
        <p className="hidden border-t border-slate-100 px-4 py-2 text-xs text-slate-500 lg:block">{t.keyboardHint}</p>
      )}
    </>
  );
}

const inputBase =
  "w-full rounded-xl border text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/25 [&::-webkit-search-cancel-button]:hidden";

/**
 * Header search for the portal. On wider screens it is a field in the header with a dropdown of
 * results; on phones a search button opens a full-screen sheet. Ctrl/Cmd+K focuses it. The input is
 * an ARIA combobox: arrow keys move through the results, Enter opens one, Esc closes.
 */
export default function PortalSearch({ pages }: { pages: SearchPageLink[] }) {
  const { locale } = useLocale();
  const t = portalSearchText[locale];
  const router = useRouter();
  const pathname = usePathname();
  const memberCard = useMemberCard();
  const baseId = useId();

  const [query, setQuery] = useState("");
  const [inlineOpen, setInlineOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [shortcutLabel, setShortcutLabel] = useState("Ctrl K");

  const inlineInputRef = useRef<HTMLInputElement>(null);
  const sheetInputRef = useRef<HTMLInputElement>(null);
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const trimmed = query.trim();
  const { results, status, error } = useServerSearch(trimmed, locale);
  const sections = useMemo(() => buildSections(pages, trimmed, results, locale), [pages, trimmed, results, locale]);
  const options = useMemo(() => sections.flatMap((section) => section.options), [sections]);

  const surface: Surface | null = sheetOpen ? "sheet" : inlineOpen ? "inline" : null;
  const listboxId = `${baseId}-${surface ?? "inline"}-listbox`;
  const optionId = useCallback((index: number) => `${listboxId}-option-${index}`, [listboxId]);

  // Typing (or new results) points at the first match, so Enter opens it straight away.
  useEffect(() => {
    setActiveIndex(trimmed ? 0 : -1);
  }, [trimmed, results]);

  useEffect(() => {
    if (activeIndex < 0 || !surface) return;
    document.getElementById(optionId(activeIndex))?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, optionId, surface]);

  useEffect(() => {
    setInlineOpen(false);
    setSheetOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)) setShortcutLabel("⌘ K");
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.ctrlKey || event.metaKey) || event.altKey) return;
      event.preventDefault();
      if (window.matchMedia("(min-width: 768px)").matches) {
        inlineInputRef.current?.focus();
        inlineInputRef.current?.select();
        setInlineOpen(true);
      } else {
        setSheetOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!sheetOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    sheetInputRef.current?.focus();
    const trigger = sheetTriggerRef.current;
    return () => {
      document.body.style.overflow = previousOverflow;
      trigger?.focus();
    };
  }, [sheetOpen]);

  const close = () => {
    setInlineOpen(false);
    setSheetOpen(false);
  };

  const choose = (option: SearchOption) => {
    close();
    setQuery("");
    inlineInputRef.current?.blur();
    if (option.memberId) {
      if (memberCard) memberCard.openMemberCard(option.memberId);
      else router.push(`/portal/mesajlar?to=${encodeURIComponent(option.memberId)}`);
    } else if (option.href) {
      router.push(option.href);
    }
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, inputSurface: Surface) => {
    const count = options.length;
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        event.preventDefault();
        if (inputSurface === "inline") setInlineOpen(true);
        if (count === 0) return;
        const step = event.key === "ArrowDown" ? 1 : -1;
        setActiveIndex((current) => (current < 0 ? (step > 0 ? 0 : count - 1) : (current + step + count) % count));
        return;
      }
      case "Enter": {
        if (!surface || count === 0) return;
        event.preventDefault();
        choose(options[activeIndex >= 0 ? activeIndex : 0]);
        return;
      }
      case "Escape": {
        // In the sheet, the dialog's own handler closes it.
        if (inputSurface === "sheet") return;
        event.preventDefault();
        if (inlineOpen) setInlineOpen(false);
        else setQuery("");
        return;
      }
    }
  };

  /** Esc closes the sheet; Tab stays inside it (its only stops are the field and the close button). */
  const onSheetKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setSheetOpen(false);
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>("input, button") ?? []);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const comboboxProps = (inputSurface: Surface) => {
    const expanded = surface === inputSurface;
    return {
      type: "search",
      role: "combobox",
      value: query,
      maxLength: SEARCH_QUERY_MAX,
      autoComplete: "off",
      spellCheck: false,
      enterKeyHint: "search" as const,
      placeholder: t.placeholder,
      "aria-label": t.label,
      "aria-autocomplete": "list" as const,
      "aria-expanded": expanded,
      "aria-controls": expanded ? listboxId : undefined,
      "aria-activedescendant": expanded && activeIndex >= 0 && activeIndex < options.length ? optionId(activeIndex) : undefined,
      "aria-keyshortcuts": "Control+K Meta+K",
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
        if (inputSurface === "inline") setInlineOpen(true);
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(event, inputSurface),
    };
  };

  const resultsProps = {
    listboxId,
    optionId,
    sections,
    activeIndex,
    onHover: setActiveIndex,
    onChoose: choose,
    query: trimmed,
    status,
    error,
    locale,
    t,
  };

  return (
    <>
      <div
        className="relative hidden w-full max-w-xl md:block"
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setInlineOpen(false);
        }}
      >
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          ref={inlineInputRef}
          {...comboboxProps("inline")}
          onFocus={() => setInlineOpen(true)}
          className={`${inputBase} h-10 border-brand-100 bg-white/70 pl-10 text-sm pr-20 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:bg-white/85 focus:border-brand-400 focus:bg-white`}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inlineInputRef.current?.focus();
              }}
              aria-label={t.clear}
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <kbd
              title={t.shortcutHint}
              className="pointer-events-none hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-sans text-xs font-medium text-slate-500 lg:inline-block"
            >
              {shortcutLabel}
            </kbd>
          )}
        </div>

        {inlineOpen && (
          <div
            // Keeps focus in the input while the pointer is on the results (including the scrollbar).
            onMouseDown={(event) => event.preventDefault()}
            className="absolute left-0 top-full z-40 mt-2 w-full min-w-[22rem] overflow-hidden rounded-2xl border border-brand-100 bg-white/95 shadow-xl backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <SearchResults surface="inline" {...resultsProps} />
          </div>
        )}
      </div>

      <button
        ref={sheetTriggerRef}
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label={t.openSearch}
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
        className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40 md:hidden"
      >
        <Search className="h-5 w-5" aria-hidden="true" />
      </button>

      {sheetOpen &&
        // Portalled to <body>: the header's backdrop blur would otherwise pin a fixed sheet inside it.
        createPortal(
        <div
          ref={sheetRef}
          role="dialog"
          aria-modal="true"
          aria-label={t.label}
          onKeyDown={onSheetKeyDown}
          className="theme-portal fixed inset-0 z-50 flex flex-col bg-canvas/95 backdrop-blur-xl animate-in fade-in duration-150 md:hidden"
        >
          <div className="flex items-center gap-2 border-b border-brand-100 bg-white/70 px-4 py-3">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                ref={sheetInputRef}
                {...comboboxProps("sheet")}
                className={`${inputBase} h-11 border-brand-200 bg-white pl-9 pr-3 text-base focus:border-brand-400`}
              />
            </div>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="shrink-0 rounded-lg px-2 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {t.closeSearch}
            </button>
          </div>
          <SearchResults surface="sheet" {...resultsProps} />
        </div>,
        document.body
      )}
    </>
  );
}

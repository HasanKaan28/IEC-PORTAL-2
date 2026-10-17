"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { guardedAction, requireUser, type ActionResult, type SessionUser } from "@/lib/auth/session";
import { canSeePage } from "@/lib/rbac/page-access";
import { consumeRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import type { SupportedLocale } from "@/lib/i18n/translations";
import { portalSearchText } from "@/lib/i18n/portal/search";
import { portalShellText } from "@/lib/i18n/portal/shell";
import { localizeDepartment } from "@/lib/i18n/portal/messages-profile";
import { isTaskStatus } from "@/lib/tasks/task-types";
import {
  SEARCH_FOCUS_PARAM,
  SEARCH_GROUP_LIMIT,
  SEARCH_QUERY_MAX,
  SEARCH_QUERY_MIN,
  type PortalSearchResults,
  type SearchHit,
} from "./search-types";

/**
 * Header search across what the signed-in member can already open. Every query runs with the
 * member's own Supabase client, so row level security decides what comes back, and groups whose
 * page the member cannot see are skipped. Profiles expose no email or phone columns to members,
 * so member hits carry only name, department and avatar.
 */

type Client = Awaited<ReturnType<typeof createClient>>;

const localeSchema = z.enum(["tr", "en"]);

function localized(tr: string | null | undefined, en: string | null | undefined, locale: SupportedLocale): string {
  return (locale === "en" ? en || tr : tr || en) || "";
}

/**
 * ILIKE pattern for PostgREST filters. Characters that carry meaning in LIKE or in the `or=()`
 * filter syntax become the single-character wildcard, so the text needs no escaping at all.
 */
function likePattern(query: string): string {
  return `%${query.replace(/\s+/g, " ").replace(/[%_\\,()"*]/g, "_")}%`;
}

function anyColumnMatches(columns: string[], pattern: string): string {
  return columns.map((column) => `${column}.ilike.${pattern}`).join(",");
}

function focusHref(path: string, param: string, id: string): string {
  return `${path}?${param}=${encodeURIComponent(id)}`;
}

async function rows<T>(label: string, request: PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> {
  const { data, error } = await request;
  if (error) {
    console.error(`[search] ${label} query failed`, error);
    return [];
  }
  return (data as T[] | null) ?? [];
}

async function searchProjects(supabase: Client, pattern: string, locale: SupportedLocale): Promise<SearchHit[]> {
  type Row = {
    id: string;
    title_tr: string;
    title_en: string;
    tagline_tr: string | null;
    tagline_en: string | null;
    category_tr: string | null;
    category_en: string | null;
  };
  const found = await rows<Row>(
    "projects",
    (supabase.from("projects") as any)
      .select("id, title_tr, title_en, tagline_tr, tagline_en, category_tr, category_en")
      .or(anyColumnMatches(["title_tr", "title_en", "tagline_tr", "tagline_en", "category_tr", "category_en"], pattern))
      .order("is_flagship", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(SEARCH_GROUP_LIMIT)
  );
  return found.map((row) => ({
    id: row.id,
    title: localized(row.title_tr, row.title_en, locale),
    subtitle: localized(row.category_tr, row.category_en, locale) || localized(row.tagline_tr, row.tagline_en, locale) || null,
    href: focusHref("/portal/projeler", SEARCH_FOCUS_PARAM.projects, row.id),
  }));
}

async function searchTasks(supabase: Client, pattern: string, locale: SupportedLocale): Promise<SearchHit[]> {
  type Row = {
    id: string;
    title: string;
    status: string;
    due_date: string | null;
    project: { title_tr: string; title_en: string } | null;
  };
  const found = await rows<Row>(
    "tasks",
    (supabase.from("tasks") as any)
      .select("id, title, status, due_date, project:project_id (title_tr, title_en)")
      .or(anyColumnMatches(["title", "description"], pattern))
      .order("updated_at", { ascending: false })
      .limit(SEARCH_GROUP_LIMIT)
  );
  const statusLabels = portalShellText[locale].dashboard.status;
  const noProject = portalSearchText[locale].noProject;
  return found.map((row) => {
    const project = row.project ? localized(row.project.title_tr, row.project.title_en, locale) : noProject;
    const status = isTaskStatus(row.status) ? statusLabels[row.status] : null;
    return {
      id: row.id,
      title: row.title,
      subtitle: [project, status].filter(Boolean).join(", "),
      date: row.due_date,
      href: focusHref("/portal/gorevler", SEARCH_FOCUS_PARAM.tasks, row.id),
    };
  });
}

async function searchEvents(supabase: Client, pattern: string): Promise<SearchHit[]> {
  type Row = { id: string; title: string; venue: string | null; date_time: string };
  const found = await rows<Row>(
    "events",
    (supabase.from("events") as any)
      .select("id, title, venue, date_time")
      .or(anyColumnMatches(["title", "venue", "description"], pattern))
      .order("date_time", { ascending: false })
      .limit(SEARCH_GROUP_LIMIT)
  );
  return found.map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.venue || null,
    date: row.date_time,
    href: focusHref("/portal/etkinlikler", SEARCH_FOCUS_PARAM.events, row.id),
  }));
}

async function searchHackathons(supabase: Client, pattern: string): Promise<SearchHit[]> {
  type Row = { id: string; title: string; location_country: string | null; start_date: string | null };
  const found = await rows<Row>(
    "hackathons",
    (supabase.from("hackathons") as any)
      .select("id, title, location_country, start_date")
      .or(anyColumnMatches(["title", "description", "location_country"], pattern))
      .order("start_date", { ascending: false })
      .limit(SEARCH_GROUP_LIMIT)
  );
  return found.map((row) => ({
    id: row.id,
    title: row.title,
    subtitle: row.location_country || null,
    date: row.start_date,
    href: focusHref("/portal/hackathon", SEARCH_FOCUS_PARAM.hackathons, row.id),
  }));
}

async function searchMembers(supabase: Client, pattern: string, locale: SupportedLocale): Promise<SearchHit[]> {
  type Row = { id: string; full_name: string | null; department: string | null; avatar_url: string | null };
  const found = await rows<Row>(
    "members",
    (supabase.from("profiles") as any)
      .select("id, full_name, department, avatar_url")
      .ilike("full_name", pattern)
      .order("full_name", { ascending: true })
      .limit(SEARCH_GROUP_LIMIT)
  );
  return found.map((row) => ({
    id: row.id,
    title: row.full_name?.trim() || "?",
    subtitle: localizeDepartment(row.department, locale),
    avatarUrl: row.avatar_url,
    memberId: row.id,
  }));
}

async function runSearch(user: SessionUser, query: string, locale: SupportedLocale): Promise<PortalSearchResults> {
  const supabase = await createClient();
  const pattern = likePattern(query);
  const skip = Promise.resolve<SearchHit[]>([]);
  const [projects, tasks, events, hackathons, members] = await Promise.all([
    canSeePage(user, "projects") ? searchProjects(supabase, pattern, locale) : skip,
    canSeePage(user, "tasks") ? searchTasks(supabase, pattern, locale) : skip,
    canSeePage(user, "events") ? searchEvents(supabase, pattern) : skip,
    canSeePage(user, "hackathons") ? searchHackathons(supabase, pattern) : skip,
    searchMembers(supabase, pattern, locale),
  ]);
  return { projects, tasks, events, hackathons, members };
}

export async function portalSearchAction(query: string, locale: string): Promise<ActionResult<PortalSearchResults>> {
  return guardedAction<PortalSearchResults>(async () => {
    const user = await requireUser();
    const lang: SupportedLocale = localeSchema.catch("tr").parse(locale);
    const t = portalSearchText[lang].errors;

    const parsed = z.string().trim().min(SEARCH_QUERY_MIN).max(SEARCH_QUERY_MAX).safeParse(query);
    if (!parsed.success) return { success: false, error: t.invalidQuery };

    if (!(await consumeRateLimit(RATE_LIMITS.portalSearch, user.id))) {
      return { success: false, error: t.rateLimited };
    }

    return { success: true, data: await runSearch(user, parsed.data, lang) };
  });
}

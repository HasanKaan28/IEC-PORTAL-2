import { createAdminClient, createClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured, isSupabaseConfigured } from "@/lib/supabase/config";
import { getSessionUser, requirePermission, requireUser, userCan } from "@/lib/auth/session";
import { SITE_URL } from "@/lib/site-url";
import {
  getEventStatus,
  isUuid,
  type CertificateItem,
  type EventAttendanceItem,
  type EventItem,
  type EventStatus,
  type PublicCertificate,
} from "./event-types";

/**
 * Server-side reads for events, attendance and certificates. Read queries return empty results when
 * Supabase is not configured; there is no demo or sample data.
 *
 * The events table only grants these columns to anon/authenticated, so user-scoped queries must list
 * them explicitly. qr_signing_secret is read only through getEventSigningRecord (service role).
 */
const PUBLIC_EVENT_COLUMNS = "id, title, description, venue, date_time";

const CERTIFICATE_COLUMNS =
  "id, event_id, user_id, certificate_code, issued_at, events:event_id(title, date_time), profiles:user_id(full_name, department)";

interface EventRow {
  id: string;
  title: string;
  description: string;
  venue: string;
  date_time: string;
}

interface CertificateRow {
  id: string;
  event_id: string;
  user_id: string;
  certificate_code: string;
  issued_at: string;
  events: { title: string; date_time: string } | null;
  profiles: { full_name: string | null; department: string | null } | null;
}

/** Server-only record including the QR signing secret. Never pass it to a client component. */
export interface EventSigningRecord {
  id: string;
  title: string;
  venue: string;
  dateTime: string;
  qrSigningSecret: string;
}

export function certificateVerifyUrl(code: string): string {
  return `${SITE_URL}/dogrula?code=${encodeURIComponent(code)}`;
}

const STATUS_ORDER: Record<EventStatus, number> = { live: 0, upcoming: 1, past: 2 };

/** All events with the signed-in user's own attendance and certificate state. */
export async function getEvents(): Promise<EventItem[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const [supabase, user] = await Promise.all([createClient(), getSessionUser()]);
    const { data, error } = await (supabase.from("events") as any)
      .select(PUBLIC_EVENT_COLUMNS)
      .order("date_time", { ascending: true });
    if (error) {
      console.error("[events] list failed", error);
      return [];
    }
    const rows = (data ?? []) as EventRow[];

    const attendedEventIds = new Set<string>();
    const certificateByEvent = new Map<string, string>();
    if (user && rows.length > 0) {
      const [attendanceResult, certificateResult] = await Promise.all([
        (supabase.from("event_attendances") as any).select("event_id").eq("user_id", user.id),
        (supabase.from("certificates") as any).select("event_id, certificate_code").eq("user_id", user.id),
      ]);
      for (const row of (attendanceResult.data ?? []) as Array<{ event_id: string }>) {
        attendedEventIds.add(row.event_id);
      }
      for (const row of (certificateResult.data ?? []) as Array<{ event_id: string; certificate_code: string }>) {
        certificateByEvent.set(row.event_id, row.certificate_code);
      }
    }

    const now = Date.now();
    const events: EventItem[] = rows.map((row) => {
      const status = getEventStatus(row.date_time, now);
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        venue: row.venue,
        dateTime: row.date_time,
        status,
        checkInOpen: status === "live",
        attended: attendedEventIds.has(row.id) || certificateByEvent.has(row.id),
        certificateCode: certificateByEvent.get(row.id) ?? null,
      };
    });

    // Open check-ins first, then upcoming (soonest first), then past (most recent first).
    return events.sort((a, b) => {
      if (a.status !== b.status) return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      const diff = new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      return a.status === "past" ? -diff : diff;
    });
  } catch (error) {
    console.error("[events] list failed", error);
    return [];
  }
}

/**
 * Reads an event together with its QR signing secret using the service-role client.
 * "host" requires events.qr_host (code generation); "check-in" requires a signed-in user (code
 * verification). Server code only: the secret must never reach the browser.
 */
export async function getEventSigningRecord(
  eventId: string,
  purpose: "host" | "check-in"
): Promise<EventSigningRecord | null> {
  if (purpose === "host") await requirePermission("events.qr_host");
  else await requireUser();
  if (!isUuid(eventId) || !isSupabaseAdminConfigured()) return null;

  const { data, error } = await (createAdminClient().from("events") as any)
    .select("id, title, venue, date_time, qr_signing_secret")
    .eq("id", eventId)
    .maybeSingle();
  if (error) {
    console.error("[events] signing record lookup failed", error);
    return null;
  }
  if (!data) return null;
  const row = data as { id: string; title: string; venue: string; date_time: string; qr_signing_secret: string | null };
  return {
    id: row.id,
    title: row.title,
    venue: row.venue,
    dateTime: row.date_time,
    qrSigningSecret: row.qr_signing_secret ?? "",
  };
}

/** Live attendance list for the host screen. Returns nothing unless the caller has events.qr_host. */
export async function getEventAttendancesForHost(eventId: string): Promise<EventAttendanceItem[]> {
  const user = await getSessionUser();
  if (!userCan(user, "events.qr_host") || !isUuid(eventId) || !isSupabaseAdminConfigured()) return [];
  try {
    // Service role: leaders host events but RLS only lets admins read other members' attendance.
    const { data, error } = await (createAdminClient().from("event_attendances") as any)
      .select("id, checked_in_at, profiles:user_id(full_name)")
      .eq("event_id", eventId)
      .order("checked_in_at", { ascending: false })
      .limit(1000);
    if (error) {
      console.error("[events] attendance list failed", error);
      return [];
    }
    return ((data ?? []) as Array<{ id: string; checked_in_at: string; profiles: { full_name: string | null } | null }>).map(
      (row) => ({ id: row.id, userName: row.profiles?.full_name ?? "", checkedInAt: row.checked_in_at })
    );
  } catch (error) {
    console.error("[events] attendance list failed", error);
    return [];
  }
}

function toCertificateItem(row: CertificateRow): CertificateItem {
  return {
    id: row.id,
    eventId: row.event_id,
    eventTitle: row.events?.title ?? "",
    userName: row.profiles?.full_name ?? "",
    userDepartment: row.profiles?.department ?? null,
    certificateCode: row.certificate_code,
    issueDate: row.issued_at.slice(0, 10),
    trainingHours: null,
    skills: [],
    instructorName: null,
    pdfUrl: `/api/certificates/${row.certificate_code}/pdf`,
    verifyUrl: certificateVerifyUrl(row.certificate_code),
  };
}

/** The signed-in user's own certificates (filtered by user id: leaders can read everyone's via RLS). */
export async function getUserCertificates(): Promise<CertificateItem[]> {
  if (!isSupabaseConfigured()) return [];
  try {
    const user = await getSessionUser();
    if (!user) return [];
    const supabase = await createClient();
    const { data, error } = await (supabase.from("certificates") as any)
      .select(CERTIFICATE_COLUMNS)
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false });
    if (error) {
      console.error("[certificates] list failed", error);
      return [];
    }
    return ((data ?? []) as CertificateRow[]).map(toCertificateItem);
  } catch (error) {
    console.error("[certificates] list failed", error);
    return [];
  }
}

/**
 * Certificate for the PDF route, by exact (already normalized) code. Holding the exact code is what the
 * public verification page needs too, so the service role is used when available. Without it, the
 * user-scoped client only finds the caller's own certificates (or all of them for leaders) through RLS.
 */
export async function getCertificateForPdf(code: string): Promise<CertificateItem | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const client = isSupabaseAdminConfigured() ? createAdminClient() : await createClient();
    const { data, error } = await (client.from("certificates") as any)
      .select(CERTIFICATE_COLUMNS)
      .eq("certificate_code", code)
      .maybeSingle();
    if (error) {
      console.error("[certificates] pdf lookup failed", error);
      return null;
    }
    return data ? toCertificateItem(data as CertificateRow) : null;
  } catch (error) {
    console.error("[certificates] pdf lookup failed", error);
    return null;
  }
}

/**
 * Public verification by exact (already normalized) code; returns only what the verify page shows.
 * Null means "no such certificate"; a database failure throws so the route can answer with a 5xx.
 */
export async function getPublicCertificateByCode(code: string): Promise<PublicCertificate | null> {
  if (!isSupabaseAdminConfigured()) throw new Error("Supabase service role is not configured");
  const { data, error } = await (createAdminClient().from("certificates") as any)
    .select("certificate_code, issued_at, events:event_id(title), profiles:user_id(full_name)")
    .eq("certificate_code", code)
    .maybeSingle();
  if (error) throw new Error(`Certificate verification lookup failed: ${error.message ?? "unknown error"}`);
  if (!data) return null;

  const row = data as {
    certificate_code: string;
    issued_at: string;
    events: { title: string } | null;
    profiles: { full_name: string | null } | null;
  };
  return {
    certificateCode: row.certificate_code,
    userName: row.profiles?.full_name ?? "",
    eventTitle: row.events?.title ?? "",
    issueDate: row.issued_at.slice(0, 10),
    trainingHours: null,
    skills: [],
    verifyUrl: certificateVerifyUrl(row.certificate_code),
  };
}

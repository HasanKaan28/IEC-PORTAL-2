/**
 * Shared event / attendance / certificate shapes and pure helpers (safe for client components).
 * Nothing in here may carry an event's QR signing secret: that value only lives in server code.
 */

/** Events happen on campus in Sarajevo; formatting in a fixed zone keeps server and client output identical. */
export const EVENT_TIME_ZONE = "Europe/Sarajevo";

/** Check-in opens shortly before the start time and stays open long enough for multi-day events. */
export const CHECK_IN_OPENS_BEFORE_MS = 2 * 60 * 60 * 1000;
export const CHECK_IN_CLOSES_AFTER_MS = 48 * 60 * 60 * 1000;

export type EventStatus = "upcoming" | "live" | "past";

/** An event as members see it, plus the signed-in user's own attendance state. */
export interface EventItem {
  id: string;
  title: string;
  description: string;
  venue: string;
  dateTime: string;
  status: EventStatus;
  checkInOpen: boolean;
  attended: boolean;
  certificateCode: string | null;
}

/** Public fields of an event shown on the host's live check-in screen. */
export interface PresenterEvent {
  id: string;
  title: string;
  venue: string;
  dateTime: string;
  checkInOpen: boolean;
}

/** One row of the live attendance list. No emails or ids: it is shown on a projector. */
export interface EventAttendanceItem {
  id: string;
  userName: string;
  checkedInAt: string;
}

export interface CheckInResult {
  alreadyCheckedIn: boolean;
  certificateCode: string | null;
}

export interface LiveCheckInSnapshot {
  code: string;
  qrValue: string;
  remainingSeconds: number;
  attendees: EventAttendanceItem[];
}

/** A certificate as its holder sees it in the portal. */
export interface CertificateItem {
  id: string;
  eventId: string;
  eventTitle: string;
  userName: string;
  userDepartment: string | null;
  certificateCode: string;
  /** YYYY-MM-DD (UTC). */
  issueDate: string;
  /** Not stored in the database yet, so usually null. */
  trainingHours: number | null;
  /** Not stored in the database yet, so usually empty. */
  skills: string[];
  instructorName: string | null;
  pdfUrl?: string;
  verifyUrl: string;
}

/** What the public verification endpoint returns: no ids, emails or departments. */
export interface PublicCertificate {
  certificateCode: string;
  userName: string;
  eventTitle: string;
  issueDate: string;
  trainingHours: number | null;
  skills: string[];
  verifyUrl: string;
}

export function getEventStatus(dateTime: string, nowMs: number = Date.now()): EventStatus {
  const start = new Date(dateTime).getTime();
  if (Number.isNaN(start)) return "past";
  if (nowMs < start - CHECK_IN_OPENS_BEFORE_MS) return "upcoming";
  if (nowMs <= start + CHECK_IN_CLOSES_AFTER_MS) return "live";
  return "past";
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

/**
 * Accepts what a member might type or scan: "482913", "482 913", or the full check-in URL encoded in
 * the QR code. Returns the 6 digits, or null when the input is not a well-formed code.
 */
export function normalizeCheckInCode(input: string): string | null {
  let candidate = input.trim();
  if (/^https?:\/\//i.test(candidate)) {
    try {
      candidate = new URL(candidate).searchParams.get("code") ?? "";
    } catch {
      return null;
    }
  }
  const digits = candidate.replace(/[\s-]/g, "");
  return /^\d{6}$/.test(digits) ? digits : null;
}

const CERTIFICATE_CODE_PATTERN = /^IEC-\d{4}-[A-Z0-9]{4,16}$/;

/** Uppercases and validates a certificate code. Lookups use exact matches only, never patterns. */
export function normalizeCertificateCode(input: string): string | null {
  const code = input.trim().toUpperCase();
  return CERTIFICATE_CODE_PATTERN.test(code) ? code : null;
}

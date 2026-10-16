import crypto from "crypto";
import { SITE_URL } from "@/lib/site-url";

/**
 * Rotating 6-digit check-in codes for event QR attendance (server only).
 *
 * The HMAC key for an event is derived from two secrets:
 *   - QR_HMAC_SECRET (server environment, never stored in the database), and
 *   - the event's own qr_signing_secret column (read only with the service-role client).
 * Leaking either one alone is not enough to compute codes. There is no fallback secret: if either is
 * missing, generating and verifying codes is refused with a QrSigningError.
 */

export const ROTATION_WINDOW_SECONDS = 60;

const MIN_SERVER_SECRET_LENGTH = 32;
const MIN_EVENT_SECRET_LENGTH = 16;
const ENV_EXAMPLE_PLACEHOLDER = "change-this-to-a-secure-random-secret-key-32-chars-min";

export class QrSigningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QrSigningError";
  }
}

export interface TOTPResult {
  code: string;
  remainingSeconds: number;
  currentWindow: number;
}

function getServerQrSecret(): string {
  const secret = process.env.QR_HMAC_SECRET?.trim() ?? "";
  if (secret.length < MIN_SERVER_SECRET_LENGTH) {
    throw new QrSigningError(
      "QR_HMAC_SECRET is missing or shorter than 32 characters; QR check-in is disabled until it is set."
    );
  }
  if (process.env.NODE_ENV === "production" && secret === ENV_EXAMPLE_PLACEHOLDER) {
    throw new QrSigningError("QR_HMAC_SECRET still has the .env.example placeholder value; set a random secret.");
  }
  return secret;
}

/** True when the server-side QR secret is usable (for showing a clear message instead of failing later). */
export function isQrSigningConfigured(): boolean {
  try {
    getServerQrSecret();
    return true;
  } catch {
    return false;
  }
}

function deriveEventKey(eventId: string, eventSecret: string): Buffer {
  if (!eventSecret || eventSecret.length < MIN_EVENT_SECRET_LENGTH) {
    throw new QrSigningError(`Event ${eventId} has no usable QR signing secret.`);
  }
  return crypto
    .createHmac("sha256", getServerQrSecret())
    .update(`iec-event-qr:v1:${eventId}:${eventSecret}`)
    .digest();
}

/** RFC 4226 style dynamic truncation of HMAC-SHA256(key, eventId:window) to 6 digits. */
function codeForWindow(key: Buffer, eventId: string, window: number): string {
  const hash = crypto.createHmac("sha256", key).update(`${eventId}:${window}`).digest();
  const offset = hash[hash.length - 1] & 0x0f;
  const binary = hash.readUInt32BE(offset) & 0x7fffffff;
  return (binary % 1_000_000).toString().padStart(6, "0");
}

function currentWindowFor(nowMs: number): number {
  return Math.floor(nowMs / (ROTATION_WINDOW_SECONDS * 1000));
}

/** Current code for an event. Throws QrSigningError when a secret is missing. */
export function generateEventTOTP(eventId: string, eventSecret: string, nowMs: number = Date.now()): TOTPResult {
  const key = deriveEventKey(eventId, eventSecret);
  const currentWindow = currentWindowFor(nowMs);
  const remainingSeconds = ROTATION_WINDOW_SECONDS - (Math.floor(nowMs / 1000) % ROTATION_WINDOW_SECONDS);
  return { code: codeForWindow(key, eventId, currentWindow), remainingSeconds, currentWindow };
}

/**
 * Checks a normalized 6-digit code against the current and the previous window (a short grace period
 * for codes typed just as they rotate). Throws QrSigningError when a secret is missing.
 */
export function verifyEventTOTP(
  eventId: string,
  eventSecret: string,
  code: string,
  nowMs: number = Date.now()
): boolean {
  if (!/^\d{6}$/.test(code)) return false;
  const key = deriveEventKey(eventId, eventSecret);
  const currentWindow = currentWindowFor(nowMs);
  const submitted = Buffer.from(code);
  let matched = false;
  for (const windowOffset of [0, -1]) {
    const expected = Buffer.from(codeForWindow(key, eventId, currentWindow + windowOffset));
    if (crypto.timingSafeEqual(expected, submitted)) matched = true;
  }
  return matched;
}

/** URL encoded in the QR code: scanning it with a phone camera opens the portal's check-in dialog. */
export function buildCheckInUrl(eventId: string, code: string): string {
  return `${SITE_URL}/portal/etkinlikler?checkin=${encodeURIComponent(eventId)}&code=${code}`;
}

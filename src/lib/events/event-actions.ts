"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { requirePageAccess, guardedAction, requirePermission, type ActionResult } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";
import { RATE_LIMITS, consumeRateLimit } from "@/lib/security/rate-limit";
import { buildCheckInUrl, generateEventTOTP, QrSigningError, verifyEventTOTP } from "./totp";
import { getEventAttendancesForHost, getEventSigningRecord } from "./event-queries";
import {
  getEventStatus,
  normalizeCheckInCode,
  type CheckInResult,
  type LiveCheckInSnapshot,
} from "./event-types";

/**
 * Event server actions. Each one is a public HTTP endpoint, so every body authenticates and authorizes
 * first and never trusts identity sent by the client: attendance and certificates are always written
 * for the session user only.
 */

async function text() {
  return eventsHackathonsText[await getServerLocale()];
}

const CERTIFICATE_CODE_ALPHABET ="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // 32 symbols, no 0/O/1/I

/** IEC-<year>-<8 random symbols>: about 10^12 combinations, so codes cannot be guessed or enumerated. */
function generateCertificateCode(): string {
  let suffix = "";
  for (const byte of crypto.randomBytes(8)) suffix += CERTIFICATE_CODE_ALPHABET[byte & 31];
  return `IEC-${new Date().getUTCFullYear()}-${suffix}`;
}

/** Returns the user's certificate for the event, issuing one if needed. Null when issuing failed. */
async function ensureCertificate(eventId: string, userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: existing, error: lookupError } = await (admin.from("certificates") as any)
    .select("certificate_code")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .limit(1);
  if (lookupError) {
    console.error("[events] certificate lookup failed", lookupError);
    return null;
  }
  const found = (existing ?? []) as Array<{ certificate_code: string }>;
  if (found.length > 0) return found[0].certificate_code;

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateCertificateCode();
    const { error } = await (admin.from("certificates") as any).insert({
      event_id: eventId,
      user_id: userId,
      certificate_code: code,
      pdf_url: `/api/certificates/${code}/pdf`,
    });
    if (!error) return code;
    if (error.code !== "23505") {
      console.error("[events] certificate insert failed", error);
      return null;
    }
  }
  return null;
}

/** Member check-in with the rotating code shown on the host screen. */
export async function checkInWithTOTPAction(
  eventId: string,
  inputCode: string
): Promise<ActionResult<CheckInResult>> {
  return guardedAction(async () => {
    const user = await requirePageAccess("events");
    const t = await text();

    const parsed = z.object({ eventId: z.string().uuid(), code: z.string().max(512) }).safeParse({ eventId, code: inputCode });
    if (!parsed.success) return { success: false, error: t.errors.invalidInput };
    const code = normalizeCheckInCode(parsed.data.code);
    if (!code) return { success: false, error: t.errors.codeFormat };
    if (!isSupabaseAdminConfigured()) return { success: false, error: t.errors.notConfigured };

    // A 6-digit code could otherwise be brute-forced here. The shared limiter counts every attempt per
    // member and event, across all server instances.
    if (!(await consumeRateLimit(RATE_LIMITS.checkIn, `${user.id}:${parsed.data.eventId}`))) {
      return { success: false, error: t.errors.tooManyAttempts };
    }

    const event = await getEventSigningRecord(parsed.data.eventId, "check-in");
    if (!event) return { success: false, error: t.errors.eventNotFound };
    if (getEventStatus(event.dateTime) !== "live") return { success: false, error: t.errors.checkInClosed };

    let valid: boolean;
    try {
      valid = verifyEventTOTP(event.id, event.qrSigningSecret, code);
    } catch (error) {
      if (error instanceof QrSigningError) {
        console.error("[events] QR check-in unavailable:", error.message);
        return { success: false, error: t.errors.qrUnavailable };
      }
      throw error;
    }
    if (!valid) return { success: false, error: t.errors.codeInvalid };

    // Members cannot insert attendance through RLS; the server writes it after verifying the code,
    // for the session user only. The unique (event_id, user_id) constraint keeps it to one per event.
    const admin = createAdminClient();
    let alreadyCheckedIn = false;
    const { error: insertError } = await (admin.from("event_attendances") as any).insert({
      event_id: event.id,
      user_id: user.id,
    });
    if (insertError) {
      if (insertError.code !== "23505") {
        console.error("[events] attendance insert failed", insertError);
        return { success: false, error: t.errors.generic };
      }
      alreadyCheckedIn = true;
    }

    const certificateCode = await ensureCertificate(event.id, user.id);

    revalidatePath("/portal/etkinlikler");
    revalidatePath("/portal/sertifikalarim");

    const message = !certificateCode
      ? t.checkIn.successNoCertificate
      : alreadyCheckedIn
        ? t.checkIn.alreadyMessage
        : t.checkIn.successMessage;
    return { success: true, data: { alreadyCheckedIn, certificateCode }, message };
  });
}

/** Current code, QR content and attendee list for the host screen. Requires events.qr_host. */
export async function getEventLiveTOTPAction(eventId: string): Promise<ActionResult<LiveCheckInSnapshot>> {
  return guardedAction(async () => {
    await requirePermission("events.qr_host");
    const t = await text();
    if (!z.string().uuid().safeParse(eventId).success) return { success: false, error: t.errors.invalidInput };
    if (!isSupabaseAdminConfigured()) return { success: false, error: t.errors.notConfigured };

    const event = await getEventSigningRecord(eventId, "host");
    if (!event) return { success: false, error: t.errors.eventNotFound };

    try {
      const totp = generateEventTOTP(event.id, event.qrSigningSecret);
      const attendees = await getEventAttendancesForHost(event.id);
      return {
        success: true,
        data: {
          code: totp.code,
          qrValue: buildCheckInUrl(event.id, totp.code),
          remainingSeconds: totp.remainingSeconds,
          attendees,
        },
      };
    } catch (error) {
      if (error instanceof QrSigningError) {
        console.error("[events] QR code generation unavailable:", error.message);
        return { success: false, error: t.errors.qrUnavailable };
      }
      throw error;
    }
  });
}

/** Creates an event with a fresh random QR signing secret. Requires events.manage. */
export async function createEventAction(input: {
  title: string;
  description: string;
  venue: string;
  dateTime: string;
}): Promise<ActionResult<{ id: string }>> {
  return guardedAction(async () => {
    await requirePermission("events.manage");
    const t = await text();

    const schema = z.object({
      title: z.string().trim().min(3, t.validation.titleLength).max(150, t.validation.titleLength),
      description: z.string().trim().min(10, t.validation.descriptionLength).max(2000, t.validation.descriptionLength),
      venue: z.string().trim().min(2, t.validation.venueLength).max(150, t.validation.venueLength),
      dateTime: z
        .string()
        .max(64)
        .refine((value) => {
          const time = Date.parse(value);
          return !Number.isNaN(time) && time > Date.UTC(2020, 0, 1) && time < Date.UTC(2100, 0, 1);
        }, t.validation.dateTimeInvalid),
    });
    const parsed = schema.safeParse(input);
    if (!parsed.success) return { success: false, error: parsed.error.errors[0]?.message ?? t.errors.invalidInput };
    if (!isSupabaseAdminConfigured()) return { success: false, error: t.errors.notConfigured };

    // Service role after the permission check: RLS on events only knows the "leader" role, while
    // events.manage is also held by admins. Only the id is selected back, never the secret.
    const { data, error } = await (createAdminClient().from("events") as any)
      .insert({
        title: parsed.data.title,
        description: parsed.data.description,
        venue: parsed.data.venue,
        date_time: new Date(parsed.data.dateTime).toISOString(),
        qr_signing_secret: crypto.randomBytes(32).toString("hex"),
      })
      .select("id")
      .single();
    if (error || !data) {
      console.error("[events] create failed", error);
      return { success: false, error: t.errors.generic };
    }

    revalidatePath("/portal/etkinlikler");
    return { success: true, data: { id: (data as { id: string }).id }, message: t.createEvent.created };
  });
}

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

/**
 * Fixed-window rate limits shared by every server instance through the consume_rate_limit Postgres
 * function. Without the service role key, or when the database call fails, a per-instance memory
 * counter takes over, so some limit always applies.
 *
 * Sign-in and sign-up run on the server, so Supabase sees our server's address for every visitor
 * and its own per-IP limits cannot tell visitors apart. These limits use the visitor's address.
 */

export interface RateLimitRule {
  bucket: string;
  limit: number;
  windowSeconds: number;
}

/**
 * Campus Wi-Fi puts many students behind one address, so per-address limits are generous and the
 * per-account limits are the tight ones.
 */
export const RATE_LIMITS = {
  signInPerIp: { bucket: "sign-in:ip", limit: 60, windowSeconds: 10 * 60 },
  signInPerEmail: { bucket: "sign-in:email", limit: 10, windowSeconds: 15 * 60 },
  signUpPerIp: { bucket: "sign-up:ip", limit: 40, windowSeconds: 60 * 60 },
  signUpPerEmail: { bucket: "sign-up:email", limit: 3, windowSeconds: 60 * 60 },
  passwordResetPerIp: { bucket: "password-reset:ip", limit: 40, windowSeconds: 60 * 60 },
  passwordResetPerEmail: { bucket: "password-reset:email", limit: 3, windowSeconds: 60 * 60 },
  checkIn: { bucket: "check-in", limit: 10, windowSeconds: 10 * 60 },
  blogComment: { bucket: "blog-comment", limit: 8, windowSeconds: 5 * 60 },
  certificateVerify: { bucket: "certificate-verify:ip", limit: 60, windowSeconds: 10 * 60 },
  certificatePdf: { bucket: "certificate-pdf:ip", limit: 20, windowSeconds: 10 * 60 },
  /** Header search fires as the member types, so this is per account and generous. */
  portalSearch: { bucket: "portal-search:user", limit: 120, windowSeconds: 5 * 60 },
} as const satisfies Record<string, RateLimitRule>;

const MEMORY_ENTRY_CAP = 10_000;
const memoryCounters = new Map<string, { hits: number; resetAt: number }>();
let warnedAboutDatabase = false;

function consumeInMemory(rule: RateLimitRule, keyHash: string): boolean {
  const now = Date.now();
  if (memoryCounters.size > MEMORY_ENTRY_CAP) {
    for (const [id, entry] of memoryCounters) if (entry.resetAt <= now) memoryCounters.delete(id);
  }
  const id = `${rule.bucket}:${keyHash}`;
  const entry = memoryCounters.get(id);
  if (!entry || entry.resetAt <= now) {
    memoryCounters.set(id, { hits: 1, resetAt: now + rule.windowSeconds * 1000 });
    return rule.limit >= 1;
  }
  entry.hits += 1;
  return entry.hits <= rule.limit;
}

/** Keys are hashed so the table never holds raw addresses or emails. */
function hashKey(rule: RateLimitRule, key: string): string {
  return createHash("sha256").update(`${rule.bucket}\n${key.trim().toLowerCase()}`).digest("hex");
}

/** Counts one request against the rule for this key. Returns false once the limit is used up. */
export async function consumeRateLimit(rule: RateLimitRule, key: string): Promise<boolean> {
  const keyHash = hashKey(rule, key);
  if (isSupabaseAdminConfigured()) {
    try {
      const { data, error } = await (createAdminClient() as any).rpc("consume_rate_limit", {
        p_bucket: rule.bucket,
        p_key_hash: keyHash,
        p_limit: rule.limit,
        p_window_seconds: rule.windowSeconds,
      });
      if (!error && typeof data === "boolean") return data;
      warnDatabaseFallback(error);
    } catch (error) {
      warnDatabaseFallback(error);
    }
  }
  return consumeInMemory(rule, keyHash);
}

/** Logged once per instance: until the migration runs, every request would otherwise log it. */
function warnDatabaseFallback(error: unknown) {
  if (warnedAboutDatabase) return;
  warnedAboutDatabase = true;
  console.error("[rate-limit] database limiter unavailable, using memory counters", error);
}

/** The visitor's address. Vercel sets these headers itself, so clients cannot spoof them there. */
export async function clientIp(): Promise<string> {
  const list = await headers();
  return list.get("x-real-ip")?.trim() || list.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

/** Retry-After value for a 429 response. */
export function retryAfterSeconds(rule: RateLimitRule): string {
  return String(rule.windowSeconds);
}

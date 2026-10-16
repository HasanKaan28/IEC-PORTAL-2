import { createAdminClient } from "@/lib/supabase/server";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { GuardError } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { adminText, type AdminText } from "@/lib/i18n/portal/admin";
import type { Json } from "@/lib/supabase/types";

/**
 * Server-only helpers for admin and blog actions. Not a "use server" module, so nothing here is
 * callable from the browser. Callers must have run requireUser/requirePermission before using
 * privilegedClient(): the service-role client bypasses row level security.
 */

export async function actionText(): Promise<AdminText["actions"]> {
  return adminText[await getServerLocale()].actions;
}

export async function privilegedClient(): Promise<ReturnType<typeof createAdminClient>> {
  if (!isSupabaseAdminConfigured()) {
    throw new GuardError((await actionText()).adminNotConfigured);
  }
  return createAdminClient();
}

/** Appends an audit_logs row attributed to the acting session user. Throws if the insert fails. */
export async function writeAuditLog(
  client: ReturnType<typeof createAdminClient>,
  entry: {
    actorId: string;
    action: string;
    targetType: string;
    targetId: string | null;
    details?: Record<string, Json>;
  }
): Promise<void> {
  const { error } = await (client.from("audit_logs") as any).insert({
    actor_id: entry.actorId,
    action: entry.action,
    target_type: entry.targetType,
    target_id: entry.targetId,
    details: entry.details ?? null,
  });
  if (error) throw error;
}

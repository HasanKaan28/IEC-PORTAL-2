import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/types";

/**
 * Best-effort audit trail for sensitive task and project changes. Written with the user-scoped
 * client: RLS only accepts rows whose actor_id is the caller. A failed log never fails the action.
 */
export async function recordAudit(entry: {
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Json;
}): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await (supabase.from("audit_logs") as any).insert({
      actor_id: entry.actorId,
      action: entry.action,
      target_type: entry.targetType,
      target_id: entry.targetId,
      details: entry.details ?? null,
    });
    if (error) console.error("[audit] insert failed", error);
  } catch (error) {
    console.error("[audit] insert failed", error);
  }
}

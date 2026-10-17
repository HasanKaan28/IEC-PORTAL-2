"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { guardedAction, requirePermission, type ActionResult } from "@/lib/auth/session";
import { privilegedClient, writeAuditLog } from "@/lib/admin/server-utils";
import { getServerLocale } from "@/lib/i18n/server";
import { planningText } from "@/lib/i18n/portal/planning";
import { isPlanDate, PLAN_STATUSES } from "./plan-types";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

const planSchema = z.object({
  monthStart: z.string().refine(isPlanDate),
  weeks: z
    .array(
      z.object({
        week: z.number().int().min(1).max(4),
        titleTr: z.string().trim().min(1).max(120),
        titleEn: optionalText(120),
        bodyTr: optionalText(600),
        bodyEn: optionalText(600),
        status: z.enum(PLAN_STATUSES),
      })
    )
    .length(4)
    .refine((weeks) => new Set(weeks.map((w) => w.week)).size === 4),
});

export type SavePlanInput = z.input<typeof planSchema>;

/** Saves the monthly plan. Needs planning.manage; writes with the service role after that check. */
export async function saveMonthlyPlanAction(input: SavePlanInput): Promise<ActionResult<{ updatedAt: string }>> {
  return guardedAction(async () => {
    const user = await requirePermission("planning.manage");
    const t = planningText[await getServerLocale()];

    if (!isPlanDate(input?.monthStart)) return { success: false, error: t.errors.invalidDate };
    const parsed = planSchema.safeParse(input);
    if (!parsed.success) return { success: false, error: t.errors.invalid };

    const now = new Date().toISOString();
    const admin = await privilegedClient();

    const settings = await (admin.from("monthly_plan") as any).upsert(
      { id: true, month_start: parsed.data.monthStart, updated_by: user.id, updated_at: now },
      { onConflict: "id" }
    );
    if (settings.error) {
      console.error("[planning] settings save failed", settings.error);
      // 42P01: the table does not exist yet (migration not run).
      return { success: false, error: settings.error.code === "42P01" ? t.errors.notSetUp : t.errors.failed };
    }

    const weeks = await (admin.from("monthly_plan_weeks") as any).upsert(
      parsed.data.weeks.map((week) => ({
        week: week.week,
        title_tr: week.titleTr,
        title_en: week.titleEn,
        body_tr: week.bodyTr,
        body_en: week.bodyEn,
        status: week.status,
        updated_at: now,
      })),
      { onConflict: "week" }
    );
    if (weeks.error) {
      console.error("[planning] weeks save failed", weeks.error);
      return { success: false, error: weeks.error.code === "42P01" ? t.errors.notSetUp : t.errors.failed };
    }

    try {
      await writeAuditLog(admin, {
        actorId: user.id,
        action: "planning.update",
        targetType: "monthly_plan",
        targetId: null,
        details: { month_start: parsed.data.monthStart },
      });
    } catch (error) {
      // The plan is saved; a missing audit row should not undo that.
      console.error("[planning] audit log failed", error);
    }

    revalidatePath("/hakkimizda");
    revalidatePath("/portal/planlama");
    return { success: true, data: { updatedAt: now }, message: t.page.saved };
  });
}

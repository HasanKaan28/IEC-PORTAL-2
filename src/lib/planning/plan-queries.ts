import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { currentMonthStart, isPlanDate, PLAN_STATUSES, type MonthlyPlan, type PlanStatusSetting, type PlanWeek } from "./plan-types";

/**
 * Built-in plan, shown until the monthly plan migration has been run or when the database cannot be
 * reached. Mirrors the seed rows in supabase/migrations/20261020000000_monthly_plan.sql.
 */
const DEFAULT_WEEKS: PlanWeek[] = [
  {
    week: 1,
    titleTr: "Akademik danışman ve SKS kaydı",
    titleEn: "Faculty advisor and club registration",
    bodyTr: "Prof. Dr. Leila Miller'ın danışmanlığında, Form F252 ve 12 kurucu üyenin imzasıyla Öğrenci İşleri'ne (SKS/SCC) başvuru.",
    bodyEn: "Application to Student Affairs (SCC) with Form F252, signed by 12 founding members, under the supervision of Prof. Dr. Leila Miller.",
    status: "auto",
  },
  {
    week: 2,
    titleTr: "Linear ve tanışma etkinliği",
    titleEn: "Linear onboarding and kick-off event",
    bodyTr: "Üyelerin Linear'a eklenmesi ve IUS Büyük Amfi'de Marshmallow Challenge ile açılış etkinliği.",
    bodyEn: "Adding members to Linear and an opening Marshmallow Challenge in the IUS Grand Amphitheatre.",
    status: "auto",
  },
  {
    week: 3,
    titleTr: "Haftalık atölyeler ve kampüs konuşmaları",
    titleEn: "Weekly workshops and campus talks",
    bodyTr: "FENS laboratuvarlarında yapay zekâ, gömülü sistemler ve yerel dil modelleri üzerine atölyeler.",
    bodyEn: "Workshops in the FENS labs on AI, embedded systems and locally run language models.",
    status: "auto",
  },
  {
    week: 4,
    titleTr: "DevHack 2027 ve Mühendislik Zirvesi",
    titleEn: "DevHack 2027 and the Engineering Summit",
    bodyTr: "Üniversiteler arası 24 saatlik hackathon ve Saraybosna'daki teknoloji şirketlerinin katılacağı TechSummit 2027.",
    bodyEn: "A 24-hour inter-university hackathon and TechSummit 2027 with tech companies from Sarajevo.",
    status: "auto",
  },
];

function defaultPlan(): MonthlyPlan {
  return { monthStart: currentMonthStart(), weeks: DEFAULT_WEEKS, updatedAt: null, source: "default" };
}

interface WeekRow {
  week: number;
  title_tr: string;
  title_en: string | null;
  body_tr: string | null;
  body_en: string | null;
  status: string;
}

function toStatus(value: string): PlanStatusSetting {
  return (PLAN_STATUSES as readonly string[]).includes(value) ? (value as PlanStatusSetting) : "auto";
}

/** The plan for the About page and the planning editor. Never throws. */
export async function getMonthlyPlan(): Promise<MonthlyPlan> {
  if (!isSupabaseConfigured()) return defaultPlan();
  try {
    const supabase = await createClient();
    const [settingsResult, weeksResult] = await Promise.all([
      (supabase.from("monthly_plan") as any).select("month_start, updated_at").eq("id", true).maybeSingle(),
      (supabase.from("monthly_plan_weeks") as any)
        .select("week, title_tr, title_en, body_tr, body_en, status")
        .order("week", { ascending: true }),
    ]);
    if (settingsResult.error || weeksResult.error) return defaultPlan();

    const rows = (weeksResult.data ?? []) as WeekRow[];
    const byWeek = new Map(rows.filter((row) => row.week >= 1 && row.week <= 4).map((row) => [row.week, row]));
    const weeks: PlanWeek[] = DEFAULT_WEEKS.map((fallback) => {
      const row = byWeek.get(fallback.week);
      if (!row) return fallback;
      return {
        week: fallback.week,
        titleTr: row.title_tr,
        titleEn: row.title_en,
        bodyTr: row.body_tr,
        bodyEn: row.body_en,
        status: toStatus(row.status),
      };
    });

    const settings = settingsResult.data as { month_start: string; updated_at: string } | null;
    const monthStart = settings && isPlanDate(settings.month_start) ? settings.month_start : currentMonthStart();
    return { monthStart, weeks, updatedAt: settings?.updated_at ?? null, source: settings || rows.length ? "db" : "default" };
  } catch (error) {
    console.error("[planning] plan query failed", error);
    return defaultPlan();
  }
}

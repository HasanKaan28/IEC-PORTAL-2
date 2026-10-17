/**
 * The club's one-month plan, split into four weeks (shown on the About page, edited in the portal).
 * Pure types and date helpers, safe for client components. Dates are calendar days ("YYYY-MM-DD")
 * handled in UTC so server and browser always agree; "today" is taken in Sarajevo time.
 */

export const PLAN_STATUSES = ["auto", "planned", "active", "done"] as const;
export type PlanStatusSetting = (typeof PLAN_STATUSES)[number];
export type PlanStatus = Exclude<PlanStatusSetting, "auto">;

export interface PlanWeek {
  week: 1 | 2 | 3 | 4;
  titleTr: string;
  titleEn: string | null;
  bodyTr: string | null;
  bodyEn: string | null;
  /** "auto" follows the calendar; anything else is a manual override. */
  status: PlanStatusSetting;
}

export interface MonthlyPlan {
  /** First day of the plan, YYYY-MM-DD. Week n covers start + 7(n-1) to start + 7n - 1. */
  monthStart: string;
  weeks: PlanWeek[];
  updatedAt: string | null;
  /** "default" means the database has no plan yet and the built-in plan is shown. */
  source: "db" | "default";
}

export interface ResolvedPlanWeek extends PlanWeek {
  startsOn: string;
  endsOn: string;
  effectiveStatus: PlanStatus;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isPlanDate(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_PATTERN.test(value)) return false;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

export function addDays(day: string, days: number): string {
  return new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Today's calendar day in Sarajevo, YYYY-MM-DD. */
export function todayInSarajevo(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Sarajevo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** First day of the current month in Sarajevo, used when no start date has been set yet. */
export function currentMonthStart(now: Date = new Date()): string {
  return `${todayInSarajevo(now).slice(0, 8)}01`;
}

export function resolvePlanWeeks(plan: Pick<MonthlyPlan, "monthStart" | "weeks">, today: string): ResolvedPlanWeek[] {
  return [...plan.weeks]
    .sort((a, b) => a.week - b.week)
    .map((week) => {
      const startsOn = addDays(plan.monthStart, (week.week - 1) * 7);
      const endsOn = addDays(startsOn, 6);
      const automatic: PlanStatus = today < startsOn ? "planned" : today > endsOn ? "done" : "active";
      return { ...week, startsOn, endsOn, effectiveStatus: week.status === "auto" ? automatic : week.status };
    });
}

/**
 * The week's text in the visitor's language, falling back to Turkish when no English was written.
 * Plans are written in Turkish and English only, so Bosnian readers get the English text.
 */
export function weekText(week: PlanWeek, locale: "tr" | "en" | "bs"): { title: string; body: string | null } {
  if (locale !== "tr") {
    return { title: week.titleEn?.trim() || week.titleTr, body: week.bodyEn?.trim() || week.bodyTr };
  }
  return { title: week.titleTr, body: week.bodyTr };
}

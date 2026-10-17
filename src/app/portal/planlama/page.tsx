import type { Metadata } from "next";
import { redirect } from "next/navigation";
import PlanningEditor from "@/components/portal/planning/PlanningEditor";
import { getSessionUser, userCan } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { planningText } from "@/lib/i18n/portal/planning";
import { getMonthlyPlan } from "@/lib/planning/plan-queries";
import { todayInSarajevo } from "@/lib/planning/plan-types";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return { title: planningText[locale].page.metaTitle };
}

export default async function PlanningPage() {
  const user = await getSessionUser();
  if (!user) redirect(`/portal/giris?redirect=${encodeURIComponent("/portal/planlama")}`);
  if (!userCan(user, "planning.manage")) redirect("/portal");

  const plan = await getMonthlyPlan();
  return <PlanningEditor initialPlan={plan} today={todayInSarajevo()} />;
}

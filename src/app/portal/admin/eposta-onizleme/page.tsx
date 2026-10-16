import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import EmailTemplatesClient from "@/components/portal/admin/EmailTemplatesClient";
import { getSessionUser } from "@/lib/auth/session";
import { canAccessAdminSection } from "@/lib/admin/admin-access";
import { getServerLocale } from "@/lib/i18n/server";
import { adminText } from "@/lib/i18n/portal/admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = adminText[await getServerLocale()].emails;
  return { title: t.title, description: t.subtitle };
}

export default async function AdminEmailTemplatesPage() {
  const user = await getSessionUser();
  if (!canAccessAdminSection(user, "emails")) redirect("/portal/admin");

  return <EmailTemplatesClient />;
}

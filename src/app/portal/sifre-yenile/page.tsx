import type { Metadata } from "next";
import ResetPasswordForm from "@/components/portal/auth/ResetPasswordForm";
import { getSessionUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return { title: locale === "en" ? "New password" : "Yeni şifre" };
}

/**
 * Landing page of the reset email. The middleware has already turned the link's one-time code into
 * a session (or sent the visitor back to /portal/sifre-sifirla), so a user is signed in here.
 */
export default async function ResetPasswordPage() {
  const user = await getSessionUser();
  return <ResetPasswordForm configured={isSupabaseConfigured()} email={user?.email ?? null} />;
}

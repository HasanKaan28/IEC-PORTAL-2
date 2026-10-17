import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/portal/auth/ForgotPasswordForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return { title: locale === "en" ? "Reset password" : "Şifre sıfırlama" };
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return <ForgotPasswordForm configured={isSupabaseConfigured()} linkInvalid={params.link === "invalid"} />;
}

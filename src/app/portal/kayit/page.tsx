import type { Metadata } from "next";
import SignUpForm from "@/components/portal/auth/SignUpForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return { title: { tr: "Kayıt", en: "Register", bs: "Registracija" }[locale] };
}

export default function SignUpPage() {
  return <SignUpForm configured={isSupabaseConfigured()} />;
}

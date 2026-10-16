import type { Metadata } from "next";
import SignInForm from "@/components/portal/auth/SignInForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return { title: locale === "en" ? "Sign in" : "Giriş" };
}

/** Only same-site portal paths are allowed after sign-in, so the link cannot bounce users to another site. */
function safeRedirect(value: string | string[] | undefined): string {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith("/portal") || path.startsWith("//") || path.includes("\\")) return "/portal";
  if (path.startsWith("/portal/giris") || path.startsWith("/portal/kayit")) return "/portal";
  return path;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <SignInForm
      configured={isSupabaseConfigured()}
      redirectTo={safeRedirect(params.redirect)}
      justVerified={Boolean(params.code) || params.verified === "1"}
    />
  );
}

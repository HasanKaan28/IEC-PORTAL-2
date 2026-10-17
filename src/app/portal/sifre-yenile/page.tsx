import type { Metadata } from "next";
import ResetPasswordForm from "@/components/portal/auth/ResetPasswordForm";
import { getSessionUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerLocale } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  return { title: { tr: "Yeni şifre", en: "New password", bs: "Nova lozinka" }[locale] };
}

/**
 * Landing page of the reset email. A link from the club template carries `token_hash`, which the
 * form sends along with the new password (see updatePasswordAction). Otherwise the middleware has
 * already opened a recovery session, or sent the visitor back to /portal/sifre-sifirla.
 */
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tokenHash = typeof params.token_hash === "string" ? params.token_hash : null;
  // Until the code is verified we do not know its account, so a session in this browser is not shown.
  const user = tokenHash ? null : await getSessionUser();
  return <ResetPasswordForm configured={isSupabaseConfigured()} email={user?.email ?? null} tokenHash={tokenHash} />;
}

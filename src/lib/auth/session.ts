import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { hasPermission, type Permission, type UserRole } from "@/lib/rbac/permissions";
import { getServerLocale } from "@/lib/i18n/server";

/**
 * Server-side identity for the portal. Every server action and protected page must go through
 * requireUser / requirePermission: server actions are public HTTP endpoints, so the UI hiding a
 * button is never enough. There is no demo or fallback identity.
 */

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
  department: string | null;
  classYear: string | null;
  avatarUrl: string | null;
  roles: UserRole[];
}

export type ActionResult<T = undefined> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

const GUARD_TEXT = {
  tr: {
    notConfigured: "Portal henüz veritabanına bağlı değil. Lütfen daha sonra tekrar deneyin.",
    signInRequired: "Bu işlem için giriş yapmalısınız.",
    forbidden: "Bu işlem için yetkiniz yok.",
    unexpected: "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.",
  },
  en: {
    notConfigured: "The portal is not connected to its database yet. Please try again later.",
    signInRequired: "Please sign in to do this.",
    forbidden: "You do not have permission to do this.",
    unexpected: "Something went wrong. Please try again.",
  },
};

type GuardKey = keyof (typeof GUARD_TEXT)["en"];

/** Thrown by the guards; guardedAction turns it into { success: false, error }. */
export class GuardError extends Error {}

async function guardMessage(key: GuardKey): Promise<string> {
  return GUARD_TEXT[await getServerLocale()][key];
}

/** The signed-in user with profile and roles, or null. Cached per request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) return null;

    const [profileResult, rolesResult] = await Promise.all([
      (supabase.from("profiles") as any)
        .select("full_name, department, class_year, avatar_url")
        .eq("id", user.id)
        .maybeSingle(),
      (supabase.from("user_roles") as any).select("role").eq("user_id", user.id),
    ]);

    const profile = profileResult.data as
      | { full_name: string | null; department: string | null; class_year: string | null; avatar_url: string | null }
      | null;
    const roles = ((rolesResult.data as Array<{ role: UserRole }> | null) ?? []).map((row) => row.role);

    return {
      id: user.id,
      email: user.email,
      fullName: profile?.full_name || user.email.split("@")[0],
      department: profile?.department ?? null,
      classYear: profile?.class_year ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      roles: roles.length > 0 ? roles : ["member"],
    };
  } catch {
    return null;
  }
});

export async function requireUser(): Promise<SessionUser> {
  if (!isSupabaseConfigured()) throw new GuardError(await guardMessage("notConfigured"));
  const user = await getSessionUser();
  if (!user) throw new GuardError(await guardMessage("signInRequired"));
  return user;
}

export async function requirePermission(permission: Permission): Promise<SessionUser> {
  const user = await requireUser();
  if (!hasPermission(user.roles, permission)) throw new GuardError(await guardMessage("forbidden"));
  return user;
}

/** For UI gating (showing admin links etc.). Never a substitute for requirePermission in actions. */
export function userCan(user: SessionUser | null, permission: Permission): boolean {
  return Boolean(user && hasPermission(user.roles, permission));
}

/** Runs a server action body, converting guard failures and unexpected errors into ActionResult. */
export async function guardedAction<T>(body: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await body();
  } catch (error) {
    if (error instanceof GuardError) return { success: false, error: error.message };
    console.error("[action] unexpected error", error);
    return { success: false, error: await guardMessage("unexpected") };
  }
}

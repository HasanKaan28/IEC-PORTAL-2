"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { ALLOWED_EMAIL_DOMAIN, isAllowedStudentEmail } from "@/lib/auth/email-policy";
import { guardedAction, requireUser, type ActionResult } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import type { SupportedLocale } from "@/lib/i18n/translations";
import { SITE_URL } from "@/lib/site-url";
import { OTHER_DEPARTMENT_OPTION, cleanDepartmentName, isAcceptableDepartment } from "@/lib/profile/departments";

const TEXT = {
  tr: {
    notConfigured: "Portal henüz veritabanına bağlı değil; giriş ve kayıt şu an kapalı.",
    nameMin: "Ad soyad en az 2 karakter olmalı.",
    emailInvalid: "Geçerli bir e-posta adresi girin.",
    emailDomain: `Yalnızca @${ALLOWED_EMAIL_DOMAIN} uzantılı öğrenci e-postalarıyla kayıt olunabilir.`,
    passwordMin: "Şifre en az 8 karakter olmalı.",
    passwordRequired: "Şifrenizi girin.",
    departmentRequired: "Bölümünüzü seçin.",
    departmentEnglish: "Diğer bölüm adını İngilizce ve Türkçe karakter kullanmadan yazın (ör. Data Science and Artificial Intelligence).",
    classYearRequired: "Sınıfınızı seçin.",
    kvkkRequired: "KVKK Aydınlatma Metni'ni onaylamanız gerekiyor.",
    signUpDone: "Kayıt alındı. E-posta adresinize gönderilen doğrulama bağlantısına tıklayarak hesabınızı etkinleştirin.",
    invalidCredentials: "E-posta veya şifre hatalı.",
    emailNotConfirmed: "E-posta adresiniz henüz doğrulanmadı. Gelen kutunuzdaki bağlantıya tıklayın.",
    alreadyRegistered: "Bu e-posta adresiyle zaten bir hesap var.",
    urlInvalid: "Geçerli bir bağlantı girin (https://...).",
    profileSaved: "Profiliniz güncellendi.",
    genericError: "İşlem tamamlanamadı. Lütfen tekrar deneyin.",
  },
  en: {
    notConfigured: "The portal is not connected to its database yet; sign-in and registration are closed for now.",
    nameMin: "Full name must be at least 2 characters.",
    emailInvalid: "Enter a valid email address.",
    emailDomain: `Only @${ALLOWED_EMAIL_DOMAIN} student email addresses can register.`,
    passwordMin: "Password must be at least 8 characters.",
    passwordRequired: "Enter your password.",
    departmentRequired: "Select your department.",
    departmentEnglish: "Write the other department's name in English, using plain Latin letters (e.g. Data Science and Artificial Intelligence).",
    classYearRequired: "Select your year of study.",
    kvkkRequired: "You need to accept the KVKK privacy notice.",
    signUpDone: "Registration received. Click the verification link sent to your email to activate your account.",
    invalidCredentials: "Incorrect email or password.",
    emailNotConfirmed: "Your email address is not verified yet. Click the link in your inbox.",
    alreadyRegistered: "An account with this email address already exists.",
    urlInvalid: "Enter a valid link (https://...).",
    profileSaved: "Your profile has been updated.",
    genericError: "Could not complete the request. Please try again.",
  },
} satisfies Record<SupportedLocale, Record<string, string>>;

type AuthText = (typeof TEXT)["en"];

function signUpSchema(t: AuthText) {
  return z.object({
    fullName: z.string().trim().min(2, t.nameMin).max(100),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(t.emailInvalid)
      .refine(isAllowedStudentEmail, t.emailDomain),
    password: z.string().min(8, t.passwordMin).max(128),
    department: z
      .string()
      .trim()
      .min(1, t.departmentRequired)
      .max(80, t.departmentEnglish)
      .refine(isAcceptableDepartment, t.departmentEnglish),
    classYear: z.string().trim().min(1, t.classYearRequired).max(60),
    phone: z.string().trim().max(40).optional(),
    kvkkConsent: z.literal(true, { errorMap: () => ({ message: t.kvkkRequired }) }),
  });
}

function signInSchema(t: AuthText) {
  return z.object({
    email: z.string().trim().toLowerCase().email(t.emailInvalid),
    password: z.string().min(1, t.passwordRequired).max(128),
  });
}

function profileSchema(t: AuthText) {
  // Only web links: a javascript: or data: URL here would end up behind a link on the profile card.
  const optionalUrl = z
    .string()
    .trim()
    .max(300)
    .url(t.urlInvalid)
    .refine((value) => /^https?:\/\//i.test(value), t.urlInvalid)
    .optional()
    .or(z.literal(""));
  return z.object({
    fullName: z.string().trim().min(2, t.nameMin).max(100),
    bio: z.string().max(500).optional(),
    department: z
      .string()
      .trim()
      .max(80, t.departmentEnglish)
      .refine((value) => value === "" || isAcceptableDepartment(value), t.departmentEnglish)
      .optional(),
    classYear: z.string().max(60).optional(),
    linkedinUrl: optionalUrl,
    githubUrl: optionalUrl,
    phone: z.string().max(40).optional(),
    hidePhone: z.boolean(),
    hideEmail: z.boolean(),
  });
}

function firstError(error: z.ZodError): string {
  return error.errors[0]?.message ?? "";
}

/** Maps Supabase auth errors to friendly text without leaking whether an account exists on sign-in. */
function authErrorMessage(message: string, t: AuthText): string {
  const lower = message.toLowerCase();
  if (lower.includes("email not confirmed")) return t.emailNotConfirmed;
  if (lower.includes("already registered") || lower.includes("already exists")) return t.alreadyRegistered;
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) return t.invalidCredentials;
  if (lower.includes("student.ius.edu.ba")) return t.emailDomain;
  return t.genericError;
}

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const t = TEXT[await getServerLocale()];
  if (!isSupabaseConfigured()) return { success: false, error: t.notConfigured };

  // "Other" arrives as a marker plus the typed English name, which is what gets stored.
  const departmentChoice = String(formData.get("department") ?? "");
  const submittedDepartment =
    departmentChoice === OTHER_DEPARTMENT_OPTION
      ? cleanDepartmentName(String(formData.get("departmentOther") ?? ""))
      : departmentChoice;

  const parsed = signUpSchema(t).safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    department: submittedDepartment,
    classYear: formData.get("classYear"),
    phone: (formData.get("phone") as string) || undefined,
    kvkkConsent: formData.get("kvkkConsent") === "on" || formData.get("kvkkConsent") === "true",
  });
  if (!parsed.success) return { success: false, error: firstError(parsed.error) };

  const { fullName, email, password, department, classYear, phone } = parsed.data;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, department, class_year: classYear, phone: phone ?? null },
        emailRedirectTo: `${SITE_URL}/portal/giris`,
      },
    });
    if (error) return { success: false, error: authErrorMessage(error.message, t) };

    // Profile and default member role are created by the on_auth_user_created trigger.
    if (data.user && isSupabaseAdminConfigured()) {
      try {
        await (createAdminClient().from("consent_logs") as any).insert({
          user_id: data.user.id,
          document_type: "kvkk_aydinlatma",
          document_version: "v1.0",
          consented_at: new Date().toISOString(),
        });
      } catch (consentError) {
        console.error("[auth] consent log failed", consentError);
      }
    }
    return { success: true, message: t.signUpDone };
  } catch (error) {
    console.error("[auth] sign-up failed", error);
    return { success: false, error: t.genericError };
  }
}

export async function signInAction(formData: FormData): Promise<ActionResult> {
  const t = TEXT[await getServerLocale()];
  if (!isSupabaseConfigured()) return { success: false, error: t.notConfigured };

  const parsed = signInSchema(t).safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { success: false, error: firstError(parsed.error) };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
    if (error) return { success: false, error: authErrorMessage(error.message, t) };
    if (data.user) await ensureBootstrapSuperAdmin(data.user.id, data.user.email, data.user.email_confirmed_at);
    return { success: true };
  } catch (error) {
    console.error("[auth] sign-in failed", error);
    return { success: false, error: t.genericError };
  }
}

/**
 * Grants super_admin to SUPER_ADMIN_EMAIL, but only after that mailbox has been verified, so nobody
 * can claim the role by registering the address first.
 */
async function ensureBootstrapSuperAdmin(userId: string, email: string | undefined, confirmedAt: string | null | undefined) {
  const bootstrapEmail = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
  if (!bootstrapEmail || !email || !confirmedAt || email.toLowerCase() !== bootstrapEmail) return;
  if (!isSupabaseAdminConfigured()) return;
  try {
    await (createAdminClient().from("user_roles") as any).upsert(
      { user_id: userId, role: "super_admin" },
      { onConflict: "user_id,role", ignoreDuplicates: true }
    );
  } catch (error) {
    console.error("[auth] super admin bootstrap failed", error);
  }
}

export async function signOutAction() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("[auth] sign-out failed", error);
    }
  }
  redirect("/portal/giris");
}

export async function updateProfileAction(input: {
  fullName: string;
  bio?: string;
  department?: string;
  classYear?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  phone?: string;
  hidePhone: boolean;
  hideEmail: boolean;
}): Promise<ActionResult> {
  return guardedAction(async () => {
    const user = await requireUser();
    const t = TEXT[await getServerLocale()];
    const parsed = profileSchema(t).safeParse(input);
    if (!parsed.success) return { success: false, error: firstError(parsed.error) };

    const supabase = await createClient();
    const { error } = await (supabase.from("profiles") as any)
      .update({
        full_name: parsed.data.fullName,
        bio: parsed.data.bio || null,
        department: parsed.data.department || null,
        class_year: parsed.data.classYear || null,
        linkedin_url: parsed.data.linkedinUrl || null,
        github_url: parsed.data.githubUrl || null,
        phone: parsed.data.phone || null,
        hide_phone: parsed.data.hidePhone,
        hide_email: parsed.data.hideEmail,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (error) {
      console.error("[auth] profile update failed", error);
      return { success: false, error: t.genericError };
    }
    return { success: true, message: t.profileSaved };
  });
}

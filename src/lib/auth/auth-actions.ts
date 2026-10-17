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
import { RATE_LIMITS, clientIp, consumeRateLimit } from "@/lib/security/rate-limit";
import { checkSpamTraps } from "@/lib/security/spam-guard";

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
    studentEmailOnly: `Yalnızca @${ALLOWED_EMAIL_DOMAIN} uzantılı öğrenci e-postaları kabul edilir.`,
    passwordMismatch: "Şifreler eşleşmiyor.",
    samePassword: "Yeni şifre eskisinden farklı olmalı.",
    weakPassword: "Bu şifre çok zayıf. Daha uzun ve tahmin edilmesi zor bir şifre seçin.",
    genericError: "İşlem tamamlanamadı. Lütfen tekrar deneyin.",
    tooManyAttempts: "Çok fazla deneme yapıldı. Birkaç dakika bekleyip tekrar deneyin.",
    tooFast: "Form çok hızlı gönderildi. Birkaç saniye bekleyip tekrar deneyin.",
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
    studentEmailOnly: `Only @${ALLOWED_EMAIL_DOMAIN} student email addresses are accepted.`,
    passwordMismatch: "Passwords do not match.",
    samePassword: "The new password must be different from the old one.",
    weakPassword: "This password is too weak. Choose a longer password that is hard to guess.",
    genericError: "Could not complete the request. Please try again.",
    tooManyAttempts: "Too many attempts. Wait a few minutes and try again.",
    tooFast: "The form was sent too quickly. Wait a few seconds and try again.",
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

function passwordResetRequestSchema(t: AuthText) {
  return z.object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email(t.emailInvalid)
      .refine(isAllowedStudentEmail, t.studentEmailOnly),
  });
}

function newPasswordSchema(t: AuthText) {
  return z
    .object({
      password: z.string().min(8, t.passwordMin).max(128),
      confirmPassword: z.string().max(128),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.passwordMismatch,
      path: ["confirmPassword"],
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

/** Supabase refuses a reused password, and a short or breached one, when it is set. */
function passwordUpdateErrorMessage(message: string, t: AuthText): string {
  const lower = message.toLowerCase();
  if (lower.includes("different from the old")) return t.samePassword;
  if (lower.includes("weak") || lower.includes("password should")) return t.weakPassword;
  return t.genericError;
}

export async function signUpAction(formData: FormData): Promise<ActionResult> {
  const t = TEXT[await getServerLocale()];
  if (!isSupabaseConfigured()) return { success: false, error: t.notConfigured };

  // A filled honeypot gets the normal success text, so the bot learns nothing and no email goes out.
  const spam = checkSpamTraps(formData);
  if (spam === "honeypot") return { success: true, message: t.signUpDone };
  if (spam === "too-fast") return { success: false, error: t.tooFast };

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

  // Each sign-up (or repeat for an unverified address) sends an email: cap it per address and inbox.
  const ip = await clientIp();
  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeRateLimit(RATE_LIMITS.signUpPerIp, ip),
    consumeRateLimit(RATE_LIMITS.signUpPerEmail, email),
  ]);
  if (!ipAllowed || !emailAllowed) return { success: false, error: t.tooManyAttempts };

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

  // Password guessing: a tight cap per account, a loose one per address (shared campus Wi-Fi).
  const ip = await clientIp();
  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeRateLimit(RATE_LIMITS.signInPerIp, ip),
    consumeRateLimit(RATE_LIMITS.signInPerEmail, parsed.data.email),
  ]);
  if (!ipAllowed || !emailAllowed) return { success: false, error: t.tooManyAttempts };

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

/**
 * Emails a reset link. The answer is the same whether or not the address has an account, so the
 * form cannot be used to find out who is a member.
 */
export async function requestPasswordResetAction(formData: FormData): Promise<ActionResult> {
  return guardedAction(async () => {
    const t = TEXT[await getServerLocale()];
    if (!isSupabaseConfigured()) return { success: false, error: t.notConfigured };

    const parsed = passwordResetRequestSchema(t).safeParse({ email: formData.get("email") });
    if (!parsed.success) return { success: false, error: firstError(parsed.error) };

    // Each request sends an email. The counters run whether or not the account exists, so hitting
    // the limit says nothing about membership.
    const ip = await clientIp();
    const [ipAllowed, emailAllowed] = await Promise.all([
      consumeRateLimit(RATE_LIMITS.passwordResetPerIp, ip),
      consumeRateLimit(RATE_LIMITS.passwordResetPerEmail, parsed.data.email),
    ]);
    if (!ipAllowed || !emailAllowed) return { success: false, error: t.tooManyAttempts };

    const supabase = await createClient();
    // The link comes back with a one-time code; the middleware turns it into a session on /portal/sifre-yenile.
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${SITE_URL}/portal/sifre-yenile`,
    });
    // Logged only: unknown addresses, rate limits and mail failures all get the neutral answer.
    if (error) console.error("[auth] password reset request failed", error.message);
    return { success: true };
  });
}

/** Sets a new password for the session opened by the reset link, then signs out every other device. */
export async function updatePasswordAction(formData: FormData): Promise<ActionResult> {
  return guardedAction(async () => {
    await requireUser();
    const t = TEXT[await getServerLocale()];
    const parsed = newPasswordSchema(t).safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });
    if (!parsed.success) return { success: false, error: firstError(parsed.error) };

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return { success: false, error: passwordUpdateErrorMessage(error.message, t) };

    // Anyone who knew the old password loses their sessions elsewhere; this browser stays signed in.
    const { error: signOutError } = await supabase.auth.signOut({ scope: "others" });
    if (signOutError) console.error("[auth] revoking other sessions failed", signOutError.message);
    return { success: true };
  });
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

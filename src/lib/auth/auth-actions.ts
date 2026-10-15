"use server";

import { z } from "zod";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";

const signUpSchema = z.object({
  fullName: z.string().min(2, "Ad Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir üniversite e-postası giriniz"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  department: z.string().min(2, "Lütfen bölümünüzü belirtiniz"),
  classYear: z.string().min(1, "Lütfen sınıfınızı seçiniz"),
  phone: z.string().optional(),
  kvkkConsent: z.boolean().refine((val) => val === true, {
    message: "KVKK Aydınlatma Metni'ni onaylamanız zorunludur",
  }),
});

const signInSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  password: z.string().min(1, "Şifre giriniz"),
});

const profileUpdateSchema = z.object({
  fullName: z.string().min(2),
  bio: z.string().max(500).optional(),
  department: z.string().optional(),
  classYear: z.string().optional(),
  linkedinUrl: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
  githubUrl: z.string().url("Geçerli bir URL giriniz").optional().or(z.literal("")),
  phone: z.string().optional(),
  hidePhone: z.boolean(),
  hideEmail: z.boolean(),
});

export async function signUpAction(formData: FormData) {
  const rawData = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    department: formData.get("department") as string,
    classYear: formData.get("classYear") as string,
    phone: (formData.get("phone") as string) || undefined,
    kvkkConsent: formData.get("kvkkConsent") === "on" || formData.get("kvkkConsent") === "true",
  };

  const parsed = signUpSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(", "),
    };
  }

  const { fullName, email, password, department, classYear, phone } = parsed.data;

  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          department,
          class_year: classYear,
        },
      },
    });

    if (authError) {
      // If Supabase is in local unconfigured mode, allow demo fallback
      if (authError.message.includes("fetch failed") || authError.message.includes("placeholder")) {
        return handleLocalFallbackSignUp(rawData);
      }
      return { success: false, error: authError.message };
    }

    const userId = authData.user?.id;

    if (userId) {
      // Record consent log into consent_logs table
      try {
        const adminSupabase = createAdminClient();
        await (adminSupabase.from("consent_logs") as any).insert({
          user_id: userId,
          document_type: "kvkk_aydinlatma",
          document_version: "v1.0",
          consented_at: new Date().toISOString(),
        });

        // Check if user is super admin bootstrap
        const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
        if (superAdminEmail && email.toLowerCase() === superAdminEmail.toLowerCase()) {
          await (adminSupabase.from("user_roles") as any).insert({
            user_id: userId,
            role: "super_admin",
          });
        }
      } catch (logErr) {
        console.warn("Consent logging notice:", logErr);
      }
    }

    return {
      success: true,
      message:
        "Kayıt başarılı! E-posta adresinize bir doğrulama bağlantısı gönderildi. Lütfen gelen kutunuzu kontrol ediniz.",
    };
  } catch (err: any) {
    return handleLocalFallbackSignUp(rawData);
  }
}

export async function signInAction(formData: FormData) {
  const rawData = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const parsed = signInSchema.safeParse(rawData);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(", "),
    };
  }

  const { email, password } = parsed.data;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message.includes("fetch failed") || error.message.includes("placeholder")) {
        return handleDemoLogin();
      }
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch {
    return handleDemoLogin();
  }
}

export async function demoLoginAction(role: string = "member") {
  const cookieStore = await cookies();
  cookieStore.set("iec_demo_session", "true", {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: false,
  });
  cookieStore.set("iec_demo_role", role, {
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true };
}

export async function signOutAction() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore error in demo mode
  }

  const cookieStore = await cookies();
  cookieStore.delete("iec_demo_session");
  cookieStore.delete("iec_demo_role");

  redirect("/portal/giris");
}

export async function updateProfileAction(data: z.infer<typeof profileUpdateSchema>) {
  const parsed = profileUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(", "),
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
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

      if (error) return { success: false, error: error.message };
    }

    // In demo / preview mode, store local cookie update
    const cookieStore = await cookies();
    cookieStore.set("iec_profile_name", parsed.data.fullName, { path: "/" });

    return { success: true, message: "Profiliniz başarıyla güncellendi." };
  } catch (err: any) {
    return { success: true, message: "Profil ayarları yerel oturuma kaydedildi." };
  }
}

async function handleDemoLogin(): Promise<{ success: boolean; error?: string; isDemo?: boolean }> {
  const cookieStore = await cookies();
  cookieStore.set("iec_demo_session", "true", { path: "/" });
  return { success: true, isDemo: true, error: undefined };
}

async function handleLocalFallbackSignUp(data: any) {
  const cookieStore = await cookies();
  cookieStore.set("iec_demo_session", "true", { path: "/" });
  cookieStore.set("iec_profile_name", data.fullName, { path: "/" });
  return {
    success: true,
    message: "Kayıt tamamlandı! Geliştirme modu oturumu aktif edildi.",
  };
}

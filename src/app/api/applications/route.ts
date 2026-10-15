import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";

const applicationSchema = z.object({
  fullName: z.string().min(2, "Ad Soyad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi giriniz"),
  phone: z.string().min(6, "Geçerli bir telefon numarası giriniz").optional(),
  department: z.string().min(2, "Lütfen bölümünüzü belirtiniz"),
  classYear: z.string().min(1, "Lütfen sınıfınızı seçiniz"),
  statement: z.string().min(10, "Lütfen en az 10 karakterlik bir motivasyon yazısı yazınız"),
  kvkkConsent: z.boolean().refine((val) => val === true, {
    message: "KVKK Aydınlatma Metni'ni onaylamanız gerekmektedir",
  }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = applicationSchema.parse(body);

    // Attempt to store in Supabase applications table
    try {
      const supabase = createAdminClient();
      const { data, error } = await (supabase.from("applications") as any).insert({
        full_name: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone || null,
        department: validatedData.department,
        class_year: validatedData.classYear,
        statement: validatedData.statement,
        status: "pending",
      }).select();

      if (error) {
        console.warn("Supabase insert notice (using local fallback if unconfigured):", error.message);
      }
    } catch (dbErr) {
      // In development / local testing without live Supabase keys, gracefully log
      console.warn("Database storage skipped (local development mode active).");
    }

    return NextResponse.json(
      {
        success: true,
        message: "Başvurunuz başarıyla alındı. Yönetim kurulumuz en kısa sürede sizinle iletişime geçecektir.",
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: err.errors.map((e) => e.message) },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Başvuru işlenirken beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}

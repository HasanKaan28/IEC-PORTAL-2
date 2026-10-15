"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { signUpAction } from "@/lib/auth/auth-actions";

export default function RegisterPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signUpAction(formData);

    setLoading(false);

    if (result.success) {
      setSuccessMsg(
        (result as any).message ||
          "Kayıt başarılı! E-posta doğrulaması tamamlandıktan sonra giriş yapabilirsiniz."
      );
      setTimeout(() => {
        router.push("/portal");
        router.refresh();
      }, 2000);
    } else {
      setErrorMsg((result as any).error || "Kayıt sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4 selection:bg-blue-600/20 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
              IEC
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display">
            Öğrenci Portalı Kaydı
          </h1>
          <p className="text-xs text-slate-500">
            Kulüp projelerine, görev yönetimine ve sertifika kasasına katılmak için hesabınızı oluşturun.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-portal-card space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Kayıt Başarılı!</span>
                <span>{successMsg}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ad Soyad <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Ahmet Yılmaz"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Üniversite E-postası <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="student@ius.edu.ba"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Şifre (En az 6 karakter) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>

            {/* Department and Class Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bölüm <span className="text-rose-500">*</span>
                </label>
                <select
                  name="department"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                >
                  <option value="Computer Sciences and Engineering (CSE)">CSE (Bilgisayar)</option>
                  <option value="Software Engineering (SE)">SE (Yazılım)</option>
                  <option value="Electrical and Electronics (EE)">EE (Elektrik-Elektronik)</option>
                  <option value="Mechanical Engineering (ME)">ME (Makine)</option>
                  <option value="Industrial Engineering (IE)">IE (Endüstri)</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sınıf Düzeyi <span className="text-rose-500">*</span>
                </label>
                <select
                  name="classYear"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                >
                  <option value="1. Sınıf">1. Sınıf (Freshman)</option>
                  <option value="2. Sınıf">2. Sınıf (Sophomore)</option>
                  <option value="3. Sınıf">3. Sınıf (Junior)</option>
                  <option value="4. Sınıf">4. Sınıf (Senior)</option>
                  <option value="Hazırlık (ELS)">Hazırlık</option>
                  <option value="Yüksek Lisans">Yüksek Lisans / Doktora</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Telefon / WhatsApp (İsteğe Bağlı)
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="+387 60 ... veya +90 5..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            {/* KVKK Mandatory Checkbox (Strictly required) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  name="kvkkConsent"
                  id="regKvkk"
                  required
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="regKvkk" className="text-[11px] text-slate-600 leading-normal cursor-pointer">
                  <Link href="/kvkk" target="_blank" className="text-blue-600 font-semibold hover:underline">
                    KVKK Aydınlatma Metni
                  </Link>
                  &apos;ni okudum, kişisel verilerimin kulüp faaliyetleri ve üye kayıt defteri kapsamında işlenmesini onaylıyorum. <span className="text-rose-500 font-bold">*</span>
                </label>
              </div>

              {/* Explicit Consent (Separate Checkbox) */}
              <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/70">
                <input
                  type="checkbox"
                  name="marketingConsent"
                  id="regMarketing"
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="regMarketing" className="text-[11px] text-slate-500 leading-normal cursor-pointer">
                  (İsteğe bağlı) Kulüp hackathonları, atölyeler ve teknik iş ilanları hakkında e-posta bildirimleri almayı kabul ediyorum.
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kayıt Oluşturuluyor...</span>
                </>
              ) : (
                <>
                  <span>Hesap Oluştur ve Katıl</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center text-xs text-slate-500">
          Zaten bir hesabınız var mı?{" "}
          <Link
            href="/portal/giris"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Giriş Yapın
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function ApplicationPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    classYear: "1. Sınıf",
    statement: "",
    kvkkConsent: false,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.kvkkConsent) {
      setErrorMsg("Lütfen KVKK Aydınlatma Metni'ni onaylayınız.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(
          data.errors ? data.errors.join(", ") : data.message || "Başvuru gönderilemedi."
        );
      } else {
        setSuccess(true);
      }
    } catch {
      setErrorMsg("Bağlantı hatası oluştu, lütfen tekrar deneyiniz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#070a11]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Form Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-cyan-400 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              <span>2026/2027 GÜZ BAŞVURULARI</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              Kulüp Üyelik & Proje Başvuru Formu
            </h1>
            <p className="mt-3 text-slate-400 text-xs sm:text-sm leading-relaxed">
              Mühendislik topluluğumuza katılarak kampüs projelerinde, hackathonlarda ve teknik atölyelerde aktif rol alabilirsiniz.
            </p>
          </div>

          {/* Form Container */}
          <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl">
            {success ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-glow">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">Başvurunuz Başarıyla Alındı!</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Başvurunuz yönetim kurulumuz ve ilgili komite liderleri tarafından incelenecek. Belirttiğiniz e-posta veya telefon üzerinden sizinle iletişime geçeceğiz.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <Link
                    href="/"
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
                  >
                    Ana Sayfaya Dön
                  </Link>
                  <Link
                    href="/portal"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-glow transition-all"
                  >
                    Öğrenci Portalı
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Ad Soyad <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Ahmet Yılmaz"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      E-posta Adresi <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="student@ius.edu.ba"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Telefon / WhatsApp (İsteğe Bağlı)
                    </label>
                    <input
                      type="tel"
                      placeholder="+387 60 ... veya +90 5..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Department and Class Year */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Bölüm <span className="text-rose-400">*</span>
                    </label>
                    <select
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="">Bölümünüzü seçiniz</option>
                      <option value="Computer Sciences and Engineering (CSE)">Bilgisayar Bilimleri (CSE)</option>
                      <option value="Software Engineering (SE)">Yazılım Mühendisliği (SE)</option>
                      <option value="Electrical and Electronics Engineering (EE)">Elektrik-Elektronik (EE)</option>
                      <option value="Mechanical Engineering (ME)">Makine Mühendisliği (ME)</option>
                      <option value="Industrial Engineering (IE)">Endüstri Mühendisliği (IE)</option>
                      <option value="Diğer Fakülte / Bölüm">Diğer Fakülte / Bölüm</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Sınıf / Düzey <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formData.classYear}
                      onChange={(e) => setFormData({ ...formData, classYear: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
                    >
                      <option value="Hazırlık (ELS)">Hazırlık Okulu (ELS)</option>
                      <option value="1. Sınıf (Freshman)">1. Sınıf (Freshman)</option>
                      <option value="2. Sınıf (Sophomore)">2. Sınıf (Sophomore)</option>
                      <option value="3. Sınıf (Junior)">3. Sınıf (Junior)</option>
                      <option value="4. Sınıf (Senior)">4. Sınıf (Senior)</option>
                      <option value="Master / Doktora">Yüksek Lisans / Doktora</option>
                    </select>
                  </div>
                </div>

                {/* Motivation Statement */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Hangi Proje veya Alanda Rol Almak İstiyorsunuz? <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="İlgi duyduğunuz komite (Donanım, Yazılım/AI, Hackathon, PR), varsa önceki deneyimleriniz veya kulüpten beklentileriniz..."
                    value={formData.statement}
                    onChange={(e) => setFormData({ ...formData, statement: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                {/* KVKK Consent Checkbox */}
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <input
                    type="checkbox"
                    id="kvkk"
                    checked={formData.kvkkConsent}
                    onChange={(e) => setFormData({ ...formData, kvkkConsent: e.target.checked })}
                    className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
                  />
                  <label htmlFor="kvkk" className="text-[11px] text-slate-400 leading-relaxed cursor-pointer">
                    <Link href="/kvkk" target="_blank" className="text-blue-400 hover:underline">
                      KVKK Aydınlatma Metni
                    </Link>
                    &apos;ni okudum, kişisel verilerimin kulüp üyelik ve iletişim süreçleri kapsamında işlenmesini onaylıyorum.
                  </label>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Başvurunuz İletiliyor...</span>
                    </>
                  ) : (
                    <>
                      <span>Başvuruyu Gönder</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

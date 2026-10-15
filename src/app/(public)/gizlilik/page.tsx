import React from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { ShieldAlert, Lock, Eye, FileText } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#070a11]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Legal Warning Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">Hukuki İnceleme Gereklidir (Taslak Belge)</span>
              Bu Gizlilik Politikası metni, IUS Engineering Club (IEC) platformunun teknik altyapısını açıklamak üzere hazırlanmış taslak bir yer tutucudur. Resmi yürürlüğe girmeden önce üniversite hukuk danışmanlığı incelemesi gerekmektedir.
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Gizlilik Politikası (Privacy Policy)
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-2">
              Son Güncelleme: 15 Ekim 2026 • Sürüm: v1.0-draft
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                1. Veri Sorumlusu ve Kapsam
              </h2>
              <p>
                International University of Sarajevo (IUS) bünyesinde faaliyet gösteren IUS Engineering Club (&quot;IEC&quot; veya &quot;Kulüp&quot;), web sitesi ve üye portalı kullanıcılarının gizliliğine saygı duyar. Bu metin, platformumuzu ziyaret eden veya üye olan öğrencilerin kişisel verilerinin nasıl toplandığını, işlendiğini ve korunduğunu açıklar.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-cyan-400" />
                2. Toplanan Kişisel Veriler
              </h2>
              <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
                <li><strong>Kimlik ve İletişim:</strong> Ad, soyad, öğrenci e-postası (@student.ius.edu.ba), telefon numarası.</li>
                <li><strong>Akademik Bilgiler:</strong> Fakülte, bölüm, sınıf seviyesi ve teknik ilgi alanları.</li>
                <li><strong>Etkinlik ve Katılım:</strong> QR kod ile alınan yoklama kayıtları, düzenlenen katılım sertifikaları.</li>
                <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı türü, çerez tercihleri ve platform içi audit/güvenlik kayıtları.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                3. Verilerin İşlenme Amaçları ve Paylaşım
              </h2>
              <p>
                Toplanan veriler yalnızca kulüp içi faaliyetlerin yürütülmesi, proje takımlarının oluşturulması, hackathon başvurularının değerlendirilmesi ve sertifika doğrulaması amacıyla işlenir. Kişisel verileriniz hiçbir üçüncü taraf reklam veya pazarlama şirketine satılmaz veya devredilmez.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">4. Veri Güvenliği ve RLS Koruması</h2>
              <p>
                Tüm veriler, PostgreSQL Row Level Security (RLS) politikaları ile veritabanı seviyesinde korunmakta olup, üye ve yönetim rolleri strictly RBAC (Rol Tabanlı Erişim Kontrolü) ile sınırlandırılmıştır.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

import React from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { Cookie, ShieldAlert, Check } from "lucide-react";

export default function CookiesPage() {
  const cookiesList = [
    {
      name: "sb-auth-token",
      category: "Zorunlu",
      duration: "Oturum / 7 Gün",
      purpose: "Kullanıcı güvenli oturum açma durumunu ve Supabase yetki jetonunu saklar.",
    },
    {
      name: "iec_cookie_consent",
      category: "Zorunlu",
      duration: "1 Yıl",
      purpose: "Kullanıcının çerez tercih ve onay seçimlerini localStorage üzerinde tutar.",
    },
    {
      name: "iec_lang_pref",
      category: "Tercih",
      duration: "6 Ay",
      purpose: "Kullanıcının seçtiği arayüz dilini (TR veya EN) hatırlar.",
    },
    {
      name: "_iec_analytics",
      category: "Analitik (İsteğe Bağlı)",
      duration: "30 Gün",
      purpose: "Proje sayfalarının ve blog yazılarının anonim görüntülenme oranlarını ölçer.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-ink-950">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Legal Warning Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">Hukuki İnceleme Gereklidir (Taslak Çerez Politikası)</span>
              Platformumuzda kullanılan çerezler şeffaf olarak aşağıda sınıflandırılmıştır. Kullanıcılarımız istedikleri an çerez banner&apos;ı üzerinden analitik çerezleri devre dışı bırakabilirler.
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Çerez Politikası (Cookie Policy)
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-2">
              Sürüm: v1.0 • IUS Engineering Club Web Platformu
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Cookie className="w-4 h-4 text-accent-400" />
                1. Çerez (Cookie) Nedir?
              </h2>
              <p>
                Çerezler, bir web sitesini ziyaret ettiğinizde tarayıcınız aracılığıyla cihazınıza kaydedilen küçük metin dosyalarıdır. Platformumuzda çerezler, oturum sürekliliğini sağlamak, güvenlik açıklarını engellemek ve kullanıcı tercihlerini hatırlamak için kullanılmaktadır.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-base font-bold text-white">2. Platformumuzda Kullanılan Çerezler</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="py-2.5 px-3">Çerez Adı</th>
                      <th className="py-2.5 px-3">Kategori</th>
                      <th className="py-2.5 px-3">Süre</th>
                      <th className="py-2.5 px-3">Kullanım Amacı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {cookiesList.map((item, i) => (
                      <tr key={i} className="hover:bg-slate-900/40">
                        <td className="py-3 px-3 font-mono text-accent-300 font-semibold">{item.name}</td>
                        <td className="py-3 px-3 text-slate-300">{item.category}</td>
                        <td className="py-3 px-3 text-slate-400 font-mono">{item.duration}</td>
                        <td className="py-3 px-3 text-slate-300 leading-normal">{item.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">3. Çerez Tercihlerini Değiştirme</h2>
              <p>
                Platformun alt kısmında yer alan çerez banner&apos;ı üzerinden veya tarayıcı ayarlarınızdan (Chrome, Firefox, Safari vb.) çerezleri dilediğiniz zaman silebilir veya isteğe bağlı analitik çerezleri engelleyebilirsiniz.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

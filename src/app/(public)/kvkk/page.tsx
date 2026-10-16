import React from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { ShieldAlert, CheckCircle, Scale, Database } from "lucide-react";

export default function KvkkPage() {
  return (
    <div className="flex flex-col min-h-screen bg-ink-950">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Legal Warning Notice */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-sm">Hukuki İnceleme Gereklidir (Taslak Aydınlatma Metni)</span>
              İşbu KVKK Aydınlatma Metni taslaktır. Kullanıcıların açık rıza ve onay kayıtları veritabanımızdaki <code className="text-amber-300 font-mono">consent_logs</code> tablosunda zaman damgası ve sürüm bilgisiyle saklanmaktadır. Resmi yürürlük öncesinde hukuk birimi onayı alınmalıdır.
            </div>
          </div>

          <div className="text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              KVKK & GDPR Aydınlatma Metni
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-2">
              Belge Sürümü: v1.0 • Son Revizyon: Ekim 2026
            </p>
          </div>

          <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-accent-400" />
                1. Aydınlatma Metninin Amacı
              </h2>
              <p>
                6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) ve Bosna-Hersek Veri Koruma mevzuatı uyarınca, IUS Engineering Club tarafından yürütülen faaliyetler kapsamında elde edilen kişisel verilerinizin işlenme şartları işbu metinle bilgilerinize sunulmaktadır.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-4 h-4 text-accent-400" />
                2. İşlenen Kişisel Veriler ve Hukuki Sebepler
              </h2>
              <p>
                Platforma kayıt esnasında sağlanan kimlik, iletişim, öğrenci numarası ve akademik bölüm bilgileri; kulüp üyeliğinin tesisi, etkinlik organizasyonu ve üniversite mevzuatına uyum amacıyla KVKK m. 5/2-c ve m. 5/2-f bentleri uyarınca işlenmektedir.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-accent-400" />
                3. Onay Kaydı ve Dijital İspat (Consent Logs)
              </h2>
              <p>
                Üyelik veya başvuru formunda işaretlenen KVKK onay kutusu, kullanıcının kullanıcı kimliği (user_id), onaylanan belge sürümü (document_version: &quot;v1.0&quot;), IP adresi ve zaman damgası (consented_at) ile birlikte sistem kayıtlarına (<code className="text-accent-300 font-mono">consent_logs</code>) kriptografik olarak kaydedilir.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-white">4. İlgili Kişinin Hakları</h2>
              <p>
                Her üye ve ziyaretçi, dilediği zaman kulüp yönetimine başvurarak kişisel verilerinin silinmesini, güncellenmesini veya işlenme durumunu sorgulama hakkına sahiptir. Başvurular doğrudan <strong className="text-white">engineering-club@ius.edu.ba</strong> adresine iletilebilir.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

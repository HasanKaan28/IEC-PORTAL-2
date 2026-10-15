import React from "react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import { ShieldCheck, Users, Target, Calendar, ArrowRight, Award, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const leadership = [
    {
      name: "Hasan Kaan Karabulut",
      role: "Kurucu Ortak & Başkan",
      dept: "Bilgisayar Bilimleri (FENS)",
      focus: "Teknik Mimari, Donanım Projeleri (PowerHub) & Topluluk Koordinasyonu",
    },
    {
      name: "Mahmut İhsan Avcı",
      role: "Kurucu Ortak & Başkan Yardımcısı",
      dept: "Yazılım Mühendisliği (FENS)",
      focus: "Operasyonel Süreçler, Linear Yönetimi & Bürokratik Yazışmalar",
    },
    {
      name: "Bekir Enes Çokbekler",
      role: "Sayman & Finans Lideri",
      dept: "Mühendislik & Doğa Bilimleri (FENS)",
      focus: "Bütçe Mimarisi, Şirket Sponsorlukları & Finansal Raporlama",
    },
    {
      name: "Muhammed Efe Ural",
      role: "PR & Medya / Sponsorluk Lideri",
      dept: "Mühendislik Fakültesi (FENS)",
      focus: "Instagram & Sosyal Medya, Görsel Tasarımlar & Kurumsal Ortaklıklar",
    },
  ];

  const milestones = [
    {
      phase: "Milestone 1 (Hafta 1–2)",
      title: "Akademik Danışman & SKS Resmi Kayıt",
      desc: "Prof. Dr. Leila Miller danışmanlığında Form F252 ve kurucu 12 üye imzasıyla Öğrenci İşleri (SKS/SCC) başvurusu.",
      status: "Tamamlandı",
      active: true,
    },
    {
      phase: "Milestone 2 (Hafta 3–4)",
      title: "Linear Çalışma Alanı & Tanışma Etkinliği",
      desc: "Tüm üyelerin Linear platformuna entegrasyonu ve IUS Büyük Amfide Marshmallow Challenge açılış etkinliği.",
      status: "Devam Ediyor",
      active: true,
    },
    {
      phase: "Milestone 3 (Hafta 5–8)",
      title: "Haftalık AI Labs & Kampüs Konferansları",
      desc: "FENS laboratuvarlarında uygulamalı prompt mühendisliği, gömülü sistem atölyeleri ve yerel LLM oturumları.",
      status: "Planlandı",
      active: false,
    },
    {
      phase: "Milestone 4 (Hafta 9–12)",
      title: "DevHack 2027 & Mühendislik Zirvesi",
      desc: "24 saatlik yatılı üniversiteler arası hackathon maratonu ve Saraybosna IT şirketleri katılımıyla TechSummit 2027.",
      status: "Planlandı",
      active: false,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#070a11]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto space-y-20">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-cyan-400 mb-4">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>KURUMSAL KİMLİK & MİSYON</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight">
              IUS Engineering Club Hakkında
            </h1>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              Uluslararası Saraybosna Üniversitesi Mühendislik ve Doğa Bilimleri Fakültesi (FENS) çatısı altında kurulan, üretimi ve inovasyonu merkeze alan öğrenci platformu.
            </p>
          </div>

          {/* Academic Advisor Highlight */}
          <div className="glass-panel p-8 rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-[#070a11] flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 shadow-glow">
              <GraduationCap className="w-10 h-10" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 block mb-1">
                Fakülte Akademik Danışmanımız
              </span>
              <h2 className="text-2xl font-bold text-white font-display">
                Prof. Dr. Leila Miller
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Full Professor Dr. • Faculty of Engineering and Natural Sciences (FENS)
              </p>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Kulübümüzün tüm akademik doğrulamaları, laboratuvar kullanımı izinleri ve üniversite yönetim kurulu koordinasyonu Prof. Dr. Leila Miller rehberliğinde yürütülmektedir.
              </p>
            </div>
          </div>

          {/* Core Leadership Team */}
          <div>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                Yönetim Kurulu Kadromuz
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Kolektif karar alma ve çevik görev dağılımı ile yönetilen kurucu çekirdek ekip.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {leadership.map((member, i) => (
                <div
                  key={i}
                  className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm mb-4">
                      {member.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <h3 className="font-bold text-white text-base">
                      {member.name}
                    </h3>
                    <div className="text-xs font-medium text-cyan-400 mt-0.5">
                      {member.role}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-1">
                      {member.dept}
                    </div>
                    <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                      {member.focus}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 12-Week Roadmap */}
          <div>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">
                12 Haftalık Dönem Faaliyet Planı
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Tüzükte ve resmi SKS başvurusunda yer alan doğrulanmış operasyonel kilometre taşları.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-2xl border border-slate-800/80 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-cyan-400 font-semibold">
                        {m.phase}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                          m.active
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center pt-8 border-t border-slate-900">
            <h3 className="text-xl font-bold text-white">Topluluğumuza Katılmak İster misin?</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Tüm IUS öğrencilerine kapımız açıktır. Formu doldurarak ilk toplantımıza davet alabilirsin.
            </p>
            <div className="mt-5">
              <Link
                href="/basvuru"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition-all"
              >
                <span>Hemen Başvuru Formunu Aç</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

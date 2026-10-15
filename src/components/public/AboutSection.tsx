import React from "react";
import Link from "next/link";
import { ShieldCheck, Compass, Code2, Users2, ArrowRight } from "lucide-react";

export default function AboutSection() {
  const pillars = [
    {
      title: "Multidisipliner Mühendislik",
      desc: "Bilgisayar (CSE), Yazılım (SE), Elektrik-Elektronik (EE) ve Endüstri (IE) disiplinlerini tek ortak donanım-yazılım prototipleme çemberinde buluşturuyoruz.",
      icon: Compass,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
    },
    {
      title: "Yazılım & Yapay Zekâ Komitesi",
      desc: "Modern bulut mimarileri, büyük dil modelleri (LLMs), RAG pipeline'ları ve production-grade full-stack web standartları üzerine haftalık laboratuvarlar düzenliyoruz.",
      icon: Code2,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
    },
    {
      title: "Amiral Gemisi Hackathonlar",
      desc: "Saraybosna genelindeki üniversiteleri IUS çatısı altında buluşturan 24 saatlik kesintisiz DevHack maratonları ve yıllık teknoloji zirveleri organize ediyoruz.",
      icon: Users2,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Akademik & Endüstriyel Köprü",
      desc: "Prof. Dr. Leila Miller danışmanlığında, FENS dekanlığı ve Saraybosna teknoloji ekosistemi (Bit Alliance firmaları) ile doğrudan staj ve mentorluk ağı kuruyoruz.",
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 relative z-10 border-t border-slate-900 bg-[#070a11]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Vision & Philosophy */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400">
              <Compass className="w-3.5 h-3.5" />
              <span>KULÜP VİZYONU & MİMARİSİ</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
              Mühendisliği Yalnızca Okumuyor,{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Üretiyoruz.
              </span>
            </h2>

            <p className="text-slate-400 text-sm leading-relaxed">
              IUS Engineering Club (IEC), Uluslararası Saraybosna Üniversitesi Mühendislik ve Doğa Bilimleri Fakültesi (FENS) öğrencileri tarafından, teorik müfredat ile küresel teknoloji endüstrisi arasındaki boşluğu kapatmak amacıyla kuruldu.
            </p>

            <p className="text-slate-400 text-sm leading-relaxed">
              Kulübümüz, hiyerarşik pasif üyelik yerine Linear tabanlı modern sprintler, açık kaynaklı kod depoları ve üniversite donanım istasyonları ile her üyesine doğrudan üretim sorumluluğu verir.
            </p>

            <div className="pt-2">
              <Link
                href="/hakkimizda"
                className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <span>Tüzük, Yönetim Kurulu ve 12 Haftalık Planı İncele</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: 4 Pillar Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all hover:shadow-glow-subtle flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-10 h-10 rounded-xl ${pillar.bg} border ${pillar.border} flex items-center justify-center ${pillar.color} mb-4`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-white text-base font-display">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

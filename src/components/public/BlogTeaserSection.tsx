import React from "react";
import Link from "next/link";
import { BookOpen, Clock, ArrowRight, Sparkles } from "lucide-react";

export default function BlogTeaserSection() {
  const teaserPosts = [
    {
      slug: "esp32-rfid-iot-station-architecture",
      title: "ESP32 ve RFID ile Otonom Güç İstasyonu Mimarisi",
      excerpt: "IUS PowerHub projesinde SPI bus yönetimi, MQTT telemetrisi ve öğrenci kartı yetkilendirme katmanını nasıl tasarladık?",
      author: "Hasan Kaan Karabulut",
      role: "Donanım Lideri",
      readTime: "5 dk okuma",
      category: "Gömülü Sistemler",
      date: "14 Ekim 2026",
    },
    {
      slug: "linear-task-driven-student-club-management",
      title: "Öğrenci Kulübünü Modern Bir Teknoloji Şirketi Gibi Yönetmek",
      excerpt: "WhatsApp kaosundan Linear sprintlerine geçiş: Görev atama, pull request takibi ve şeffaf bütçe mimarisi.",
      author: "Mahmut İhsan Avcı",
      role: "Başkan Yardımcısı",
      readTime: "4 dk okuma",
      category: "Mühendislik Kültürü",
      date: "12 Ekim 2026",
    },
    {
      slug: "local-rag-ollama-fens-labs",
      title: "FENS Laboratuvarlarında Yerel LLM ve RAG Kurulum Rehberi",
      excerpt: "RTX GPU'lar üzerinde Qwen 2.5 Coder ve Ollama ile kampüs içi gizli veri analiz istasyonu oluşturma adımları.",
      author: "Yazılım & AI Komitesi",
      role: "Araştırma Grubu",
      readTime: "7 dk okuma",
      category: "Yapay Zekâ",
      date: "10 Ekim 2026",
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 relative z-10 border-t border-slate-900 bg-[#070a11]/95">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-400 mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>MÜHENDİSLİK BÜLTENİ & TEKNİK YAZILAR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight">
              Öğrencilerimizden Teknik Makaleler
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-xl">
              Kulüp projelerimizdeki mühendislik zorlukları, donanım mimarileri ve yapay zekâ deneyleri.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>Tüm Makaleleri Gör</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teaserPosts.map((post) => (
            <article
              key={post.slug}
              className="glass-panel p-6 rounded-2xl border border-slate-800/80 hover:border-slate-700 transition-all hover:shadow-glow-subtle flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-mono">
                  <span className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 text-[10px]">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white hover:text-purple-300 transition-colors line-clamp-2">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h3>

                <p className="text-xs text-slate-400 mt-2.5 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-800/50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-200">{post.author}</div>
                  <div className="text-[10px] text-slate-500">{post.role}</div>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{post.date}</span>
              </div>
            </article>
          ))}
        </div>

        {/* Big Bottom CTA Banner */}
        <div className="mt-16 rounded-3xl p-8 sm:p-12 relative overflow-hidden border border-blue-500/30 bg-gradient-to-br from-blue-950/60 via-slate-900/80 to-[#070a11] shadow-glow">
          <div className="relative z-10 max-w-2xl">
            <span className="px-3 py-1 rounded-md bg-blue-500/20 text-blue-300 font-mono text-xs border border-blue-500/30 mb-4 inline-block">
              2026/2027 GÜZ DÖNEMİ KAYITLARI AÇIK
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
              Geleceğin Mühendislik Ekibinde Yerini Al
            </h3>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              İster yazılım, ister gömülü donanım, ister etkinlik organizasyonu olsun; yeteneğine uygun komitede gerçek projelere imza at.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link
                href="/basvuru"
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition-all"
              >
                Kulübe Başvur
              </Link>
              <Link
                href="/portal"
                className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 font-semibold text-xs transition-all"
              >
                Portala Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

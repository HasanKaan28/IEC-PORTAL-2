import React from "react";
import Link from "next/link";
import { Github, Linkedin, Instagram, MessageCircle, Shield, Globe, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-[#05070d] text-slate-400 text-xs py-16 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
        {/* Brand identity column */}
        <div className="md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-glow">
              IEC
            </div>
            <span className="font-bold text-white text-base font-display">
              IUS Engineering Club
            </span>
          </div>

          <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
            International University of Sarajevo (IUS) Mühendislik ve Doğa Bilimleri Fakültesi (FENS) bünyesinde faaliyet gösteren resmi öğrenci mühendislik topluluğu.
          </p>

          <div className="text-[11px] text-slate-500 font-mono space-y-1">
            <p>Hrasnička Cesta 15, 71210 Ilidža, Sarajevo</p>
            <p>Bosna-Hersek • engineering-club@ius.edu.ba</p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-3 pt-2">
            <a
              href="https://github.com/HasanKaan28/ius-engineering-events"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://chat.whatsapp.com/LKMpyfm7K5R3F0rXezcXXN"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 transition-colors"
              aria-label="WhatsApp Community"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Navigation column */}
        <div className="md:col-span-2 space-y-3">
          <span className="font-semibold text-white uppercase tracking-wider text-[11px] block font-mono">
            Keşfet
          </span>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-white transition-colors">
                Ana Sayfa
              </Link>
            </li>
            <li>
              <Link href="/projeler" className="hover:text-white transition-colors">
                Projelerimiz
              </Link>
            </li>
            <li>
              <Link href="/hakkimizda" className="hover:text-white transition-colors">
                Hakkımızda
              </Link>
            </li>
            <li>
              <Link href="/basvuru" className="hover:text-white transition-colors">
                Üyelik Başvurusu
              </Link>
            </li>
            <li>
              <Link href="/portal" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Öğrenci Portalı →
              </Link>
            </li>
          </ul>
        </div>

        {/* Verification & Academic */}
        <div className="md:col-span-2 space-y-3">
          <span className="font-semibold text-white uppercase tracking-wider text-[11px] block font-mono">
            Sertifikasyon
          </span>
          <ul className="space-y-2">
            <li>
              <Link href="/dogrula" className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors">
                <Award className="w-3.5 h-3.5" />
                <span>Sertifika Doğrula</span>
              </Link>
            </li>
            <li>
              <a
                href="https://www.ius.edu.ba/en/faculty-engineering-and-natural-sciences"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors"
              >
                FENS Fakültesi
              </a>
            </li>
            <li>
              <span className="text-slate-500 text-[11px]">Danışman: Prof. Dr. Leila Miller</span>
            </li>
          </ul>
        </div>

        {/* Legal Policies column */}
        <div className="md:col-span-3 space-y-3">
          <span className="font-semibold text-white uppercase tracking-wider text-[11px] block font-mono">
            Yasal & Gizlilik
          </span>
          <ul className="space-y-2">
            <li>
              <Link href="/kvkk" className="hover:text-white transition-colors flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>KVKK Aydınlatma Metni</span>
              </Link>
            </li>
            <li>
              <Link href="/gizlilik" className="hover:text-white transition-colors">
                Gizlilik Politikası
              </Link>
            </li>
            <li>
              <Link href="/cerezler" className="hover:text-white transition-colors">
                Çerez Politikası
              </Link>
            </li>
          </ul>
          <p className="text-[10px] text-slate-500 leading-normal pt-2">
            * Tüm yasal metinler taslak niteliğindedir; hukuki inceleme gerekir.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
        <p>© 2026–2027 IUS Engineering Club (IEC). Tüm hakları saklıdır.</p>
        <p className="font-mono">Engineered with Next.js 15 + Supabase + Tailwind</p>
      </div>
    </footer>
  );
}

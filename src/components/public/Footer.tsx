"use client";

import React from "react";
import Link from "next/link";
import { Github, MessageCircle, Shield, Award } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import ClubLogo from "@/components/shared/ClubLogo";

const SOURCE_CODE_URL = "https://github.com/HasanKaan28/IEC-PORTAL-2";
const WHATSAPP_COMMUNITY_URL = "https://chat.whatsapp.com/LKMpyfm7K5R3F0rXezcXXN";
const FENS_URL = "https://www.ius.edu.ba/en/faculty-engineering-and-natural-sciences";

const linkClass = "hover:text-slate-900 transition-colors";

export default function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-brand-100 bg-linear-to-b/srgb from-transparent to-brand-100/70 text-slate-600 text-sm py-16 px-4 sm:px-6 relative z-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-10">
        <div className="sm:col-span-2 md:col-span-5 space-y-4">
          <div className="flex items-center gap-3">
            <ClubLogo size={44} alt="" />
            <span className="font-bold text-slate-900 text-base font-display">IUS Engineering Club</span>
          </div>

          <p className="max-w-sm leading-relaxed">{t.footer.description}</p>

          <address className="not-italic text-sm space-y-1">
            <p>Hrasnička Cesta 15, 71210 Ilidža, Sarajevo</p>
            <p>{t.footer.country}</p>
            <p>
              <a href="mailto:engineering-club@ius.edu.ba" className={linkClass}>
                engineering-club@ius.edu.ba
              </a>
            </p>
          </address>

          <div className="flex items-center gap-3 pt-1">
            <a
              href={SOURCE_CODE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label={t.footer.sourceCode}
            >
              <Github className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label={t.footer.whatsapp}
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <nav aria-label={t.footer.explore} className="md:col-span-2 space-y-3">
          <h2 className="font-semibold text-slate-900 text-sm">{t.footer.explore}</h2>
          <ul className="space-y-2">
            <li><Link href="/" className={linkClass}>{t.nav.home}</Link></li>
            <li><Link href="/projeler" className={linkClass}>{t.nav.projects}</Link></li>
            <li><Link href="/hakkimizda" className={linkClass}>{t.nav.about}</Link></li>
            <li><Link href="/basvuru" className={linkClass}>{t.footer.membership}</Link></li>
            <li>
              <Link href="/portal" className="text-brand-700 hover:text-slate-900 transition-colors font-medium">
                {t.common.portalButton}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="md:col-span-2 space-y-3">
          <h2 className="font-semibold text-slate-900 text-sm">{t.footer.certification}</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/dogrula" className="inline-flex items-center gap-1.5 text-brand-700 hover:text-slate-900 transition-colors">
                <Award className="w-4 h-4" aria-hidden="true" />
                <span>{t.footer.verifyCertificate}</span>
              </Link>
            </li>
            <li>
              <a href={FENS_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                {t.footer.faculty}
              </a>
            </li>
            <li>{t.footer.advisor}</li>
          </ul>
        </div>

        <div className="md:col-span-3 space-y-3">
          <h2 className="font-semibold text-slate-900 text-sm">{t.footer.legal}</h2>
          <ul className="space-y-2">
            <li>
              <Link href="/kvkk" className={`${linkClass} inline-flex items-center gap-1.5`}>
                <Shield className="w-4 h-4" aria-hidden="true" />
                <span>{t.footer.kvkk}</span>
              </Link>
            </li>
            <li><Link href="/gizlilik" className={linkClass}>{t.footer.privacy}</Link></li>
            <li><Link href="/cerezler" className={linkClass}>{t.footer.cookies}</Link></li>
          </ul>
          <p className="text-xs leading-normal pt-2">{t.footer.legalNote}</p>
        </div>
      </div>

      {/* Laid out like the title block in the corner of an engineering drawing. */}
      <div className="max-w-7xl mx-auto mt-12 grid grid-cols-1 border border-brand-300/70 bg-white/40 font-mono text-xs sm:grid-cols-[auto_1fr_1fr]">
        <div className="flex items-center justify-center border-b border-brand-300/70 p-3 sm:border-b-0 sm:border-r">
          <ClubLogo size={28} alt="" />
        </div>
        <p className="border-b border-brand-300/70 px-4 py-3 sm:border-b-0 sm:border-r">{t.footer.copyright}</p>
        <p className="px-4 py-3">{t.footer.builtWith}</p>
      </div>
    </footer>
  );
}

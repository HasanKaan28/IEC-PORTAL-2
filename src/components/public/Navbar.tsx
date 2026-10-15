"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, Layers, UserCheck } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const pathname = usePathname();

  const toggleLang = () => {
    setLang((prev) => (prev === "tr" ? "en" : "tr"));
  };

  const navLinks = [
    { href: "/", label: lang === "tr" ? "Ana Sayfa" : "Home" },
    { href: "/projeler", label: lang === "tr" ? "Projelerimiz" : "Projects" },
    { href: "/hakkimizda", label: lang === "tr" ? "Hakkımızda" : "About Us" },
    { href: "/basvuru", label: lang === "tr" ? "Başvuru Yap" : "Apply" },
  ];

  return (
    <>
      {/* WCAG Skip to Main Content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none"
      >
        {lang === "tr" ? "İçeriğe Atla" : "Skip to content"}
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070a11]/80 backdrop-blur-xl transition-all">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 p-0.5 shadow-glow transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#070a11] rounded-[10px] flex items-center justify-center font-bold text-xs tracking-wider text-white">
                IEC
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base tracking-tight text-white font-display flex items-center gap-1.5">
                IUS Engineering Club
                <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </span>
              <span className="text-[10px] text-slate-400 font-mono">FENS • International Univ. of Sarajevo</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "text-white bg-slate-800/70 border border-slate-700/60 shadow-sm"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/40"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Language Selector */}
            <LanguageSwitcher />

            {/* Portal Entry Button */}
            <Link
              href="/portal"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{lang === "tr" ? "Portala Gir" : "Enter Portal"}</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex sm:hidden items-center gap-2">
            <LanguageSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none"
              aria-label="Mobil menüyü aç"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-slate-800 bg-[#070a11]/95 px-4 pt-2 pb-6 space-y-2 backdrop-blur-2xl">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/60"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2">
              <Link
                href="/portal"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-glow"
              >
                <span>{lang === "tr" ? "Öğrenci Portalına Gir" : "Enter Student Portal"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

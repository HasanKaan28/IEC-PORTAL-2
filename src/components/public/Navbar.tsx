"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight, UserCheck } from "lucide-react";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import ClubLogo from "@/components/shared/ClubLogo";
import { useLocale } from "@/lib/i18n/locale-context";

const MOBILE_MENU_ID = "mobile-navigation";

interface NavbarProps {
  /** Float the bar over the page hero, fully transparent until the page is scrolled. */
  overlay?: boolean;
}

export default function Navbar({ overlay = false }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { t } = useLocale();

  useEffect(() => {
    const sentinel = topSentinelRef.current;
    if (!overlay || !sentinel) return;
    const observer = new IntersectionObserver(([entry]) => setIsAtTop(entry.isIntersecting));
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [overlay]);

  const isTransparent = overlay && isAtTop && !mobileMenuOpen;
  const headerPosition = overlay ? "fixed inset-x-0 top-0" : "sticky top-0";
  const headerSurface = isTransparent
    ? "border-transparent bg-transparent"
    : "border-brand-100 bg-canvas/80 backdrop-blur-xl";

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/projeler", label: t.nav.projects },
    { href: "/blog", label: t.nav.blog },
    { href: "/hakkimizda", label: t.nav.about },
    { href: "/basvuru", label: t.nav.apply },
  ];
  // Section pages stay highlighted on their sub-pages too (a blog post keeps "Blog" active).
  const isActiveLink = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || Boolean(pathname?.startsWith(`${href}/`));

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileMenuOpen]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-600 focus:text-white focus:rounded-lg focus:shadow-lg"
      >
        {t.common.skipToContent}
      </a>

      {overlay && <div ref={topSentinelRef} aria-hidden="true" className="pointer-events-none absolute top-0 left-0 h-8 w-px" />}

      <header
        className={`${headerPosition} z-40 w-full border-b transition-[background-color,border-color] duration-300 ${headerSurface}`}
      >
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group min-w-0">
            <ClubLogo size={40} priority alt="" className="transition-transform group-hover:scale-105" />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 font-display truncate">
                IUS Engineering Club
              </span>
              <span className="text-xs text-slate-500 truncate">FENS · International Univ. of Sarajevo</span>
            </div>
          </Link>

          <nav aria-label={t.nav.mainNavigation} className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = isActiveLink(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`whitespace-nowrap px-2.5 xl:px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "text-brand-700 bg-brand-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher />
            <Link
              href="/portal"
              className="hidden sm:inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors active:scale-[0.98]"
            >
              <UserCheck className="w-4 h-4" aria-hidden="true" />
              <span>{t.common.portalButton}</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="lg:hidden p-2.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label={mobileMenuOpen ? t.nav.closeMenu : t.nav.openMenu}
              aria-expanded={mobileMenuOpen}
              aria-controls={MOBILE_MENU_ID}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav
            id={MOBILE_MENU_ID}
            aria-label={t.nav.mainNavigation}
            className="lg:hidden border-t border-brand-100 bg-canvas/95 backdrop-blur-xl px-4 pt-2 pb-6 space-y-1 shadow-soft"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActiveLink(link.href) ? "page" : undefined}
                className="block px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-3 sm:hidden">
              <Link
                href="/portal"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white transition-colors"
              >
                <span>{t.common.portalButton}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}

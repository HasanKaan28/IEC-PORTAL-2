"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  FolderGit2,
  Trophy,
  Calendar,
  Award,
  MessageSquare,
  User,
  Shield,
  CalendarRange,
  ArrowUpRight,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import ClubLogo from "@/components/shared/ClubLogo";
import PortalAvatar from "@/components/portal/PortalAvatar";
import { MemberCardProvider } from "@/components/portal/MemberCard";
import { useLocale } from "@/lib/i18n/locale-context";
import { portalShellText } from "@/lib/i18n/portal/shell";
import type { PortalPage } from "@/lib/rbac/page-access";

export interface PortalShellUser {
  fullName: string;
  email: string;
  avatarUrl: string | null;
  roleLabel: string;
  /** Role-controlled pages this member may open (overview and profile are always shown). */
  pages: PortalPage[];
  /** Holds planning.manage: shows Management > Planning. */
  canPlan?: boolean;
}

interface PortalShellProps {
  user: PortalShellUser;
  showAdmin: boolean;
  /** Notification bell, user menu: rendered on the server and slotted into the header. */
  headerActions: React.ReactNode;
  children: React.ReactNode;
}

type NavKey = keyof (typeof portalShellText)["tr"]["shell"]["nav"];

const NAV_ITEMS: Array<{ href: string; key: NavKey; icon: LucideIcon; page?: PortalPage }> = [
  { href: "/portal", key: "dashboard", icon: LayoutDashboard },
  { href: "/portal/gorevler", key: "tasks", icon: CheckSquare, page: "tasks" },
  { href: "/portal/projeler", key: "projects", icon: FolderGit2, page: "projects" },
  { href: "/portal/hackathon", key: "hackathons", icon: Trophy, page: "hackathons" },
  { href: "/portal/etkinlikler", key: "events", icon: Calendar, page: "events" },
  { href: "/portal/sertifikalarim", key: "certificates", icon: Award, page: "certificates" },
  { href: "/portal/mesajlar", key: "messages", icon: MessageSquare, page: "messages" },
  { href: "/portal/profil", key: "profile", icon: User },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/portal") return pathname === "/portal";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  emphasis = false,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  emphasis?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 ${
        active
          ? "bg-brand-50 text-brand-700"
          : emphasis
          ? "text-accent-800 hover:bg-accent-50 hover:text-accent-900"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {active && (
        <span aria-hidden="true" className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-brand-600" />
      )}
      <Icon
        className={`w-4 h-4 shrink-0 ${active ? "text-brand-600" : emphasis ? "text-accent-600" : "text-slate-400 group-hover:text-slate-600"}`}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SidebarContent({ user, showAdmin, pathname }: { user: PortalShellUser; showAdmin: boolean; pathname: string }) {
  const { locale } = useLocale();
  const t = portalShellText[locale].shell;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-5">
        <Link href="/portal" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60">
          <ClubLogo size={36} alt="" />
          <div className="leading-tight">
            <div className="font-display text-sm font-semibold text-slate-900">IUS Engineering Club</div>
            <div className="text-xs text-slate-500">{t.portalName}</div>
          </div>
        </Link>
      </div>

      <nav aria-label={t.mainNav} className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.workspace}</p>
        <ul className="space-y-1">
          {NAV_ITEMS.filter((item) => !item.page || user.pages.includes(item.page)).map((item) => (
            <li key={item.href}>
              <NavLink href={item.href} label={t.nav[item.key]} icon={item.icon} active={isActive(pathname, item.href)} />
            </li>
          ))}
        </ul>

        {(showAdmin || user.canPlan) && (
          <>
            <p className="px-3 pb-2 pt-6 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.management}</p>
            <ul className="space-y-1">
              {showAdmin && (
                <li>
                  <NavLink
                    href="/portal/admin"
                    label={t.adminConsole}
                    icon={Shield}
                    active={isActive(pathname, "/portal/admin")}
                    emphasis
                  />
                </li>
              )}
              {user.canPlan && (
                <li>
                  <NavLink
                    href="/portal/planlama"
                    label={t.planning}
                    icon={CalendarRange}
                    active={isActive(pathname, "/portal/planlama")}
                  />
                </li>
              )}
            </ul>
          </>
        )}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <Link
          href="/"
          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-slate-500 transition-colors hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
        >
          <span>{t.backToSite}</span>
          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
        <Link
          href="/portal/profil"
          className="mt-1 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
        >
          <PortalAvatar name={user.fullName} avatarUrl={user.avatarUrl} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium text-slate-900">{user.fullName}</div>
            <div className="truncate text-xs text-slate-500">{user.roleLabel}</div>
          </div>
        </Link>
      </div>
    </div>
  );
}

/**
 * Portal frame: light sidebar with the club badge, a light working area, and a drawer
 * menu on phones. Identity and permissions are resolved on the server and passed in.
 */
export default function PortalShell({ user, showAdmin, headerActions, children }: PortalShellProps) {
  const pathname = usePathname() ?? "/portal";
  const { locale } = useLocale();
  const t = portalShellText[locale].shell;
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  return (
    <div className="theme-portal bg-portal-flow min-h-screen text-slate-900 antialiased">
      <a
        href="#portal-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-700 focus:shadow-lg"
      >
        {t.skipToContent}
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-brand-100 bg-white/55 backdrop-blur-xl md:block">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(160,194,232,0.4),transparent_70%)]" />
        <div className="relative h-full">
          <SidebarContent user={user} showAdmin={showAdmin} pathname={pathname} />
        </div>
      </aside>

      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true" aria-label={t.mainNav}>
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            aria-label={t.closeMenu}
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative h-full w-72 max-w-[85vw] bg-canvas shadow-soft">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label={t.closeMenu}
              className="absolute right-3 top-4 z-10 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
            <SidebarContent user={user} showAdmin={showAdmin} pathname={pathname} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-col md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-brand-100 bg-white/60 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-white/45 sm:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label={t.openMenu}
              aria-expanded={drawerOpen}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
            </button>
            <Link href="/portal" className="flex items-center gap-2">
              <ClubLogo size={32} alt="" />
              <span className="font-display text-sm font-semibold text-slate-900">{t.portalName}</span>
            </Link>
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2 sm:gap-3">{headerActions}</div>
        </header>

        <main id="portal-main" className="flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8">
          <MemberCardProvider>{children}</MemberCardProvider>
        </main>
      </div>
    </div>
  );
}

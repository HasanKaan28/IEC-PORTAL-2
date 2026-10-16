import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  CheckSquare,
  FolderGit2,
  Trophy,
  Calendar,
  Award,
  MessageSquare,
  Bell,
  Search,
  Shield,
  User,
  ArrowUpRight,
} from "lucide-react";
import PortalHeaderUserMenu from "@/components/portal/PortalHeaderUserMenu";
import PortalNotificationBell from "@/components/portal/PortalNotificationBell";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import ClubLogo from "@/components/shared/ClubLogo";
import { getNotifications } from "@/lib/messages/message-queries";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const notifications = await getNotifications();

  const navItems = [
    { href: "/portal", label: "Genel Bakış", icon: LayoutDashboard },
    { href: "/portal/gorevler", label: "Görevlerim", icon: CheckSquare },
    { href: "/portal/projeler", label: "Projeler", icon: FolderGit2 },
    { href: "/portal/hackathon", label: "Hackathonlar", icon: Trophy },
    { href: "/portal/etkinlikler", label: "Etkinlikler", icon: Calendar },
    { href: "/portal/sertifikalarim", label: "Sertifikalarım", icon: Award },
    { href: "/portal/mesajlar", label: "Mesajlaşma", icon: MessageSquare },
    { href: "/portal/profil", label: "Profilim", icon: User },
  ];

  return (
    <div className="theme-portal min-h-screen bg-[#f8fafc] text-[#0f172a] flex antialiased">
      {/* Sidebar - Clean Linear/Canvas Style */}
      <aside className="w-64 border-r border-[#e2e8f0] bg-white flex flex-col justify-between shrink-0 hidden md:flex">
        <div>
          {/* Logo & Org Brand */}
          <div className="h-16 border-b border-[#e2e8f0] px-5 flex items-center justify-between">
            <Link href="/portal" className="flex items-center gap-2.5">
              <ClubLogo size={32} alt="" />
              <div className="leading-tight">
                <div className="font-semibold text-sm text-slate-900">Öğrenci Portalı</div>
                <div className="text-[11px] text-slate-500 font-mono">v1.0 • IUS</div>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Çalışma Alanı
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <Icon className="w-4 h-4 text-slate-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <div className="pt-4 px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Yönetim
            </div>
            <Link
              href="/portal/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100/70 transition-colors"
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>Yönetici Konsolu</span>
            </Link>
          </nav>
        </div>

        {/* User Card footer */}
        <div className="p-3 border-t border-[#e2e8f0]">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors"
          >
            <span>Ana Siteye Dön</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer mt-1">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 text-xs font-semibold">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-900 truncate">Öğrenci Girişi</div>
              <div className="text-[11px] text-slate-500 truncate">student@ius.edu.ba</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-[#e2e8f0] bg-white px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Görev, proje veya üye ara..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <PortalNotificationBell initialNotifications={notifications} />
            <div className="h-4 w-px bg-slate-200" />
            <PortalHeaderUserMenu />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

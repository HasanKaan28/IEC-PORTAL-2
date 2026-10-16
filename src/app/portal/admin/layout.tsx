"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Users, UserCheck, ScrollText, BarChart3, ArrowLeft, BookOpen, MessageSquare, Mail } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const adminTabs = [
    { href: "/portal/admin", label: "Genel Bakış", icon: BarChart3 },
    { href: "/portal/admin/roller", label: "Rol Yönetimi (RBAC)", icon: Users },
    { href: "/portal/admin/basvurular", label: "Kulüp Başvuruları", icon: UserCheck },
    { href: "/portal/admin/blog", label: "Blog Yazıları", icon: BookOpen },
    { href: "/portal/admin/blog/yorumlar", label: "Yorum Moderasyonu", icon: MessageSquare },
    { href: "/portal/admin/denetim", label: "Denetim Günlüğü", icon: ScrollText },
    { href: "/portal/admin/eposta-onizleme", label: "E-Posta Şablonları", icon: Mail },
  ];

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Admin Top Header Banner */}
      <div className="bg-brand-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-xs font-mono mb-2 text-brand-200 backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-accent-300" />
            <span>YÖNETİM KONSOLU // ADMIN MODE</span>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight">
            IEC Yönetim & Denetim Masası
          </h1>
          <p className="text-xs text-brand-200 mt-1 max-w-xl">
            Üye rolleri, yetkilendirmeler, yeni üyelik başvuruları ve sistem güvenlik kayıtlarını bu ekrandan yönetebilirsiniz.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Portala Dön</span>
          </Link>
        </div>

        {/* Ambient subtle background element */}
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-brand-800 to-transparent pointer-events-none" />
      </div>

      {/* Admin Sub Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto pb-px">
        {adminTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? "border-brand-600 text-brand-600 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <div className="pt-2">{children}</div>
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Mail, MessageSquare, ScrollText, UserCheck, Users } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { adminText } from "@/lib/i18n/portal/admin";
import type { AdminSectionKey } from "@/lib/admin/admin-access";

const ICONS: Record<AdminSectionKey, React.ComponentType<{ className?: string }>> = {
  overview: BarChart3,
  roles: Users,
  applications: UserCheck,
  blog: BookOpen,
  comments: MessageSquare,
  audit: ScrollText,
  emails: Mail,
};

export default function AdminTabs({ items }: { items: { key: AdminSectionKey; href: string }[] }) {
  const pathname = usePathname() ?? "";
  const { locale } = useLocale();
  const t = adminText[locale].layout;

  // The active tab is the one with the longest href that prefixes the current path, so
  // /portal/admin/blog/yorumlar highlights "comments" rather than "blog".
  const activeHref = items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav aria-label={t.navLabel} className="-mx-1 overflow-x-auto">
      <ul className="flex min-w-max gap-1 border-b border-slate-200 px-1">
        {items.map((item) => {
          const Icon = ICONS[item.key];
          const isActive = item.href === activeHref;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`-mb-px flex items-center gap-2 whitespace-nowrap rounded-t-lg border-b-2 px-3.5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                  isActive
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{t.tabs[item.key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

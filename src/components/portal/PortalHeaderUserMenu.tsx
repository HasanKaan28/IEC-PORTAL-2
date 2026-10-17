"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, LogOut, IdCard, ChevronDown } from "lucide-react";
import { signOutAction } from "@/lib/auth/auth-actions";
import DiscordProfileCard, { type ProfileCardData } from "@/components/shared/DiscordProfileCard";
import PortalAvatar from "@/components/portal/PortalAvatar";
import { useLocale } from "@/lib/i18n/locale-context";
import { portalShellText } from "@/lib/i18n/portal/shell";
import type { UserRole } from "@/lib/rbac/permissions";

export interface PortalMenuUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  department: string | null;
  classYear: string | null;
  roles: UserRole[];
  roleLabel: string;
}

export default function PortalHeaderUserMenu({ user }: { user: PortalMenuUser }) {
  const { locale } = useLocale();
  const t = portalShellText[locale].shell;
  const [menuOpen, setMenuOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const cardData: ProfileCardData = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    department: user.department,
    classYear: user.classYear,
    roles: user.roles,
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="flex items-center gap-2 rounded-xl p-1 pr-2 text-left transition-colors hover:bg-slate-100 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500/40"
        aria-expanded={menuOpen}
        aria-haspopup="menu"
        aria-label={t.userMenu}
      >
        <PortalAvatar name={user.fullName} avatarUrl={user.avatarUrl} />
        <div className="hidden leading-tight sm:block">
          <div className="max-w-40 truncate text-sm font-semibold text-slate-800">{user.fullName}</div>
          <div className="max-w-40 truncate text-xs text-slate-500">{user.roleLabel}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      {menuOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-64 rounded-2xl border border-slate-200 bg-white py-1.5 text-sm shadow-xl shadow-slate-900/10"
        >
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="truncate font-semibold text-slate-900">{user.fullName}</div>
            <div className="truncate text-xs text-slate-500">{user.email}</div>
          </div>

          <div className="py-1">
            <Link
              href="/portal/profil"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-slate-700 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-hidden"
            >
              <User className="w-4 h-4 text-slate-400" aria-hidden="true" />
              <span>{t.profileSettings}</span>
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                setCardOpen(true);
              }}
              className="flex w-full items-center gap-2.5 px-4 py-2 text-left text-slate-700 transition-colors hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-hidden"
            >
              <IdCard className="w-4 h-4 text-brand-500" aria-hidden="true" />
              <span>{t.profileCard}</span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-1">
            <form action={signOutAction}>
              <button
                type="submit"
                role="menuitem"
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left font-medium text-rose-600 transition-colors hover:bg-rose-50 focus-visible:bg-rose-50 focus-visible:outline-hidden"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>{t.signOut}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      <DiscordProfileCard user={cardData} isOpen={cardOpen} onClose={() => setCardOpen(false)} />
    </div>
  );
}

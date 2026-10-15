"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, LogOut, Sparkles, ChevronDown, Shield } from "lucide-react";
import { signOutAction } from "@/lib/auth/auth-actions";
import DiscordProfileCard, { ProfileCardData } from "@/components/shared/DiscordProfileCard";

export default function PortalHeaderUserMenu() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cardOpen, setCardOpen] = useState(false);

  const currentUser: ProfileCardData = {
    id: "usr-current",
    fullName: "Kaan Mete Şenyıldız",
    email: "student@ius.edu.ba",
    department: "Bilgisayar Mühendisliği (CSE)",
    classYear: "2. Sınıf",
    bio: "FENS öğrencisi. Donanım ve yapay zekâ odaklı kampüs inovasyonları üzerinde çalışıyor.",
    phone: "+387 60 312 3456",
    roles: ["leader", "project_lead"],
    projects: [
      { name: "IUS PowerHub", role: "Donanım Lideri", accentColor: "#06b6d4" },
      { name: "DevHack 2027", role: "Yürütme Kurulu", accentColor: "#f59e0b" },
    ],
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors text-left"
        aria-expanded={menuOpen}
        aria-label="Kullanıcı Menüsü"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
          KM
        </div>
        <div className="hidden sm:block leading-tight">
          <div className="text-xs font-semibold text-slate-800">Kaan Mete</div>
          <div className="text-[10px] text-slate-500 font-mono">FENS • Lider</div>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-2 border-b border-slate-100">
            <div className="font-semibold text-slate-900">Kaan Mete Şenyıldız</div>
            <div className="text-[11px] text-slate-500 font-mono">student@ius.edu.ba</div>
          </div>

          <div className="py-1">
            <Link
              href="/portal/profil"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User className="w-4 h-4 text-slate-400" />
              <span>Profil Ayarlarım</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setCardOpen(true);
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left"
            >
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span>Discord Profil Kartım</span>
            </button>
          </div>

          <div className="border-t border-slate-100 pt-1">
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Çıkış Yap</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Discord Profile Card Modal */}
      <DiscordProfileCard
        user={currentUser}
        isOpen={cardOpen}
        onClose={() => setCardOpen(false)}
      />
    </div>
  );
}

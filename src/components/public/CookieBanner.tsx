"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, ShieldAlert, Check, ChevronDown, ChevronUp } from "lucide-react";

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
}

export default function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    necessary: true,
    analytics: true,
    preferences: true,
  });

  useEffect(() => {
    // Check if user already made a choice
    const saved = localStorage.getItem("iec_cookie_consent");
    if (!saved) {
      setIsOpen(true);
    }
  }, []);

  const saveConsent = (chosenPrefs: CookiePreferences) => {
    localStorage.setItem("iec_cookie_consent", JSON.stringify(chosenPrefs));
    setIsOpen(false);
  };

  const acceptAll = () => {
    const full = { necessary: true, analytics: true, preferences: true };
    saveConsent(full);
  };

  const rejectOptional = () => {
    const essentialOnly = { necessary: true, analytics: false, preferences: false };
    saveConsent(essentialOnly);
  };

  const saveCustom = () => {
    saveConsent(prefs);
  };

  if (!isOpen) return null;

  return (
    <div
      role="region"
      aria-label="Çerez ve Gizlilik Bildirimi"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 bg-[#0a0d14]/95 border border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-2xl text-slate-300 text-xs animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
          <Cookie className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-white text-sm">
            Çerez ve Gizlilik Tercihleri
          </h4>
          <p className="mt-1 text-slate-400 leading-relaxed text-[11px]">
            Platform deneyiminizi geliştirmek, oturum güvenliğini sağlamak ve kulüp faaliyetlerini anonim olarak analiz etmek için çerezler kullanıyoruz.
          </p>
        </div>
      </div>

      {/* Details drawer */}
      {showDetails && (
        <div className="mt-4 pt-3 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div>
              <span className="font-semibold text-white block text-[11px]">Zorunlu Çerezler</span>
              <span className="text-[10px] text-slate-400">Oturum, güvenlik ve KVKK onay kaydı için zorunludur.</span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Aktif
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div>
              <span className="font-semibold text-white block text-[11px]">Analitik Çerezler</span>
              <span className="text-[10px] text-slate-400">Ziyaretçi sayıları ve proje popülerliği anonim ölçülür.</span>
            </div>
            <input
              type="checkbox"
              checked={prefs.analytics}
              onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
              className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800">
            <div>
              <span className="font-semibold text-white block text-[11px]">Tercih Çerezleri</span>
              <span className="text-[10px] text-slate-400">Seçilen arayüz dili (TR/EN) ve tema ayarları saklanır.</span>
            </div>
            <input
              type="checkbox"
              checked={prefs.preferences}
              onChange={(e) => setPrefs({ ...prefs, preferences: e.target.checked })}
              className="rounded border-slate-700 text-blue-600 focus:ring-0 w-4 h-4"
            />
          </div>
        </div>
      )}

      {/* Legal reference note */}
      <div className="mt-3 text-[10px] text-slate-500 flex items-center justify-between">
        <Link href="/cerezler" className="text-blue-400 hover:underline">
          Çerez Politikası
        </Link>
        <span className="text-slate-600">•</span>
        <Link href="/kvkk" className="text-blue-400 hover:underline">
          KVKK Aydınlatma Metni
        </Link>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-slate-400 hover:text-white flex items-center gap-1 font-mono ml-auto"
        >
          <span>{showDetails ? "Gizle" : "Özelleştir"}</span>
          {showDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
      </div>

      {/* Action buttons */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2 justify-end">
        {showDetails ? (
          <button
            onClick={saveCustom}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Seçimi Kaydet
          </button>
        ) : (
          <button
            onClick={rejectOptional}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-medium text-xs transition-colors"
          >
            Yalnızca Zorunlular
          </button>
        )}

        <button
          onClick={acceptAll}
          className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-glow transition-all"
        >
          Hepsini Kabul Et
        </button>
      </div>
    </div>
  );
}

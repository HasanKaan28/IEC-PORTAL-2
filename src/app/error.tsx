"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Terminal } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected errors
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-950/30 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Sistem Uyarısı • Beklenmeyen Hata</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-black font-mono tracking-tight text-slate-100">
            500
          </h1>
          <h2 className="text-xl font-bold text-slate-200">
            Bir Şeyler Ters Gitti
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            İstek işlenirken geçici bir çalışma zamanı hatası oluştu. Mühendislik ekibimiz bilgilendirildi.
          </p>
          {error?.digest && (
            <p className="text-[11px] font-mono text-slate-600 bg-slate-900/60 py-1 px-2.5 rounded-lg inline-block border border-slate-800">
              Hata Kodu: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium text-xs shadow-lg shadow-amber-500/20 hover:opacity-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yeniden Dene</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 font-medium text-xs transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </Link>
          <Link
            href="/portal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 font-medium text-xs transition-all"
          >
            <Terminal className="w-4 h-4" />
            <span>Portala Dön</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

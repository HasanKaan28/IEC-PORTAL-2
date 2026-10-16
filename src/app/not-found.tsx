import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Compass, Terminal, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 overflow-hidden">
      {/* Background radial glow & grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand-900/20 via-slate-950 to-slate-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4" />
          <span>Hata 404 • Sayfa Bulunamadı</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-7xl md:text-8xl font-black font-mono tracking-tighter bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 font-display">
            Sayfa bulunamadı
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
            Aradığınız sayfa taşınmış ya da kaldırılmış olabilir.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-medium text-xs shadow-lg shadow-brand-500/25 hover:opacity-95 transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <Link
            href="/portal"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 font-medium text-xs transition-all"
          >
            <Terminal className="w-4 h-4" />
            <span>Üye Portalı</span>
          </Link>
        </div>

        {/* Secondary navigation */}
        <div className="pt-6 border-t border-slate-900 flex items-center justify-center gap-6 text-xs text-slate-500">
          <Link href="/projeler" className="hover:text-brand-400 transition-colors">
            Projelerimiz
          </Link>
          <span>•</span>
          <Link href="/blog" className="hover:text-brand-400 transition-colors">
            Blog
          </Link>
          <span>•</span>
          <Link href="/dogrula" className="hover:text-brand-400 transition-colors">
            Sertifika Doğrula
          </Link>
        </div>
      </div>
    </div>
  );
}

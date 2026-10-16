"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Maximize2,
  Minimize2,
  Moon,
  Sun,
  Users,
  Clock,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import QRCode from "qrcode";
import { EventItem, EventAttendanceItem } from "@/lib/events/event-types";
import { getEventLiveTOTPAction } from "@/lib/events/event-actions";

interface LiveAttendancePresenterProps {
  event: EventItem;
  initialCode: string;
  initialPayload: string;
  initialRemaining: number;
  initialAttendees: EventAttendanceItem[];
}

export default function LiveAttendancePresenter({
  event,
  initialCode,
  initialPayload,
  initialRemaining,
  initialAttendees,
}: LiveAttendancePresenterProps) {
  const [code, setCode] = useState(initialCode);
  const [payload, setPayload] = useState(initialPayload);
  const [remaining, setRemaining] = useState(initialRemaining);
  const [attendees, setAttendees] = useState<EventAttendanceItem[]>(initialAttendees);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate QR Code data URL whenever payload updates
  useEffect(() => {
    const generateQr = async () => {
      try {
        const url = await QRCode.toDataURL(payload, {
          width: 400,
          margin: 1,
          color: {
            dark: isDarkMode ? "#ffffff" : "#0f172a",
            light: isDarkMode ? "#00000000" : "#ffffff00",
          },
        });
        setQrDataUrl(url);
      } catch (err) {
        console.error("QR Code generation error:", err);
      }
    };
    generateQr();
  }, [payload, isDarkMode]);

  // Tick timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          // Re-fetch next rotation
          syncLiveTOTP();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Poll server for attendees and sync clock every 6 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      syncLiveTOTP();
    }, 6000);

    return () => clearInterval(pollInterval);
  }, []);

  const syncLiveTOTP = async () => {
    setIsSyncing(true);
    const res = await getEventLiveTOTPAction(event.id);
    setIsSyncing(false);

    if (res.success && res.code) {
      setCode(res.code);
      if (res.payload) setPayload(res.payload);
      if (res.remainingSeconds) setRemaining(res.remainingSeconds);
      if (res.attendees) setAttendees(res.attendees);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Format 6-digit code with a middle space: "482 913"
  const formattedCode =
    code.length === 6 ? `${code.substring(0, 3)} ${code.substring(3)}` : code;

  return (
    <div
      ref={containerRef}
      className={`min-h-screen transition-colors duration-300 flex flex-col justify-between ${
        isDarkMode
          ? "bg-ink-900 text-white selection:bg-brand-500 selection:text-white"
          : "bg-slate-50 text-slate-900 selection:bg-brand-100"
      }`}
    >
      {/* Top HUD Controls */}
      <header
        className={`px-6 py-4 flex items-center justify-between border-b ${
          isDarkMode ? "border-slate-800/80 bg-slate-950/60" : "border-slate-200 bg-white"
        } backdrop-blur-md sticky top-0 z-20`}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/portal/etkinlikler"
            className={`p-2 rounded-xl transition-colors ${
              isDarkMode
                ? "bg-slate-800/80 hover:bg-slate-700 text-slate-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                CANLI PROJEKSİYON EKRANI
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Dinamik TOTP Aktif
              </span>
            </div>
            <h1 className="text-base font-bold truncate max-w-xl mt-0.5">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Projektör / Aydınlık Mod"
            className={`p-2.5 rounded-xl border transition-colors ${
              isDarkMode
                ? "bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800"
                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleFullscreen}
            title="Tam Ekran Modu (Projeksiyon)"
            className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border font-semibold text-xs transition-colors ${
              isDarkMode
                ? "bg-brand-600/20 border-brand-500/40 text-brand-300 hover:bg-brand-600/30"
                : "bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100"
            }`}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
            <span>{isFullscreen ? "Tam Ekrandan Çık" : "Projeksiyon Tam Ekran"}</span>
          </button>
        </div>
      </header>

      {/* Main Showcase Stage */}
      <main className="max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1">
        {/* Left Column: Rotating QR Stage */}
        <div className="lg:col-span-7 flex flex-col items-center text-center space-y-6">
          {/* Circular Countdown Progress */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className={`${isDarkMode ? "stroke-slate-800" : "stroke-slate-200"}`}
                  strokeWidth="3"
                  fill="transparent"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  className="stroke-brand-500 transition-all duration-1000 ease-linear"
                  strokeWidth="3"
                  strokeDasharray={100}
                  strokeDashoffset={100 - (remaining / 60) * 100}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-bold">
                {remaining}
              </span>
            </div>
            <div className="text-left">
              <span className="text-xs text-slate-400 block font-mono">
                KOD YENİLENİYOR:
              </span>
              <span className="text-xs font-semibold text-brand-400">
                {remaining} saniye sonra yeni QR üretilecek
              </span>
            </div>
          </div>

          {/* QR Code Presentation Frame */}
          <div
            className={`p-6 rounded-3xl border shadow-2xl relative group transition-all ${
              isDarkMode
                ? "bg-slate-900/90 border-brand-500/30 shadow-brand-500/10"
                : "bg-white border-slate-200 shadow-xl"
            }`}
          >
            {/* Glowing Corner Accents */}
            <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-2 border-l-2 border-brand-500 rounded-tl-lg" />
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-2 border-r-2 border-brand-500 rounded-tr-lg" />
            <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-2 border-l-2 border-brand-500 rounded-bl-lg" />
            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-2 border-r-2 border-brand-500 rounded-br-lg" />

            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Rotating Event Attendance QR"
                className="w-72 h-72 sm:w-80 sm:h-80 object-contain mx-auto transition-transform duration-300"
              />
            ) : (
              <div className="w-80 h-80 flex items-center justify-center text-slate-500 text-xs font-mono">
                QR Yükleniyor...
              </div>
            )}
          </div>

          {/* Manual Numeric Code Fallback */}
          <div className="space-y-2">
            <span className="text-xs font-mono tracking-widest text-slate-400 block uppercase">
              Kameranız çalışmıyorsa aşağıdaki 6 haneli kodu girin:
            </span>
            <div
              className={`inline-block px-8 py-3.5 rounded-2xl border text-3xl sm:text-4xl font-mono font-black tracking-widest shadow-inner ${
                isDarkMode
                  ? "bg-slate-950 border-brand-500/40 text-brand-300"
                  : "bg-slate-100 border-slate-300 text-brand-700"
              }`}
            >
              {formattedCode}
            </div>
          </div>

          <p className="text-xs text-slate-500 max-w-md">
            🛡️ <strong>Anti-Cheat Koruması</strong>: Bu kod her 60 saniyede bir döner. Ekranın fotoğrafını çekip salonda olmayan arkadaşlarına gönderenlerin kodu geçerliliğini yitirir.
          </p>
        </div>

        {/* Right Column: Live Attendees Stream */}
        <div className="lg:col-span-5 flex flex-col h-full space-y-4">
          <div
            className={`p-5 rounded-2xl border flex items-center justify-between ${
              isDarkMode
                ? "bg-slate-900/60 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-wider text-slate-400 block">
                  ANLIK YOKLAMA ONAYI
                </span>
                <span className="text-xl font-bold text-emerald-400">
                  {attendees.length} Katılımcı
                </span>
              </div>
            </div>

            <span className="text-xs font-mono text-slate-400 bg-slate-800/40 px-2.5 py-1 rounded-lg border border-slate-700/50">
              Salon: {event.venue}
            </span>
          </div>

          {/* Realtime Attendees List */}
          <div
            className={`rounded-2xl border flex-1 p-4 overflow-y-auto max-h-[420px] space-y-2.5 ${
              isDarkMode
                ? "bg-slate-900/40 border-slate-800/70"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/50">
              <span>CANLI KATILIM AKIŞI</span>
              <span>DURUM</span>
            </div>

            {attendees.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <Users className="w-8 h-8 mx-auto opacity-30 animate-pulse" />
                <p>Henüz yoklama veren katılımcı yok.</p>
                <p className="text-[11px] text-slate-600">
                  Öğrenciler QR tarattıkça buraya anında yansıyacaktır.
                </p>
              </div>
            ) : (
              attendees.map((a, i) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all animate-in fade-in slide-in-from-top-2 ${
                    isDarkMode
                      ? "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                      {a.userName.charAt(0)}
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-slate-200 truncate">
                        {a.userName}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {a.userEmail}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                      Onaylandı
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer
        className={`px-6 py-3 border-t text-center text-xs font-mono ${
          isDarkMode
            ? "border-slate-800/80 bg-slate-950/40 text-slate-500"
            : "border-slate-200 bg-white text-slate-400"
        }`}
      >
        IUS Engineering Club • FENS Dinamik Yoklama Motoru • Geri Bildirim: student@ius.edu.ba
      </footer>
    </div>
  );
}

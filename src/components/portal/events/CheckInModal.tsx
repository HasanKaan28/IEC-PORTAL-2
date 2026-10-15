"use client";

import React, { useState } from "react";
import { X, QrCode, CheckCircle2, AlertCircle, Award, ArrowRight } from "lucide-react";
import confetti from "canvas-confetti";
import { EventItem } from "@/lib/events/event-types";
import { checkInWithTOTPAction } from "@/lib/events/event-actions";
import Link from "next/link";

interface CheckInModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (eventId: string, certCode?: string) => void;
}

export default function CheckInModal({
  event,
  isOpen,
  onClose,
  onSuccess,
}: CheckInModalProps) {
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCertCode, setSuccessCertCode] = useState<string | null>(null);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = code.replace(/\s+/g, "");
    if (cleanCode.length < 5) {
      setErrorMsg("Lütfen projeksiyondaki 6 haneli kodu eksiksiz giriniz.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await checkInWithTOTPAction(event.id, cleanCode);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessCertCode(res.certificateCode || "IEC-2026-READY");
      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      onSuccess(event.id, res.certificateCode);
    } else {
      setErrorMsg(res.error || "Yoklama kodu doğrulanamadı.");
    }
  };

  const handleClose = () => {
    setCode("");
    setErrorMsg(null);
    setSuccessCertCode(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Dinamik QR / Kod ile Yoklama Ver
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">{event.title}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {successCertCode ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Yoklamanız Başarıyla Onaylandı!
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Etkinlik katılımınız sisteme işlendi ve resmi IEC başarı sertifikanız üretildi.
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl inline-block">
                <span className="text-[10px] text-slate-400 font-mono block">
                  SERTİFİKA DOĞRULAMA KODU:
                </span>
                <span className="text-sm font-mono font-bold text-indigo-600">
                  {successCertCode}
                </span>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/portal/sertifikalarim"
                  onClick={handleClose}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Award className="w-4 h-4" />
                  <span>Sertifikalarıma Git & İndir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={handleClose}
                  className="w-full py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
                <span className="font-semibold block mb-0.5">⏱ 60 Saniyede Bir Dönen Kod:</span>
                Organizatörün amfitiyatro projeksiyonunda yansıttığı 6 haneli kodu giriniz. Kod her dakika otomatik yenilenir.
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  6 Haneli Yoklama Kodu
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  maxLength={7}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Örn: 482 913"
                  className="w-full text-center tracking-widest text-xl font-mono font-bold py-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-slate-50/50"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? "Kontrol Ediliyor..." : "Yoklamayı Onayla"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

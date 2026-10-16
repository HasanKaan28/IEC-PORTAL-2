"use client";

import React, { useState } from "react";
import {
  X,
  Download,
  Share2,
  Check,
  Copy,
  ExternalLink,
  Award,
  ShieldCheck,
  QrCode,
} from "lucide-react";
import { CertificateItem } from "@/lib/events/event-types";
import { generateLinkedInCertUrl } from "@/lib/certificates/certificate-pdf";

interface CertificatePreviewModalProps {
  cert: CertificateItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CertificatePreviewModal({
  cert,
  isOpen,
  onClose,
}: CertificatePreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !cert) return null;

  const linkedInUrl = generateLinkedInCertUrl(cert);
  const verifyUrl = cert.verifyUrl || `http://localhost:3000/dogrula?code=${cert.certificateCode}`;

  const copyVerifyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Resmi Başarı Sertifikası Önizleme
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">
                KOD: {cert.certificateCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/api/certificates/${cert.certificateCode}/pdf`}
              target="_blank"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF İndir</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Visual Presentation Frame */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100/60 flex items-center justify-center">
          <div className="w-full max-w-3xl bg-white rounded-2xl border-4 border-slate-900 p-6 sm:p-10 shadow-2xl relative text-center space-y-6">
            {/* Inner Gold Border */}
            <div className="absolute inset-2.5 border-2 border-amber-500/60 rounded-xl pointer-events-none" />

            {/* Header */}
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
                INTERNATIONAL UNIVERSITY OF SARAJEVO • FENS
              </p>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display tracking-tight">
                IUS ENGINEERING CLUB
              </h2>
              <div className="pt-2">
                <span className="text-xs sm:text-sm font-serif font-bold text-amber-700 uppercase tracking-widest border-b border-amber-300 pb-0.5">
                  CERTIFICATE OF ACHIEVEMENT
                </span>
              </div>
            </div>

            {/* Recipient */}
            <div className="space-y-1 pt-2">
              <p className="text-xs text-slate-500 font-serif italic">
                This official credential is hereby conferred upon
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display tracking-tight">
                {cert.userName}
              </h1>
              <p className="text-xs text-slate-600 font-serif max-w-lg mx-auto pt-1">
                for outstanding participation and successful completion of the engineering event
              </p>
              <p className="text-base sm:text-lg font-bold text-indigo-700 font-display">
                "{cert.eventTitle}"
              </p>
            </div>

            {/* Hours & Date */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-500 font-mono">
              <span>Eğitim Süresi: {cert.trainingHours} Saat</span>
              <span>•</span>
              <span>Veriliş Tarihi: {cert.issueDate}</span>
              <span>•</span>
              <span className="text-amber-700 font-bold">Resmi Doğrulanmış</span>
            </div>

            {/* Skills Pills */}
            {cert.skills.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                {cert.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono text-slate-700 border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}

            {/* Signatures & Seal Footer */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-2 items-end text-center">
              {/* Advisor Signature */}
              <div className="space-y-0.5">
                <div className="w-24 sm:w-32 mx-auto border-b border-slate-400 pb-1 text-[11px] font-serif font-bold text-slate-800">
                  Prof. Dr. Leila Miller
                </div>
                <p className="text-[9px] text-slate-500 font-mono">
                  Akademik Danışman, FENS
                </p>
              </div>

              {/* Official Stamp */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-amber-600/60 bg-amber-50 text-amber-700 flex flex-col items-center justify-center text-[8px] font-mono font-bold leading-none p-1">
                  <span>IEC</span>
                  <ShieldCheck className="w-4 h-4 my-0.5 text-amber-600" />
                  <span>SEAL</span>
                </div>
                <span className="text-[9px] font-mono text-amber-800 font-semibold mt-1">
                  {cert.certificateCode}
                </span>
              </div>

              {/* President Signature */}
              <div className="space-y-0.5">
                <div className="w-24 sm:w-32 mx-auto border-b border-slate-400 pb-1 text-[11px] font-serif font-bold text-slate-800">
                  Kaan Mete Şenyıldız
                </div>
                <p className="text-[9px] text-slate-500 font-mono">
                  Kulüp Başkanı
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 sm:px-6 border-t border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={copyVerifyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Bağlantı Kopyalandı!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Doğrulama Linkini Kopyala</span>
                </>
              )}
            </button>
            <a
              href={`/dogrula?code=${cert.certificateCode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Doğrulama Sayfasına Git</span>
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={linkedInUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>LinkedIn Profiline Ekle</span>
            </a>
            <a
              href={`/api/certificates/${cert.certificateCode}/pdf`}
              download
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>PDF İndir</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

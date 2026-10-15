"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Award,
  Search,
  CheckCircle2,
  ShieldAlert,
  Download,
  Share2,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Building,
} from "lucide-react";
import { CertificateItem } from "@/lib/events/event-types";
import { generateLinkedInCertUrl } from "@/lib/certificates/certificate-pdf";

export default function CertificateVerificationClient() {
  const searchParams = useSearchParams();
  const urlCode = searchParams.get("code") || "";

  const [code, setCode] = useState(urlCode);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<{
    verified: boolean;
    cert?: CertificateItem;
  } | null>(null);

  // Auto-verify if code is in URL
  useEffect(() => {
    if (urlCode && urlCode.trim().length >= 4) {
      handleVerifyCode(urlCode.trim());
    }
  }, [urlCode]);

  const handleVerifyCode = async (codeToVerify: string) => {
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/certificates/verify?code=${encodeURIComponent(codeToVerify)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.verified && data.cert) {
          setResult({ verified: true, cert: data.cert });
        } else {
          setResult({ verified: false });
        }
      } else {
        setResult({ verified: false });
      }
    } catch {
      setResult({ verified: false });
    }
    setIsVerifying(false);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    handleVerifyCode(code.trim());
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>RESMİ DİJİTAL DOĞRULAMA PORTALI</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-display tracking-tight">
          Sertifika Doğrulama Portalı
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
          IUS Engineering Club ve FENS tarafından verilen etkinlik, atölye ve hackathon sertifikalarının geçerliliğini benzersiz kod ile anında sorgulayın.
        </p>
      </div>

      {/* Verification Search Box */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-md">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 font-mono">
              SERTİFİKA DOĞRULAMA KODU:
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Örn: IEC-2026-E49A"
                className="w-full px-4 py-3.5 bg-slate-950 border border-slate-700/80 rounded-2xl text-sm font-mono uppercase text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all tracking-wider"
              />
              <button
                type="submit"
                disabled={isVerifying}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg transition-all disabled:opacity-50"
              >
                {isVerifying ? "Doğrulanıyor..." : "Sorgula"}
              </button>
            </div>
          </div>
        </form>

        {/* Verification Result Showcase */}
        {result && (
          <div className="mt-8 pt-6 border-t border-slate-800/80 animate-in fade-in duration-300">
            {result.verified && result.cert ? (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/40 to-slate-950 border border-emerald-500/40 shadow-xl space-y-6">
                {/* Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/40">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white font-display">
                        Sertifika Resmi Olarak Doğrulandı & Geçerli
                      </h4>
                      <p className="text-xs text-emerald-400/90 font-mono">
                        KOD: {result.cert.certificateCode}
                      </p>
                    </div>
                  </div>

                  <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    %100 ONAYLI BELGE
                  </span>
                </div>

                {/* Credential Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      SERTİFİKA SAHİBİ
                    </span>
                    <p className="text-sm font-bold text-white">{result.cert.userName}</p>
                    <p className="text-[11px] text-slate-400">{result.cert.userDepartment}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-500" />
                      ETKİNLİK / EĞİTİM
                    </span>
                    <p className="text-sm font-bold text-indigo-300">{result.cert.eventTitle}</p>
                    <p className="text-[11px] text-slate-400">
                      Eğitmen: {result.cert.instructorName}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      VERİLİŞ TARİHİ
                    </span>
                    <p className="text-sm font-bold text-slate-200">{result.cert.issueDate}</p>
                    <p className="text-[11px] text-slate-400">
                      Tamamlanan Süre: {result.cert.trainingHours} Saat
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      DÜZENLEYEN KURUM
                    </span>
                    <p className="text-sm font-bold text-slate-200">
                      IUS Engineering Club & FENS
                    </p>
                    <p className="text-[11px] text-slate-400">
                      International University of Sarajevo
                    </p>
                  </div>
                </div>

                {/* Skills Tags */}
                {result.cert.skills.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      DOĞRULANAN MÜHENDİSLİK YETENEKLERİ:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.cert.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-slate-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t border-emerald-500/20 flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={`/api/certificates/${result.cert.certificateCode}/pdf`}
                    download
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Resmi Vektör PDF İndir</span>
                  </a>

                  <a
                    href={generateLinkedInCertUrl(result.cert)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold shadow-md transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>LinkedIn Profiline Ekle</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3.5 text-xs">
                <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-sm text-white block">
                    Sertifika Kaydı Bulunamadı
                  </span>
                  <p className="text-rose-300/90 leading-relaxed">
                    Girilen doğrulama kodu (<strong>{code.toUpperCase()}</strong>) sistemde kayıtlı aktif bir sertifika ile eşleşmemektedir. Lütfen kodu kontrol ediniz veya kulüp yönetimi ile iletişime geçiniz.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

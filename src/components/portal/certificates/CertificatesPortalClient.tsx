"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Award,
  Download,
  Share2,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Eye,
} from "lucide-react";
import { CertificateItem } from "@/lib/events/event-types";
import { generateLinkedInCertUrl } from "@/lib/certificates/certificate-pdf";
import CertificatePreviewModal from "./CertificatePreviewModal";

interface CertificatesPortalClientProps {
  initialCertificates: CertificateItem[];
}

export default function CertificatesPortalClient({
  initialCertificates,
}: CertificatesPortalClientProps) {
  const [certificates, setCertificates] = useState<CertificateItem[]>(initialCertificates);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCertificates = certificates.filter(
    (c) =>
      c.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.certificateCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalHours = certificates.reduce((acc, c) => acc + (c.trainingHours || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Başarı & Katılım Sertifikalarım
            </h1>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {certificates.length} Sertifika
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Katıldığınız atölye, seminer ve hackathonlar için üretilen resmi, kriptografik olarak doğrulanabilir ve LinkedIn uyumlu başarı belgeleriniz.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dogrula"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            <span>Doğrulama Portalı</span>
          </Link>
          <Link
            href="/portal/etkinlikler"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Etkinliklere Katıl</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 block">TOPLAM SERTİFİKA</span>
            <span className="text-lg font-bold text-slate-900">{certificates.length} Adet</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 block">KAZANILAN EĞİTİM</span>
            <span className="text-lg font-bold text-slate-900">{totalHours} Saat Pratik</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 block">DOĞRULAMA DURUMU</span>
            <span className="text-lg font-bold text-emerald-600">%100 Dijital İmzalı</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Sertifika adı, kod (Örn: IEC-2026-E49A) veya yetenek ara..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      {/* Certificates Grid */}
      {filteredCertificates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8 opacity-40" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Henüz Tamamlanan Sertifikanız Bulunmuyor
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Kulüp etkinliklerine katılarak salondaki 60 saniyelik dinamik QR kodu taratın ve anında başarı sertifikanızı kazanın!
            </p>
          </div>
          <Link
            href="/portal/etkinlikler"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Yaklaşan Etkinlikleri İncele</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredCertificates.map((cert) => {
            const linkedInUrl = generateLinkedInCertUrl(cert);

            return (
              <div
                key={cert.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group relative overflow-hidden"
              >
                {/* Gold Accent Top Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-600 to-amber-500" />

                <div className="space-y-3 pt-1">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-mono font-bold text-[10px]">
                      {cert.certificateCode}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cert.trainingHours} Saat Eğitim</span>
                    </span>
                  </div>

                  {/* Title & Event */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                      {cert.eventTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span>Katılımcı: <strong className="text-slate-800">{cert.userName}</strong></span>
                      <span>•</span>
                      <span>Tarih: {cert.issueDate}</span>
                    </div>
                  </div>

                  {/* Skills Tag Pills */}
                  {cert.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {cert.skills.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[10px] font-mono text-slate-600"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Önizle</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="LinkedIn Profiline Lisans Olarak Ekle"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-semibold shadow-2xs transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">LinkedIn</span>
                    </a>
                    <a
                      href={`/api/certificates/${cert.certificateCode}/pdf`}
                      download
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF İndir</span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      <CertificatePreviewModal
        cert={selectedCert}
        isOpen={Boolean(selectedCert)}
        onClose={() => setSelectedCert(null)}
      />
    </div>
  );
}

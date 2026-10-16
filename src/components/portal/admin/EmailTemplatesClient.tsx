"use client";

import React, { useState } from "react";
import {
  Mail,
  Copy,
  Check,
  Eye,
  Smartphone,
  Monitor,
  Sparkles,
  Send,
  ExternalLink,
} from "lucide-react";
import {
  renderEmailTemplate,
  EmailTemplateKey,
} from "@/lib/emails/email-templates";

export default function EmailTemplatesClient() {
  const [activeTemplate, setActiveTemplate] = useState<EmailTemplateKey>("welcome");
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  const sampleData = {
    recipientName: "Kaan Mete Şenyıldız",
    recipientEmail: "student@ius.edu.ba",
    actionUrl: "http://localhost:3000/portal",
    eventTitle: "FreeRTOS & ESP32 Gömülü Sistemler Masterclass",
    eventDate: "24 Ekim 2026, 14:00",
    eventVenue: "IUS A-Block Donanım Laboratuvarı 102",
    certificateCode: "IEC-2026-E49A",
    trainingHours: 6,
  };

  const rendered = renderEmailTemplate(activeTemplate, sampleData);

  const copyHtml = () => {
    navigator.clipboard.writeText(rendered.html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const templates: { key: EmailTemplateKey; label: string; desc: string }[] = [
    {
      key: "welcome",
      label: "Hoş Geldiniz & Doğrulama",
      desc: "Kayıt olan yeni üyeye giden hesap aktivasyon e-postası.",
    },
    {
      key: "application_approved",
      label: "Başvuru Kabul Mektubu",
      desc: "Yönetim kurulu tarafından onaylanan aday üyelere iletilen tebrik mektubu.",
    },
    {
      key: "event_reminder",
      label: "Etkinlik Hatırlatıcı",
      desc: "Etkinlikten 24 saat önce salonda QR yoklama hatırlatması yapan şablon.",
    },
    {
      key: "certificate_issued",
      label: "Sertifika Teslimi",
      desc: "Yoklaması tamamlanan üyeye kod ve indirme bağlantısı ileten bildirim.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Sistem E-posta Şablonları & Önizleme
            </h1>
            <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
              Supabase & Resend Uyumlu
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Kulüp platformunun otomatik olarak gönderdiği kurumsal HTML e-posta şablonlarını inceleyin ve ham kodlarını kopyalayın.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Width Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              onClick={() => setViewMode("desktop")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "desktop"
                  ? "bg-white text-brand-600 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Masaüstü Görünüm"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "mobile"
                  ? "bg-white text-brand-600 shadow-2xs font-semibold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
              title="Mobil Görünüm"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={copyHtml}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Kopyalandı!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>HTML Kodunu Kopyala</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Template Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {templates.map((t) => {
          const isSelected = t.key === activeTemplate;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTemplate(t.key)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? "bg-white border-brand-600 shadow-xs ring-2 ring-brand-500/10"
                  : "bg-white/60 border-slate-200 hover:bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs text-slate-900 font-display">
                  {t.label}
                </span>
                <Mail
                  className={`w-3.5 h-3.5 ${
                    isSelected ? "text-brand-600" : "text-slate-400"
                  }`}
                />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                {t.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Email Subject Line Bar */}
      <div className="p-3.5 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 truncate">
          <span className="text-brand-400 font-bold shrink-0">E-POSTA KONUSU:</span>
          <span className="text-slate-200 truncate">{rendered.subject}</span>
        </div>
        <span className="text-[10px] text-slate-400 uppercase shrink-0 hidden sm:inline">
          UTF-8 HTML
        </span>
      </div>

      {/* Rendered Live Iframe Preview */}
      <div className="p-6 bg-slate-200/60 rounded-3xl border border-slate-300/80 flex items-center justify-center min-h-[640px]">
        <div
          className={`transition-all duration-300 bg-transparent rounded-2xl shadow-2xl overflow-hidden ${
            viewMode === "mobile" ? "w-[390px]" : "w-full max-w-[650px]"
          }`}
        >
          <iframe
            srcDoc={rendered.html}
            title="Email Template Live Preview"
            className="w-full h-[620px] border-none rounded-2xl bg-ink-900"
          />
        </div>
      </div>
    </div>
  );
}

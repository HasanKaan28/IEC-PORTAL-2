"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Linkedin,
  Github,
  Lock,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { updateProfileAction } from "@/lib/auth/auth-actions";
import DiscordProfileCard, { ProfileCardData } from "@/components/shared/DiscordProfileCard";

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    fullName: "Kaan Mete Şenyıldız",
    email: "student@ius.edu.ba",
    department: "Computer Sciences and Engineering (CSE)",
    classYear: "2. Sınıf",
    bio: "FENS öğrencisi. Gömülü donanım devreleri, IoT telemetrisi ve yapay zekâ pipeline'ları üzerine çalışıyorum. IUS PowerHub projesinde donanım lideriyim.",
    linkedinUrl: "https://linkedin.com/in/kaan-mete",
    githubUrl: "https://github.com/HasanKaan28",
    phone: "+387 60 312 3456",
    hidePhone: false,
    hideEmail: false,
    avatarUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await updateProfileAction({
      fullName: formData.fullName,
      bio: formData.bio,
      department: formData.department,
      classYear: formData.classYear,
      linkedinUrl: formData.linkedinUrl,
      githubUrl: formData.githubUrl,
      phone: formData.phone,
      hidePhone: formData.hidePhone,
      hideEmail: formData.hideEmail,
    });

    setLoading(false);

    if (result.success) {
      setSuccessMsg(result.message || "Profil başarıyla kaydedildi.");
    } else {
      setErrorMsg(result.error || "Güncelleme sırasında hata oluştu.");
    }
  };

  const previewCardData: ProfileCardData = {
    id: "usr-current",
    fullName: formData.fullName,
    email: formData.email,
    avatarUrl: formData.avatarUrl || null,
    department: formData.department,
    classYear: formData.classYear,
    bio: formData.bio,
    linkedinUrl: formData.linkedinUrl || null,
    githubUrl: formData.githubUrl || null,
    phone: formData.phone,
    hidePhone: formData.hidePhone,
    hideEmail: formData.hideEmail,
    roles: ["leader", "project_lead"],
    projects: [
      { name: "IUS PowerHub", role: "Proje Lideri & Donanım", accentColor: "#06b6d4" },
      { name: "DevHack 2027", role: "Organizasyon Komitesi", accentColor: "#f59e0b" },
    ],
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-900 font-display">
            Profil Ayarları & Kimlik
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Toplulukta ve projelerde diğer üyelerin sizi nasıl göreceğini yönetin.
          </p>
        </div>

        {/* Live Discord Card Trigger */}
        <button
          type="button"
          onClick={() => setIsCardModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-accent-400" />
          <span>Discord Tarzı Profil Kartımı Önizle</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          {/* Avatar and Basic info */}
          <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center text-white font-bold text-xl shadow-md shrink-0">
              {formData.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{formData.fullName}</h2>
              <p className="text-xs text-slate-500 font-mono">{formData.email}</p>
              <div className="mt-2 flex gap-1.5">
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-100 text-brand-800">
                  Kulüp Lideri
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  Doğrulanmış Üye
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Ad Soyad
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                E-posta (Değiştirilemez)
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Department and Class Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bölüm
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
              >
                <option value="Computer Sciences and Engineering (CSE)">CSE (Bilgisayar)</option>
                <option value="Software Engineering (SE)">SE (Yazılım)</option>
                <option value="Electrical and Electronics (EE)">EE (Elektrik-Elektronik)</option>
                <option value="Mechanical Engineering (ME)">ME (Makine)</option>
                <option value="Industrial Engineering (IE)">IE (Endüstri)</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sınıf
              </label>
              <select
                value={formData.classYear}
                onChange={(e) => setFormData({ ...formData, classYear: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
              >
                <option value="1. Sınıf">1. Sınıf</option>
                <option value="2. Sınıf">2. Sınıf</option>
                <option value="3. Sınıf">3. Sınıf</option>
                <option value="4. Sınıf">4. Sınıf</option>
                <option value="Hazırlık">Hazırlık</option>
                <option value="Yüksek Lisans">Yüksek Lisans / Doktora</option>
              </select>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Hakkımda / Biyografi (Discord Profil Kartında Görünür)
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all leading-relaxed"
            />
          </div>

          {/* Social Profiles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                LinkedIn Profili
              </label>
              <div className="relative">
                <Linkedin className="w-4 h-4 text-brand-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/..."
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                GitHub Profili
              </label>
              <div className="relative">
                <Github className="w-4 h-4 text-slate-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Telefon / WhatsApp Numarası
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                placeholder="+387 60 ... veya +90 5..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
              />
            </div>
          </div>

          {/* Privacy Toggles (Mandatory feature from prompt) */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Gizlilik ve İletişim Tercihleri
            </h3>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 text-xs block">
                  Telefon Numaramı Gizle
                </span>
                <span className="text-[11px] text-slate-500">
                  Aktif edildiğinde profil kartınızdaki tek tık WhatsApp butonu kilitli gösterilir.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.hidePhone}
                onChange={(e) => setFormData({ ...formData, hidePhone: e.target.checked })}
                className="rounded border-slate-300 text-brand-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 text-xs block">
                  E-posta Adresimi Gizle
                </span>
                <span className="text-[11px] text-slate-500">
                  Aktif edildiğinde profil kartınızdaki doğrudan e-posta gönderme butonu gizlenir.
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.hideEmail}
                onChange={(e) => setFormData({ ...formData, hideEmail: e.target.checked })}
                className="rounded border-slate-300 text-brand-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Kaydediliyor...</span>
              </>
            ) : (
              <span>Değişiklikleri Kaydet</span>
            )}
          </button>
        </div>
      </form>

      {/* Live Preview Modal */}
      <DiscordProfileCard
        user={previewCardData}
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
      />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Check,
  X,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Loader2,
} from "lucide-react";
import {
  AdminApplicationItem,
  getAdminApplicationsAction,
  updateApplicationStatusAction,
} from "@/lib/admin/admin-actions";

export default function ApplicationsReviewPage() {
  const [apps, setApps] = useState<AdminApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<AdminApplicationItem | null>(null);
  const [reviewerNote, setReviewerNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getAdminApplicationsAction();
      setApps(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: "approved" | "rejected") => {
    setActionLoading(true);
    setToastMsg(null);

    const res = await updateApplicationStatusAction(appId, newStatus, reviewerNote);

    if (res.success) {
      setApps((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus, reviewerNotes: reviewerNote } : a))
      );
      setToastMsg(`Başvuru durumu '${newStatus === "approved" ? "Onaylandı" : "Reddedildi"}' olarak güncellendi.`);
      setSelectedApp(null);
      setReviewerNote("");
    }

    setActionLoading(false);
  };

  const filteredApps = apps.filter((a) => {
    if (statusFilter === "all") return true;
    return a.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Kulüp Üyelik Başvuruları
          </h2>
          <p className="text-xs text-slate-500">
            Halka açık başvuru formundan gelen adayları inceleyin, kabul veya ret kararı verin.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "all", label: "Tümü" },
            { id: "pending", label: "Bekleyenler" },
            { id: "approved", label: "Onaylananlar" },
            { id: "rejected", label: "Reddedilenler" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === tab.id
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Applications List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Başvurular yükleniyor...</span>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Seçilen filtrede başvuru bulunamadı.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="p-5 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900">{app.fullName}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold font-mono ${
                        app.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : app.status === "rejected"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {app.status === "approved"
                        ? "Onaylandı"
                        : app.status === "rejected"
                        ? "Reddedildi"
                        : "Beklemede"}
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 font-mono">
                    {app.email} {app.phone ? `• ${app.phone}` : ""} • {app.department} ({app.classYear})
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
                    &quot;{app.statement}&quot;
                  </p>

                  {app.reviewerNotes && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      Not: {app.reviewerNotes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                  </span>
                  {app.status === "pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-colors"
                      >
                        Karar Ver
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedApp(app)}
                      className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-600 text-xs"
                    >
                      Durumu Değiştir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      {selectedApp && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono text-indigo-600 uppercase font-bold">
                  Başvuru Değerlendirmesi
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedApp.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                Kapat
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl">
              <div><strong>Bölüm:</strong> {selectedApp.department} ({selectedApp.classYear})</div>
              <div><strong>E-posta:</strong> {selectedApp.email}</div>
              {selectedApp.phone && <div><strong>Telefon:</strong> {selectedApp.phone}</div>}
              <div className="pt-2"><strong>Motivasyon:</strong> &quot;{selectedApp.statement}&quot;</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Yönetici Notu (Adaya veya arşive düşülecek not)
              </label>
              <textarea
                rows={2}
                placeholder="Örn: Yazılım ve AI komitesi için kabul edildi..."
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange(selectedApp.id, "rejected")}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reddet</span>
              </button>
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange(selectedApp.id, "approved")}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Onayla ve Kabul Et</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

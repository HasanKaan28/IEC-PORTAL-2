"use client";

import React, { useState } from "react";
import { X, Check, XCircle, Clock, FolderGit2, User, CheckCircle2 } from "lucide-react";
import { ProjectJoinRequestItem } from "@/lib/projects/project-types";
import { reviewProjectJoinRequestAction } from "@/lib/projects/project-actions";

interface ProjectJoinRequestsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  requests: ProjectJoinRequestItem[];
  onRequestReviewed: (requestId: string, newStatus: "approved" | "rejected") => void;
}

export default function ProjectJoinRequestsDrawer({
  isOpen,
  onClose,
  requests,
  onRequestReviewed,
}: ProjectJoinRequestsDrawerProps) {
  const [filter, setFilter] = useState<"all" | "pending">("pending");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredRequests =
    filter === "pending"
      ? requests.filter((r) => r.status === "pending")
      : requests;

  const handleReview = async (id: string, status: "approved" | "rejected") => {
    setLoadingId(id);
    await reviewProjectJoinRequestAction(id, status);
    setLoadingId(null);
    onRequestReviewed(id, status);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end animate-in fade-in">
      <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 border-l border-slate-200">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-brand-600" />
              <h2 className="text-base font-bold text-slate-900 font-display">
                Proje Katılım Başvuruları
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-slate-500">
              Projelerinizde çalışmak isteyen öğrencilerin motivasyon mektuplarını değerlendirin.
            </p>

            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-[11px] font-medium">
              <button
                onClick={() => setFilter("pending")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filter === "pending"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Bekleyenler ({requests.filter((r) => r.status === "pending").length})
              </button>
              <button
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  filter === "all"
                    ? "bg-white text-slate-900 shadow-2xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tümü ({requests.length})
              </button>
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="p-6 flex-1 space-y-4 overflow-y-auto">
          {filteredRequests.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-mono">
              {filter === "pending"
                ? "Bekleyen herhangi bir katılım başvurusu bulunmuyor."
                : "Başvuru kaydı bulunamadı."}
            </div>
          ) : (
            filteredRequests.map((req) => (
              <div
                key={req.id}
                className={`p-4 rounded-xl border space-y-3 transition-colors ${
                  req.status === "pending"
                    ? "bg-white border-slate-200 shadow-xs"
                    : req.status === "approved"
                    ? "bg-emerald-50/40 border-emerald-200"
                    : "bg-rose-50/40 border-rose-200"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                      {req.projectTitle}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1.5">
                      {req.userName}
                    </h4>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {req.userDepartment} • {req.classYear}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-medium ${
                      req.status === "approved"
                        ? "bg-emerald-100 text-emerald-800"
                        : req.status === "rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {req.status === "approved"
                      ? "Kabul Edildi"
                      : req.status === "rejected"
                      ? "Reddedildi"
                      : "İnceleniyor"}
                  </span>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed italic">
                  "{req.message}"
                </p>

                {req.status === "pending" && (
                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleReview(req.id, "rejected")}
                      disabled={loadingId === req.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reddet</span>
                    </button>
                    <button
                      onClick={() => handleReview(req.id, "approved")}
                      disabled={loadingId === req.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{loadingId === req.id ? "İşleniyor..." : "Takıma Kabul Et"}</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

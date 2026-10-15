"use client";

import React, { useState } from "react";
import { X, Send, AlertCircle, FolderGit2 } from "lucide-react";
import { PortalProjectItem } from "@/lib/projects/project-types";
import { requestJoinProjectAction } from "@/lib/projects/project-actions";

interface ProjectJoinModalProps {
  project: PortalProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (projectId: string) => void;
}

export default function ProjectJoinModal({
  project,
  isOpen,
  onClose,
  onSuccess,
}: ProjectJoinModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !project) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setErrorMsg("Lütfen en az 5 karakterlik bir motivasyon mesajı yazınız.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await requestJoinProjectAction(project.id, message);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess(project.id);
      onClose();
      setMessage("");
    } else {
      setErrorMsg(res.error || "Başvuru iletilemedi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Projeye Katılma Başvurusu
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[280px]">
                {project.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Proje Lideri: <strong className="text-slate-800">{project.leadName}</strong></span>
              <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-semibold">{project.category}</span>
            </div>
            {project.openPositions.length > 0 && (
              <div className="pt-1">
                <span className="text-[10px] text-slate-400 font-mono block mb-1">ARANAN ROLLER:</span>
                <div className="flex flex-wrap gap-1">
                  {project.openPositions.map((pos) => (
                    <span key={pos} className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 text-[10px]">
                      {pos}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Kendinizi ve Projeye Neler Katabileceğinizi Anlatın *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Örn: C++ ve FreeRTOS deneyimim var, SPI bus hattı optimizasyonu ve devre kartı testlerinde haftalık 6 saat aktif çalışabilirim..."
              rows={4}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 resize-none leading-relaxed"
              required
            />
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "İletiliyor..." : "Başvuruyu Gönder"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

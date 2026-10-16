"use client";

import React, { useState } from "react";
import { X, Send, AlertCircle, Users } from "lucide-react";
import { HackathonTeamItem } from "@/lib/hackathons/hackathon-types";
import { requestJoinHackathonTeamAction } from "@/lib/hackathons/hackathon-actions";

interface JoinHackathonTeamModalProps {
  team: HackathonTeamItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (teamId: string) => void;
}

export default function JoinHackathonTeamModal({
  team,
  isOpen,
  onClose,
  onSuccess,
}: JoinHackathonTeamModalProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !team) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setErrorMsg("Lütfen en az 5 karakterlik bir mesaj yazınız.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const res = await requestJoinHackathonTeamAction(team.id, message);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess(team.id);
      onClose();
      setMessage("");
    } else {
      setErrorMsg(res.error || "İstek iletilemedi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Takıma Katılma İsteği
              </h3>
              <p className="text-[11px] text-slate-500 truncate max-w-[280px]">
                {team.name} ({team.hackathonTitle})
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Kaptan: <strong className="text-slate-800">{team.leaderName}</strong></span>
              <span>{team.members.length} / 4 Üye</span>
            </div>
            {team.lookingFor.length > 0 && (
              <div>
                <span className="text-[10px] text-slate-400 font-mono block mb-1">TAKIMIN ARADIĞI ROLLER:</span>
                <div className="flex flex-wrap gap-1">
                  {team.lookingFor.map((role) => (
                    <span key={role} className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-medium">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Takıma Neler Katabilirsiniz? (Yetenek ve Deneyiminiz) *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Örn: Python/FastAPI ile REST API geliştirebilirim, daha önce hackathon tecrübem var..."
              rows={4}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-brand-600 resize-none leading-relaxed"
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
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "İletiliyor..." : "İsteği Gönder"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

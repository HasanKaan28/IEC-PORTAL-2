"use client";

import React, { useState } from "react";
import { X, Sparkles, AlertCircle } from "lucide-react";
import { registerLookingForTeamAction } from "@/lib/hackathons/hackathon-actions";

interface LookingForTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: () => void;
}

export default function LookingForTeamModal({
  isOpen,
  onClose,
  onRegistered,
}: LookingForTeamModalProps) {
  const [skillsInput, setSkillsInput] = useState("Frontend, React, UI/UX");
  const [statement, setStatement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim() || statement.trim().length < 10) {
      setErrorMsg("Lütfen en az 10 karakterlik bir tanıtım cümlesi yazınız.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const skills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await registerLookingForTeamAction(skills, statement);
    setIsSubmitting(false);

    if (res.success) {
      onRegistered();
      onClose();
    } else {
      setErrorMsg(res.error || "Kayıt eklenemedi.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Takım Arayanlar Vitrinine Katıl
              </h3>
              <p className="text-[11px] text-slate-500">
                Hackathon takımlarının seni bulması için profilini ve yeteneklerini yayınla.
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

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Teknik Yetenekleriniz (Virgülle ayırın) *
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="C++, Python, Gömülü Sistemler, Figma, Sunum"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nasıl Bir Takım Arıyorsunuz? (Tanıtım Cümlesi) *
            </label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Örn: DevHack 2027 maratonunda IoT veya sosyal fayda kategorisinde yarışacak bir takımda donanım ve gömülü yazılım geliştirmek istiyorum..."
              rows={3}
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
              disabled={isSubmitting || !statement.trim()}
              className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Kaydediliyor..." : "Vitrine Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { X, Plus, Trophy, AlertCircle } from "lucide-react";
import { HackathonItem } from "@/lib/hackathons/hackathon-types";
import { createHackathonTeamAction } from "@/lib/hackathons/hackathon-actions";

interface CreateHackathonTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  hackathons: HackathonItem[];
  onTeamCreated: () => void;
}

export default function CreateHackathonTeamModal({
  isOpen,
  onClose,
  hackathons,
  onTeamCreated,
}: CreateHackathonTeamModalProps) {
  const [hackathonId, setHackathonId] = useState(hackathons[0]?.id || "hack-1");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lookingForInput, setLookingForInput] = useState(
    "Frontend Geliştirici, Gömülü C++, UI/UX Tasarımcı"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 3) {
      setErrorMsg("Takım adı en az 3 karakter olmalıdır.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const lookingFor = lookingForInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await createHackathonTeamAction({
      hackathonId,
      name,
      description,
      lookingFor,
    });

    setIsSubmitting(false);

    if (res.success) {
      onTeamCreated();
      onClose();
      setName("");
      setDescription("");
    } else {
      setErrorMsg(res.error || "Takım oluşturulamadı.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Yeni Hackathon Takımı Kur
              </h3>
              <p className="text-[11px] text-slate-500">
                Fikriniz için takım oluşturun ve eksik roller için üye arayın.
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
              Katılacağınız Hackathon
            </label>
            <select
              value={hackathonId}
              onChange={(e) => setHackathonId(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 bg-white"
            >
              {hackathons.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Takım Adı *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Sarajevo Pulse IoT"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Takım Hedefi / Fikir Özeti *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Hackathonda geliştirmeyi planladığınız prototip ve fikir..."
              rows={3}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Aranan Roller / Yetenekler (Virgülle ayırın)
            </label>
            <input
              type="text"
              value={lookingForInput}
              onChange={(e) => setLookingForInput(e.target.value)}
              placeholder="C++ Gömülü, React Native, UI Tasarımcısı"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-indigo-600"
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
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Oluşturuluyor..." : "Takımı Kur"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

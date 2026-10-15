"use client";

import React, { useState, useMemo } from "react";
import {
  Trophy,
  Users,
  Plus,
  Sparkles,
  Calendar,
  MapPin,
  Tag,
  CheckCircle2,
  ExternalLink,
  Mail,
  Send,
  Check,
  XCircle,
} from "lucide-react";
import {
  HackathonItem,
  HackathonTeamItem,
  LookingForTeamMemberItem,
  HackathonJoinRequestItem,
} from "@/lib/hackathons/hackathon-types";
import CreateHackathonTeamModal from "./CreateHackathonTeamModal";
import JoinHackathonTeamModal from "./JoinHackathonTeamModal";
import LookingForTeamModal from "./LookingForTeamModal";
import { reviewHackathonJoinRequestAction } from "@/lib/hackathons/hackathon-actions";

interface HackathonsPortalClientProps {
  initialHackathons: HackathonItem[];
  initialTeams: HackathonTeamItem[];
  initialLookingMembers: LookingForTeamMemberItem[];
  initialJoinRequests: HackathonJoinRequestItem[];
}

export default function HackathonsPortalClient({
  initialHackathons,
  initialTeams,
  initialLookingMembers,
  initialJoinRequests,
}: HackathonsPortalClientProps) {
  const [hackathons] = useState<HackathonItem[]>(initialHackathons);
  const [teams, setTeams] = useState<HackathonTeamItem[]>(initialTeams);
  const [lookingMembers, setLookingMembers] = useState<LookingForTeamMemberItem[]>(
    initialLookingMembers
  );
  const [joinRequests, setJoinRequests] = useState<HackathonJoinRequestItem[]>(
    initialJoinRequests
  );

  const [activeTab, setActiveTab] = useState<"teams" | "looking" | "requests">("teams");
  const [selectedHackathon, setSelectedHackathon] = useState("all");

  const [isCreateTeamOpen, setIsCreateTeamOpen] = useState(false);
  const [activeJoinTeam, setActiveJoinTeam] = useState<HackathonTeamItem | null>(null);
  const [isLookingModalOpen, setIsLookingModalOpen] = useState(false);
  const [loadingReqId, setLoadingReqId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredTeams = useMemo(() => {
    if (selectedHackathon === "all") return teams;
    return teams.filter((t) => t.hackathonId === selectedHackathon);
  }, [teams, selectedHackathon]);

  const handleJoinSuccess = (teamId: string) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, userStatus: "pending" } : t))
    );
    showToast("Takıma katılma isteğiniz takım kaptanına iletildi.");
  };

  const handleReviewRequest = async (requestId: string, status: "approved" | "rejected") => {
    setLoadingReqId(requestId);
    await reviewHackathonJoinRequestAction(requestId, status);
    setLoadingReqId(null);

    setJoinRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status } : r))
    );
    showToast(status === "approved" ? "Aday takıma dahil edildi!" : "İstek reddedildi.");
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Featured Hackathon Banner */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-mono text-xs border border-cyan-400/30">
              AMİRAL GEMİSİ HACKATHON
            </span>
            <span className="text-xs text-purple-200 font-mono">15-16 Mayıs 2027</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight">
            DevHack 2027 — 24 Saatlik Saraybosna Maratonu
          </h1>
          <p className="text-xs text-indigo-200 leading-relaxed">
            Akıllı Kampüs & IoT, FinTech ve Sosyal Fayda kategorilerinde üniversiteler arası büyük yarışma! Takımını kur veya takım arkadaşı bul.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreateTeamOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-indigo-50 text-xs font-semibold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Takım Kur</span>
          </button>
          <button
            onClick={() => setIsLookingModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-800/80 hover:bg-purple-700/80 text-white border border-purple-500/30 text-xs font-semibold transition-all"
          >
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span>Takım Arıyorum</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            onClick={() => setActiveTab("teams")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === "teams"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Açık Takımlar ({teams.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("looking")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === "looking"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span>Takım Arayan Mühendisler ({lookingMembers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeTab === "requests"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Gelen Takım İstekleri ({joinRequests.filter((r) => r.status === "pending").length})</span>
          </button>
        </div>

        {activeTab === "teams" && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-mono">Etkinlik:</span>
            <select
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-600 font-medium"
            >
              <option value="all">Tüm Hackathonlar</option>
              {hackathons.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: Teams Showcase */}
      {activeTab === "teams" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <div
              key={team.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                    {team.hackathonTitle}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded font-medium ${
                      team.isOpen
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {team.isOpen ? "Üye Arıyor" : "Kadro Dolu"}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors leading-snug">
                    {team.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                    {team.description}
                  </p>
                </div>

                {/* Looking for tags */}
                {team.lookingFor.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-mono block">
                      ARANAN ROLLER:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {team.lookingFor.map((role) => (
                        <span
                          key={role}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  {/* Leader */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-50 border border-purple-200 overflow-hidden flex items-center justify-center text-purple-700 font-bold text-[10px]">
                      {team.leaderAvatar ? (
                        <img
                          src={team.leaderAvatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        team.leaderName.charAt(0)
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 text-[11px]">
                        {team.leaderName}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {team.leaderRole}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {team.members.length} / 4 Üye
                  </span>
                </div>

                {/* Action button */}
                <div className="pt-1">
                  {team.userStatus === "leader" ? (
                    <span className="block text-center py-2 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
                      Takım Kaptanısınız
                    </span>
                  ) : team.userStatus === "member" ? (
                    <span className="block text-center py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                      Takım Üyesisiniz
                    </span>
                  ) : team.userStatus === "pending" ? (
                    <span className="block text-center py-2 rounded-xl bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                      Başvurunuz İnceleniyor
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveJoinTeam(team)}
                      className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      Takıma Katılma İsteği Gönder
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Looking for Team Showcase Vitrini */}
      {activeTab === "looking" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 font-display">
                Takım Arayan Öğrenci Mühendisler
              </h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Kadro kurmak isteyen kaptanlar aşağıdaki profilleri inceleyip doğrudan iletişime geçebilir.
              </p>
            </div>
            <button
              onClick={() => setIsLookingModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold transition-colors"
            >
              Ben de Vitrine Katılmak İstiyorum
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lookingMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-50 border border-cyan-200 overflow-hidden flex items-center justify-center text-cyan-700 font-bold text-xs">
                      {member.avatar ? (
                        <img
                          src={member.avatar}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        member.name.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        {member.name}
                      </h4>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {member.department} • {member.classYear}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{member.statement}"
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {member.skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-medium"
                      >
                        #{skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <a
                    href={`mailto:${member.contactEmail}?subject=DevHack 2027 Takım Daveti`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>E-posta Gönder</span>
                  </a>

                  <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Müsait
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Team Join Requests (Captain Review) */}
      {activeTab === "requests" && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600 font-medium">
            Takımınıza katılım talebinde bulunan adaylar
          </div>
          {joinRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-mono text-xs">
              Henüz bir takım katılım başvurusu yok.
            </div>
          ) : (
            joinRequests.map((req) => (
              <div key={req.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                      {req.teamName}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">
                      {req.userName}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {req.userDepartment}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
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

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                  "{req.message}"
                </p>

                {req.status === "pending" && (
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleReviewRequest(req.id, "rejected")}
                      disabled={loadingReqId === req.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-700 text-xs font-medium transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reddet</span>
                    </button>
                    <button
                      onClick={() => handleReviewRequest(req.id, "approved")}
                      disabled={loadingReqId === req.id}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Takıma Kabul Et</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <CreateHackathonTeamModal
        isOpen={isCreateTeamOpen}
        onClose={() => setIsCreateTeamOpen(false)}
        hackathons={hackathons}
        onTeamCreated={() => {
          showToast("Yeni takım başarıyla kuruldu.");
          window.location.reload();
        }}
      />

      <JoinHackathonTeamModal
        team={activeJoinTeam}
        isOpen={Boolean(activeJoinTeam)}
        onClose={() => setActiveJoinTeam(null)}
        onSuccess={handleJoinSuccess}
      />

      <LookingForTeamModal
        isOpen={isLookingModalOpen}
        onClose={() => setIsLookingModalOpen(false)}
        onRegistered={() => {
          showToast("Profiliniz takım arayanlar vitrinine eklendi!");
          window.location.reload();
        }}
      />
    </div>
  );
}

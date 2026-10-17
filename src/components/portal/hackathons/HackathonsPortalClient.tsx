"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, ExternalLink, Inbox, MapPin, Plus, Trophy, Users, XCircle } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";
import { formatDate } from "@/lib/i18n/format";
import { eventsHackathonsText } from "@/lib/i18n/portal/events-hackathons";
import {
  MAX_TEAM_MEMBERS,
  type HackathonItem,
  type HackathonJoinRequestItem,
  type HackathonTeamItem,
  type HackathonTeamMember,
} from "@/lib/hackathons/hackathon-types";
import { reviewHackathonJoinRequestAction } from "@/lib/hackathons/hackathon-actions";
import EmptyState from "@/components/portal/events/EmptyState";
import PortalToast, { useToast } from "@/components/portal/events/PortalToast";
import {
  cardClass,
  chipClass,
  inputClass,
  primaryButton,
  secondaryButton,
  successButton,
  tabButton,
} from "@/components/portal/events/styles";
import CreateHackathonModal from "./CreateHackathonModal";
import CreateHackathonTeamModal from "./CreateHackathonTeamModal";
import JoinHackathonTeamModal from "./JoinHackathonTeamModal";
import { MemberName, useMemberCard } from "@/components/portal/MemberCard";
import { useSearchFocus } from "@/components/portal/search/use-search-focus";
import { SEARCH_FOCUS_PARAM } from "@/lib/search/search-types";

interface HackathonsPortalClientProps {
  hackathons: HackathonItem[];
  teams: HackathonTeamItem[];
  joinRequests: HackathonJoinRequestItem[];
  canCreateHackathon: boolean;
}

type HackathonTab = "hackathons" | "teams" | "requests";

const REQUEST_STATUS_STYLE: Record<HackathonJoinRequestItem["status"], string> = {
  pending: "border-accent-300 bg-accent-50 text-accent-800",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-rose-200 bg-rose-50 text-rose-700",
};

function Avatar({ name, src, size = "h-8 w-8" }: { name: string; src?: string | null; size?: string }) {
  return (
    <span
      className={`${size} inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-brand-100 text-xs font-bold text-brand-700`}
      aria-hidden="true"
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- member avatars come from arbitrary profile URLs
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </span>
  );
}

function isSafeExternalUrl(url: string): boolean {
  return /^https:\/\//i.test(url);
}

export default function HackathonsPortalClient({
  hackathons,
  teams,
  joinRequests,
  canCreateHackathon,
}: HackathonsPortalClientProps) {
  const { locale } = useLocale();
  const t = eventsHackathonsText[locale];
  const router = useRouter();
  const { toast, show: showToast, dismiss: dismissToast } = useToast();

  const [activeTab, setActiveTab] = useState<HackathonTab>(teams.length > 0 ? "teams" : "hackathons");
  useSearchFocus(SEARCH_FOCUS_PARAM.hackathons, () => setActiveTab("hackathons"));
  const [selectedHackathon, setSelectedHackathon] = useState("all");
  const [createTeamFor, setCreateTeamFor] = useState<string | null>(null);
  const [joinTeamId, setJoinTeamId] = useState<string | null>(null);
  const [isCreateHackathonOpen, setIsCreateHackathonOpen] = useState(false);
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);

  const openHackathons = useMemo(() => hackathons.filter((hackathon) => hackathon.isOpen), [hackathons]);
  const filteredTeams = useMemo(
    () => (selectedHackathon === "all" ? teams : teams.filter((team) => team.hackathonId === selectedHackathon)),
    [teams, selectedHackathon]
  );
  const pendingRequestCount = joinRequests.filter((request) => request.status === "pending").length;
  const joinTeam = joinTeamId ? teams.find((team) => team.id === joinTeamId) ?? null : null;

  const formatDay = (isoDate: string) =>
    formatDate(`${isoDate}T00:00:00Z`, locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

  const formatRange = (start: string, end: string) =>
    start === end ? formatDay(start) : `${formatDay(start)} - ${formatDay(end)}`;

  const onMutationSuccess = (message: string) => {
    showToast({ kind: "success", message });
    router.refresh();
  };

  const handleReviewRequest = async (request: HackathonJoinRequestItem, status: "approved" | "rejected") => {
    setLoadingRequestId(request.id);
    const res = await reviewHackathonJoinRequestAction(request.id, status);
    setLoadingRequestId(null);
    if (res.success) onMutationSuccess(res.message ?? "");
    else showToast({ kind: "error", message: res.error });
  };

  const tabs: Array<{ id: HackathonTab; label: string; count: number }> = [
    { id: "hackathons", label: t.hackathons.tabs.hackathons, count: hackathons.length },
    { id: "teams", label: t.hackathons.tabs.teams, count: teams.length },
    { id: "requests", label: t.hackathons.tabs.requests, count: pendingRequestCount },
  ];

  const createTeamButton = openHackathons.length > 0 && (
    <button type="button" onClick={() => setCreateTeamFor("")} className={primaryButton}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      <span>{t.hackathons.newTeam}</span>
    </button>
  );

  const renderTeamAction = (team: HackathonTeamItem) => {
    const base = "block rounded-xl border py-2 text-center text-sm font-semibold";
    if (team.userStatus === "leader") {
      return <p className={`${base} border-brand-200 bg-brand-50 text-brand-700`}>{t.hackathons.youLead}</p>;
    }
    if (team.userStatus === "member") {
      return <p className={`${base} border-emerald-200 bg-emerald-50 text-emerald-700`}>{t.hackathons.youAreMember}</p>;
    }
    if (team.userStatus === "pending") {
      return <p className={`${base} border-accent-300 bg-accent-50 text-accent-800`}>{t.hackathons.requestPending}</p>;
    }
    if (team.members.length >= MAX_TEAM_MEMBERS) {
      return <p className={`${base} border-slate-200 bg-slate-50 text-slate-600`}>{t.hackathons.teamFull}</p>;
    }
    if (!team.isOpen) {
      return <p className={`${base} border-slate-200 bg-slate-50 text-slate-600`}>{t.hackathons.notRecruiting}</p>;
    }
    return (
      <button type="button" onClick={() => setJoinTeamId(team.id)} className={`${primaryButton} w-full`}>
        {t.hackathons.requestToJoin}
      </button>
    );
  };

  const memberCard = useMemberCard();
  const renderMembers = (members: HackathonTeamMember[]) => (
    <ul className="flex -space-x-2" aria-label={t.hackathons.membersLabel}>
      {members.map((member) => {
        const name = member.name || t.hackathons.unknownMember;
        return (
          <li key={member.id} title={member.department ? `${name} (${member.department})` : name}>
            <button
              type="button"
              onClick={() => memberCard?.openMemberCard(member.id)}
              className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
            >
              <Avatar name={name} src={member.avatar} />
              <span className="sr-only">{member.isLeader ? `${name}, ${t.hackathons.captain}` : name}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="space-y-6">
      <PortalToast toast={toast} onDismiss={dismissToast} dismissLabel={t.common.dismiss} />

      <header className={`${cardClass} flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center`}>
        <div>
          <h1 className="font-display text-xl font-bold text-slate-900">{t.hackathons.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{t.hackathons.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {canCreateHackathon && (
            <button type="button" onClick={() => setIsCreateHackathonOpen(true)} className={secondaryButton}>
              <Trophy className="h-4 w-4 text-accent-600" aria-hidden="true" />
              <span>{t.hackathons.newHackathon}</span>
            </button>
          )}
          {createTeamButton}
        </div>
      </header>

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div role="group" aria-label={t.hackathons.sectionsLabel} className="flex items-center gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={tabButton(activeTab === tab.id)}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 text-xs font-semibold ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "teams" && hackathons.length > 0 && (
          <div className="flex items-center gap-2">
            <label htmlFor="team-hackathon-filter" className="whitespace-nowrap text-sm text-slate-600">
              {t.hackathons.filterLabel}
            </label>
            <select
              id="team-hackathon-filter"
              value={selectedHackathon}
              onChange={(e) => setSelectedHackathon(e.target.value)}
              className={`${inputClass} w-auto py-1.5`}
            >
              <option value="all">{t.hackathons.filterAll}</option>
              {hackathons.map((hackathon) => (
                <option key={hackathon.id} value={hackathon.id}>
                  {hackathon.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeTab === "hackathons" &&
        (hackathons.length === 0 ? (
          <EmptyState
            icon={<Trophy className="h-6 w-6" />}
            title={t.hackathons.emptyHackathonsTitle}
            body={t.hackathons.emptyHackathonsBody}
            action={
              canCreateHackathon ? (
                <button type="button" onClick={() => setIsCreateHackathonOpen(true)} className={primaryButton}>
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>{t.hackathons.newHackathon}</span>
                </button>
              ) : undefined
            }
          />
        ) : (
          <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {hackathons.map((hackathon) => (
              <li key={hackathon.id}>
                <article data-search-target={hackathon.id} className={`${cardClass} flex h-full flex-col p-5`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`${chipClass} ${
                        hackathon.isOpen
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {hackathon.isOpen ? t.hackathons.open : t.hackathons.ended}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedHackathon(hackathon.id);
                        setActiveTab("teams");
                      }}
                      className="inline-flex items-center gap-1 rounded-lg text-sm font-semibold text-brand-700 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Users className="h-4 w-4" aria-hidden="true" />
                      {t.hackathons.teamsCount(hackathon.teamsCount)}
                    </button>
                  </div>
                  <h2 className="mt-3 text-base font-bold leading-snug text-slate-900">{hackathon.title}</h2>
                  <dl className="mt-2 space-y-1 text-sm text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <dt>
                        <CalendarDays className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        <span className="sr-only">{t.hackathons.datesLabel}</span>
                      </dt>
                      <dd>{formatRange(hackathon.startDate, hackathon.endDate)}</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <dt>
                        <MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />
                        <span className="sr-only">{t.hackathons.locationLabel}</span>
                      </dt>
                      <dd>{hackathon.locationCountry}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {hackathon.description}
                  </p>
                  {hackathon.tags.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {hackathon.tags.map((tag) => (
                        <li key={tag} className={`${chipClass} border-slate-200 bg-slate-50 text-slate-700`}>
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4">
                    {isSafeExternalUrl(hackathon.applicationUrl) && (
                      <a
                        href={hackathon.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={t.hackathons.applicationAria(hackathon.title)}
                        className={`${secondaryButton} px-3`}
                      >
                        <ExternalLink className="h-4 w-4 text-slate-500" aria-hidden="true" />
                        <span>{t.hackathons.applicationPage}</span>
                      </a>
                    )}
                    {hackathon.isOpen && (
                      <button type="button" onClick={() => setCreateTeamFor(hackathon.id)} className={`${primaryButton} px-3`}>
                        <Plus className="h-4 w-4" aria-hidden="true" />
                        <span>{t.hackathons.newTeam}</span>
                      </button>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ))}

      {activeTab === "teams" &&
        (filteredTeams.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title={t.hackathons.emptyTeamsTitle}
            body={t.hackathons.emptyTeamsBody}
            action={createTeamButton || undefined}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTeams.map((team) => (
              <li key={team.id}>
                <article className={`${cardClass} flex h-full flex-col p-5 transition-shadow hover:shadow-md`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {team.hackathonTitle && (
                      <span className={`${chipClass} max-w-[60%] truncate border-brand-200 bg-brand-50 text-brand-700`}>
                        {team.hackathonTitle}
                      </span>
                    )}
                    <span
                      className={`${chipClass} ${
                        team.isOpen && team.members.length < MAX_TEAM_MEMBERS
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-600"
                      }`}
                    >
                      {team.isOpen && team.members.length < MAX_TEAM_MEMBERS ? t.hackathons.recruiting : t.hackathons.notRecruiting}
                    </span>
                  </div>

                  <h2 className="mt-3 text-base font-bold leading-snug text-slate-900">{team.name}</h2>
                  {team.description && (
                    <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">{team.description}</p>
                  )}

                  {team.lookingFor.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.hackathons.lookingFor}</p>
                      <ul className="flex flex-wrap gap-1.5">
                        {team.lookingFor.map((role) => (
                          <li key={role} className={`${chipClass} border-accent-200 bg-accent-50 text-accent-800`}>
                            {role}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-auto space-y-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <Avatar name={team.leaderName || t.hackathons.unknownMember} src={team.leaderAvatar} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-800">
                            <MemberName userId={team.leaderId} name={team.leaderName || t.hackathons.unknownMember} />
                          </p>
                          <p className="text-xs text-slate-500">{t.hackathons.captain}</p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1">
                        {renderMembers(team.members)}
                        <span className="text-xs text-slate-500">
                          {t.hackathons.membersCount(team.members.length, MAX_TEAM_MEMBERS)}
                        </span>
                      </div>
                    </div>
                    {renderTeamAction(team)}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ))}

      {activeTab === "requests" &&
        (joinRequests.length === 0 ? (
          <EmptyState icon={<Inbox className="h-6 w-6" />} title={t.hackathons.emptyRequestsTitle} body={t.hackathons.emptyRequestsBody} />
        ) : (
          <section className={`${cardClass} overflow-hidden`} aria-labelledby="join-requests-heading">
            <h2 id="join-requests-heading" className="border-b border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700">
              {t.hackathons.requestsIntro}
            </h2>
            <ul className="divide-y divide-slate-100">
              {joinRequests.map((request) => {
                const name = request.userName || t.hackathons.unknownMember;
                const isLoading = loadingRequestId === request.id;
                return (
                  <li key={request.id} className="space-y-3 p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={name} size="h-10 w-10" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            <MemberName userId={request.userId} name={name} />
                          </p>
                          <p className="text-xs text-slate-500">
                            {[request.userDepartment, request.teamName].filter(Boolean).join(" · ")}
                          </p>
                        </div>
                      </div>
                      <span className={`${chipClass} ${REQUEST_STATUS_STYLE[request.status]}`}>
                        {t.hackathons.requestStatus[request.status]}
                      </span>
                    </div>

                    {request.message && (
                      <p className="whitespace-pre-line rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm text-slate-700">
                        {request.message}
                      </p>
                    )}

                    {request.status === "pending" && (
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleReviewRequest(request, "rejected")}
                          disabled={isLoading}
                          aria-label={t.hackathons.rejectAria(name)}
                          className={`${secondaryButton} px-3 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700`}
                        >
                          <XCircle className="h-4 w-4" aria-hidden="true" />
                          <span>{t.hackathons.reject}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReviewRequest(request, "approved")}
                          disabled={isLoading}
                          aria-label={t.hackathons.approveAria(name)}
                          className={`${successButton} px-3`}
                        >
                          <Check className="h-4 w-4" aria-hidden="true" />
                          <span>{t.hackathons.approve}</span>
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

      {createTeamFor !== null && (
        <CreateHackathonTeamModal
          hackathons={openHackathons}
          initialHackathonId={createTeamFor || undefined}
          onClose={() => setCreateTeamFor(null)}
          onTeamCreated={(message) => {
            setCreateTeamFor(null);
            setActiveTab("teams");
            onMutationSuccess(message);
          }}
        />
      )}

      {joinTeam && (
        <JoinHackathonTeamModal
          team={joinTeam}
          onClose={() => setJoinTeamId(null)}
          onSuccess={(message) => {
            setJoinTeamId(null);
            onMutationSuccess(message);
          }}
        />
      )}

      {isCreateHackathonOpen && (
        <CreateHackathonModal
          onClose={() => setIsCreateHackathonOpen(false)}
          onCreated={(message) => {
            setIsCreateHackathonOpen(false);
            setActiveTab("hackathons");
            onMutationSuccess(message);
          }}
        />
      )}
    </div>
  );
}

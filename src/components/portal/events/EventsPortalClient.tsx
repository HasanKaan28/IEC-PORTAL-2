"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  QrCode,
  Award,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Tv,
} from "lucide-react";
import { EventItem } from "@/lib/events/event-types";
import { registerForEventAction } from "@/lib/events/event-actions";
import CheckInModal from "./CheckInModal";

interface EventsPortalClientProps {
  initialEvents: EventItem[];
}

export default function EventsPortalClient({
  initialEvents,
}: EventsPortalClientProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [activeTab, setActiveTab] = useState<
    "all" | "upcoming" | "past" | "workshop" | "seminar" | "hackathon"
  >("all");
  const [checkInEvent, setCheckInEvent] = useState<EventItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (activeTab === "all") return true;
      if (activeTab === "upcoming") return !e.isPast;
      if (activeTab === "past") return e.isPast;
      return e.category === activeTab;
    });
  }, [events, activeTab]);

  const handleRegister = async (eventId: string) => {
    const res = await registerForEventAction(eventId);
    if (res.success) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === eventId
            ? { ...e, userStatus: "registered", registeredCount: e.registeredCount + 1 }
            : e
        )
      );
      showToast("Etkinliğe başarıyla kayıt oldunuz! Etkinlik günü salonda yoklama verebilirsiniz.");
    } else {
      showToast(res.error || "Kayıt işlemi başarısız.");
    }
  };

  const handleCheckInSuccess = (eventId: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, userStatus: "attended", attendeesCount: e.attendeesCount + 1 }
          : e
      )
    );
    showToast("Yoklamanız onaylandı! Başarı sertifikanız hazırlandı.");
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return {
      day: d.getDate(),
      month: d.toLocaleString("tr-TR", { month: "short" }).toUpperCase(),
      time: d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
    };
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 font-display">
              Kulüp Etkinlikleri & Atölyeler
            </h1>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
              {events.filter((e) => !e.isPast).length} Yaklaşan Etkinlik
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Donanım atölyeleri, teknoloji seminerleri ve uluslararası hackathonlara katılın; dinamik QR ile yoklama verip doğrulanabilir sertifikanızı alın.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/portal/sertifikalarim"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>Sertifikalarım</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "Tüm Etkinlikler" },
          { id: "upcoming", label: "Yaklaşanlar" },
          { id: "workshop", label: "Atölye (Workshop)" },
          { id: "seminar", label: "Seminer & Panel" },
          { id: "hackathon", label: "Hackathon" },
          { id: "past", label: "Tamamlananlar" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-xs font-semibold"
                : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredEvents.map((event) => {
          const dateObj = formatDate(event.dateTime);
          const isCapacityFull = event.registeredCount >= event.capacity;

          return (
            <div
              key={event.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-4">
                {/* Top Row: Date Badge & Category */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Calendar Badge */}
                    <div className="w-12 h-12 rounded-xl bg-indigo-50/80 border border-indigo-200 flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 leading-none">
                        {dateObj.month}
                      </span>
                      <span className="text-base font-bold text-slate-900 leading-tight">
                        {dateObj.day}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase font-mono">
                          {event.category}
                        </span>
                        {event.isPast ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-500">
                            Geçmiş
                          </span>
                        ) : isCapacityFull ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            Kontenjan Dolu
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Kayıtlar Açık
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Saat: {dateObj.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Organizer Live Presenter Link */}
                  {!event.isPast && (
                    <Link
                      href={`/portal/admin/etkinlikler/${event.id}/yoklama`}
                      title="Organizatör Yoklama Projeksiyon Ekranını Aç"
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors shrink-0"
                    >
                      <Tv className="w-4 h-4" />
                    </Link>
                  )}
                </div>

                {/* Title & Desc */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">
                    {event.description}
                  </p>
                </div>

                {/* Venue & Capacity */}
                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>KONTENJAN DURUMU</span>
                      <span>
                        {event.registeredCount} / {event.capacity} Kayıtlı
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (event.registeredCount / event.capacity) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                {/* Instructor */}
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                    {event.instructor.avatar ? (
                      <img
                        src={event.instructor.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      event.instructor.name.charAt(0)
                    )}
                  </div>
                  <div className="truncate">
                    <div className="font-semibold text-slate-800 text-[11px] truncate">
                      {event.instructor.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {event.instructor.title}
                    </div>
                  </div>
                </div>

                {/* Action Buttons based on userStatus */}
                <div className="shrink-0">
                  {event.userStatus === "attended" ? (
                    <Link
                      href="/portal/sertifikalarim"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Sertifikanız Hazır</span>
                    </Link>
                  ) : event.userStatus === "registered" ? (
                    <button
                      onClick={() => setCheckInEvent(event)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Yoklama Ver</span>
                    </button>
                  ) : event.isPast ? (
                    <span className="text-xs text-slate-400 italic">Sona erdi</span>
                  ) : (
                    <button
                      onClick={() => handleRegister(event.id)}
                      disabled={isCapacityFull}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                    >
                      <span>Kayıt Ol</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Check In Modal */}
      <CheckInModal
        event={checkInEvent}
        isOpen={Boolean(checkInEvent)}
        onClose={() => setCheckInEvent(null)}
        onSuccess={handleCheckInSuccess}
      />
    </div>
  );
}

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  FolderGit2,
  Trophy,
  ArrowRight,
  Flame,
  Plus,
  Calendar,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { getDashboardSummaryData } from "@/lib/tasks/task-queries";

export default async function PortalDashboardPage() {
  const summary = await getDashboardSummaryData();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Welcome banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-indigo-600 font-semibold uppercase">
              IEC Mühendislik Çalışma Alanı
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Hoş Geldin, Mühendis 👋
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Aktif sprint görevlerini, dahil olduğun donanım/yazılım projelerini ve yaklaşan etkinlik takvimini buradan yönetebilirsin.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/portal/gorevler"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm shadow-indigo-600/20"
          >
            <span>Görev Panosunu Aç</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Aktif Görevler</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {summary.todoCount + summary.inProgressCount + summary.inReviewCount}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-amber-600 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>{summary.inProgressCount} devam ediyor</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Tamamlanan</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2 font-mono">
            {summary.doneCount}
          </div>
          <span className="text-[11px] text-slate-400">Bu dönem kapatılan</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Aktif Projeler</span>
            <FolderGit2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {summary.userActiveProjectsCount}
          </div>
          <span className="text-[11px] text-slate-400">PowerHub & DevHack 2027</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Yaklaşan Etkinlik</span>
            <Trophy className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            DevHack
          </div>
          <span className="text-[11px] text-purple-600 font-medium">
            24 Saatlik Maraton
          </span>
        </div>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Tasks (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 font-display">
                Sprint Görevleri & İlerleme
              </h2>
            </div>
            <Link
              href="/portal/gorevler"
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-medium"
            >
              <span>Tüm Panoyu Gör</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {summary.recentTasks.map((task) => (
              <Link
                key={task.id}
                href="/portal/gorevler"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition-colors group"
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {task.title}
                    </span>
                    {task.priority === "urgent" && (
                      <span className="inline-flex items-center text-[10px] text-rose-600 font-bold font-mono">
                        <Flame className="w-3 h-3 fill-rose-500" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <span className="text-slate-600">{task.projectName}</span>
                    <span>•</span>
                    <span>{task.assigneeName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium ${
                      task.status === "done"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : task.status === "in_review"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : task.status === "in_progress"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {task.status === "done"
                      ? "Tamamlandı"
                      : task.status === "in_review"
                      ? "İncelemede"
                      : task.status === "in_progress"
                      ? "Sürüyor"
                      : "Yapılacak"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Events & Announcements (1 col) */}
        <div className="space-y-6">
          {/* Quick Hackathon Card */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-indigo-200 border border-white/20">
                DEVHACK 2027
              </span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>

            <h3 className="text-sm font-bold font-display">
              Takımını Kur veya Takımlara Katıl
            </h3>
            <p className="text-xs text-indigo-200 leading-relaxed">
              24 saatlik büyük maratonda yazılım, gömülü donanım veya yapay zekâ kategorisinde yarışmak için takım arkadaşı ara.
            </p>

            <Link
              href="/portal/hackathon"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition-colors pt-1"
            >
              <span>Hackathon Merkezine Git</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Club News */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs font-bold text-slate-800 font-display">
                Son Gelişmeler
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Duyurular</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-900 block">
                  Prof. Dr. Leila Miller Danışmanlığında SCC Başvurusu
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  FENS Mühendislik Kulübü tüzüğü ve kurucu üye imzaları Öğrenci İşleri Merkezi koordinatörlüğüne teslim edildi.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="font-semibold text-slate-900 block">
                  Linear Entegrasyonu ve Sprint Döngüsü
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Kulüp içi görev takibi haftalık sprintler halinde bu panelden ve Linear panosundan senkronize yürütülmektedir.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

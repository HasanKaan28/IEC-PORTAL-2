import React from "react";
import Link from "next/link";
import { Users, UserCheck, Shield, ScrollText, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { getAdminUsersAction, getAdminApplicationsAction, getAuditLogsAction } from "@/lib/admin/admin-actions";

export default async function AdminDashboardPage() {
  const users = await getAdminUsersAction();
  const applications = await getAdminApplicationsAction();
  const logs = await getAuditLogsAction();

  const pendingApps = applications.filter((a) => a.status === "pending");
  const adminCount = users.filter((u) => u.roles.some((r) => r === "admin" || r === "super_admin" || r === "leader")).length;

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Toplam Kayıtlı Üye</span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{users.length}</div>
          <span className="text-[11px] text-slate-400">Tüm aktif öğrenci profilleri</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Bekleyen Başvurular</span>
            <UserCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{pendingApps.length}</div>
          <span className="text-[11px] text-amber-600 font-medium">İnceleme bekliyor</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Yetkili Yöneticiler</span>
            <Shield className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{adminCount}</div>
          <span className="text-[11px] text-brand-600 font-medium">Super Admin & Liderler</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">Denetim Kayıtları</span>
            <ScrollText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{logs.length}</div>
          <span className="text-[11px] text-slate-400">audit_logs kayıtları</span>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Applications snippet */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Bekleyen Kulüp Başvuruları</h2>
              <p className="text-[11px] text-slate-500">Form üzerinden gelen yeni üyelik talepleri</p>
            </div>
            <Link
              href="/portal/admin/basvurular"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
            >
              <span>Tümünü Gör</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {pendingApps.length > 0 ? (
              pendingApps.slice(0, 3).map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900">{app.fullName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {app.department} • {app.classYear}
                    </div>
                  </div>
                  <Link
                    href="/portal/admin/basvurular"
                    className="px-3 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-[11px] font-semibold transition-colors"
                  >
                    İncele
                  </Link>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                Şu anda bekleyen başvuru bulunmuyor.
              </div>
            )}
          </div>
        </div>

        {/* Latest Audit Logs snippet */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Son İdari İşlemler (Audit Log)</h2>
              <p className="text-[11px] text-slate-500">Yetki ve onay geçmişi</p>
            </div>
            <Link
              href="/portal/admin/denetim"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center gap-1"
            >
              <span>Günlüğü Aç</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {logs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-start gap-3"
              >
                <div className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-900">{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

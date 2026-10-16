"use client";

import React, { useState, useEffect } from "react";
import { ScrollText, Search, Shield, Filter, Loader2, ArrowUpRight } from "lucide-react";
import { AuditLogItem, getAuditLogsAction } from "@/lib/admin/admin-actions";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("all");

  useEffect(() => {
    async function load() {
      const data = await getAuditLogsAction();
      setLogs(data);
      setLoading(false);
    }
    load();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actorName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase());

    if (filterAction === "all") return matchesSearch;
    if (filterAction === "roles") return matchesSearch && log.action.startsWith("role.");
    if (filterAction === "apps") return matchesSearch && log.action.startsWith("application.");
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Sistem Denetim Günlüğü (Audit Logs)
          </h2>
          <p className="text-xs text-slate-500">
            Tüm idari roller, başvurular ve sistem işlemlerinin değiştirilemez zaman damgalı güvenlik kayıtları.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "Tümü" },
            { id: "roles", label: "Rol İşlemleri" },
            { id: "apps", label: "Başvuru Kararları" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterAction(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filterAction === tab.id
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            <span>Denetim kayıtları yükleniyor...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Kayıt bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold font-mono text-[11px]">
                  <th className="py-3 px-4">Zaman Damgası</th>
                  <th className="py-3 px-4">İşlemi Yapan (Actor)</th>
                  <th className="py-3 px-4">Eylem (Action)</th>
                  <th className="py-3 px-4">Hedef Türü</th>
                  <th className="py-3 px-4">Detaylar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {log.actorName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                          log.action.includes("approve") || log.action.includes("assign")
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {log.targetType} ({log.targetId})
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

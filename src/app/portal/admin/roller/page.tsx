"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { UserRole, ROLE_LABELS } from "@/lib/rbac/permissions";
import {
  AdminUserItem,
  getAdminUsersAction,
  toggleUserRoleAction,
} from "@/lib/admin/admin-actions";

export default function RoleManagementPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUserItem | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const availableRoles: UserRole[] = [
    "super_admin",
    "admin",
    "leader",
    "project_lead",
    "task_manager",
    "blog_author",
    "member",
  ];

  useEffect(() => {
    async function load() {
      const data = await getAdminUsersAction();
      setUsers(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleToggle = async (userId: string, role: UserRole, currentHasRole: boolean) => {
    setUpdatingRoleId(`${userId}-${role}`);
    setToastMsg(null);

    const res = await toggleUserRoleAction(userId, role, !currentHasRole);

    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          const nextRoles = currentHasRole
            ? u.roles.filter((r) => r !== role)
            : [...u.roles, role];
          return { ...u, roles: nextRoles };
        })
      );
      setToastMsg(`Rol başarıyla ${!currentHasRole ? "atandı" : "kaldırıldı"} ve audit_logs tablosuna işlendi.`);
    }

    setUpdatingRoleId(null);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 font-display">
            Rol ve Yetkilendirme Masası (RBAC)
          </h2>
          <p className="text-xs text-slate-500">
            Kullanıcıların komite ve yönetim sorumluluklarını tek tıkla güncelleyin.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="İsim veya e-posta ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-600 transition-all"
          />
        </div>
      </div>

      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
            <span>Kullanıcı listesi yükleniyor...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-semibold font-mono text-[11px]">
                  <th className="py-3 px-4">Kullanıcı</th>
                  <th className="py-3 px-4">Bölüm / Sınıf</th>
                  <th className="py-3 px-4">Atanmış Roller</th>
                  <th className="py-3 px-4 text-right">Rol İşlemleri</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{user.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{user.email}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{user.department}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{user.classYear}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <span
                            key={r}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono border ${
                              r === "super_admin"
                                ? "bg-purple-100 text-purple-800 border-purple-200"
                                : r === "admin"
                                ? "bg-brand-100 text-brand-800 border-brand-200"
                                : r === "leader"
                                ? "bg-brand-100 text-brand-800 border-brand-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {ROLE_LABELS[r]?.tr || r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                        className="px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold transition-colors"
                      >
                        {selectedUser?.id === user.id ? "Kapat" : "Rolleri Düzenle"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Edit Popover / Drawer when user is selected */}
      {selectedUser && (
        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-[10px] font-mono text-accent-400 block uppercase tracking-wider">
                Rol Yetkilendirme Paneli
              </span>
              <h3 className="text-base font-bold text-white">
                {selectedUser.fullName} ({selectedUser.email})
              </h3>
            </div>
            <button
              onClick={() => setSelectedUser(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Paneli Kapat
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {availableRoles.map((role) => {
              const hasRole = selectedUser.roles.includes(role);
              const isUpdating = updatingRoleId === `${selectedUser.id}-${role}`;

              return (
                <button
                  key={role}
                  disabled={isUpdating}
                  onClick={() => handleToggle(selectedUser.id, role, hasRole)}
                  className={`p-3 rounded-xl border text-left transition-all text-xs flex flex-col justify-between ${
                    hasRole
                      ? "bg-brand-600/30 border-brand-500 text-white"
                      : "bg-slate-850 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="font-bold text-xs">{ROLE_LABELS[role]?.tr}</span>
                    {isUpdating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-400" />
                    ) : hasRole ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-accent-400" />
                    ) : (
                      <Plus className="w-3.5 h-3.5 text-slate-500" />
                    )}
                  </div>
                  <span className="text-[10px] font-mono opacity-60">
                    {hasRole ? "Aktif Rol" : "Atamak İçin Tıkla"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

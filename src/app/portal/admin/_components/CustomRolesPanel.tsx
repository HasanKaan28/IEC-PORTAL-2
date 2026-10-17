"use client";

import React, { useMemo, useState } from "react";
import { Database, Layers, Loader2, Pencil, Plus, Search, ShieldCheck, Trash2, UserPlus, X } from "lucide-react";
import type { Permission } from "@/lib/rbac/permissions";
import {
  CUSTOM_ROLE_COLORS,
  PERMISSION_GROUPS,
  PERMISSION_INFO,
  type CustomRoleColor,
} from "@/lib/rbac/permission-catalog";
import {
  deleteCustomRoleAction,
  saveCustomRoleAction,
  type CustomRoleItem,
} from "@/lib/admin/custom-role-actions";
import type { AdminUserItem } from "@/lib/admin/admin-actions";
import { ROLE_COLOR_STYLES, customRoleChipClass } from "@/lib/rbac/role-colors";
import { useLocale } from "@/lib/i18n/locale-context";
import { customRolesText } from "@/lib/i18n/portal/custom-roles";
import { adminText } from "@/lib/i18n/portal/admin";
import { EmptyState, Notice, PageHeader, focusRing } from "./AdminUi";
import { MemberName } from "@/components/portal/MemberCard";

const COLOR_STYLES = ROLE_COLOR_STYLES;
export { customRoleChipClass };

function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${focusRing} ${
        checked ? "bg-brand-600" : "bg-slate-300"
      }`}
    >
      <span
        aria-hidden="true"
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`}
      />
    </button>
  );
}

interface Draft {
  id?: string;
  name: string;
  description: string;
  color: CustomRoleColor;
  permissions: Set<Permission>;
  isDefault: boolean;
}

const EMPTY_DRAFT: Draft = { name: "", description: "", color: "brand", permissions: new Set(), isDefault: false };

interface CustomRolesPanelProps {
  roles: CustomRoleItem[];
  onRolesChange: (updater: (prev: CustomRoleItem[]) => CustomRoleItem[]) => void;
  users: AdminUserItem[];
  currentUserId: string;
  actorIsSuperAdmin: boolean;
  actorPermissions: Permission[];
  setupRequired: boolean;
  defaultSetupRequired: boolean;
  onAssign: (userId: string, roleId: string, assign: boolean) => Promise<{ ok: boolean; message: string }>;
}

export default function CustomRolesPanel({
  roles,
  onRolesChange,
  users,
  currentUserId,
  actorIsSuperAdmin,
  actorPermissions,
  setupRequired,
  defaultSetupRequired,
  onAssign,
}: CustomRolesPanelProps) {
  const { locale } = useLocale();
  const t = customRolesText[locale];
  const common = adminText[locale].common;

  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [assigningRoleId, setAssigningRoleId] = useState<string | null>(null);
  const [memberQuery, setMemberQuery] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const usersById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);

  const canAssignRole = (role: CustomRoleItem) =>
    actorIsSuperAdmin ||
    (!role.permissions.includes("roles.manage") && role.permissions.every((p) => actorPermissions.includes(p)));

  const startCreate = () => {
    setDraft({ ...EMPTY_DRAFT, permissions: new Set() });
    setAssigningRoleId(null);
  };

  const startEdit = (role: CustomRoleItem) => {
    setDraft({
      id: role.id,
      name: role.name,
      description: role.description ?? "",
      color: role.color,
      permissions: new Set(role.permissions),
      isDefault: role.isDefault,
    });
    setAssigningRoleId(null);
  };

  const togglePermission = (permission: Permission, on: boolean) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = new Set(prev.permissions);
      if (on) next.add(permission);
      else next.delete(permission);
      return { ...prev, permissions: next };
    });
  };

  const setGroup = (permissions: Permission[], on: boolean) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = new Set(prev.permissions);
      for (const permission of permissions) {
        if (on) next.add(permission);
        else next.delete(permission);
      }
      return { ...prev, permissions: next };
    });
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    setNotice(null);
    const result = await saveCustomRoleAction({
      id: draft.id,
      name: draft.name,
      description: draft.description,
      color: draft.color,
      permissions: [...draft.permissions],
    });
    setSaving(false);
    if (!result.success) {
      setNotice({ tone: "error", text: result.error });
      return;
    }
    const saved = result.data;
    if (saved) {
      onRolesChange((prev) => {
        const exists = prev.some((role) => role.id === saved.id);
        const next = exists ? prev.map((role) => (role.id === saved.id ? saved : role)) : [...prev, saved];
        return next.sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.name.localeCompare(b.name, locale));
      });
    }
    setDraft(null);
    setNotice({ tone: "success", text: result.message ?? "" });
  };

  const handleDelete = async (role: CustomRoleItem) => {
    setPendingKey(`delete:${role.id}`);
    setNotice(null);
    const result = await deleteCustomRoleAction(role.id);
    setPendingKey(null);
    setConfirmDeleteId(null);
    if (!result.success) {
      setNotice({ tone: "error", text: result.error });
      return;
    }
    onRolesChange((prev) => prev.filter((r) => r.id !== role.id));
    if (assigningRoleId === role.id) setAssigningRoleId(null);
    setNotice({ tone: "success", text: result.message ?? "" });
  };

  const handleAssign = async (role: CustomRoleItem, userId: string, assign: boolean) => {
    setPendingKey(`${role.id}:${userId}`);
    setNotice(null);
    const outcome = await onAssign(userId, role.id, assign);
    setPendingKey(null);
    setNotice({ tone: outcome.ok ? "success" : "error", text: outcome.message });
  };

  const matchingMembers = (role: CustomRoleItem) => {
    const q = memberQuery.trim().toLocaleLowerCase(locale);
    const list = q
      ? users.filter((u) => [u.fullName, u.email].some((value) => value.toLocaleLowerCase(locale).includes(q)))
      : users;
    return list.filter((u) => !role.memberIds.includes(u.id)).slice(0, 8);
  };

  if (setupRequired) {
    return (
      <div className="space-y-4">
        <PageHeader title={t.list.title} subtitle={t.list.subtitle} />
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <EmptyState icon={Database} message={t.list.setupRequired} />
        </div>
      </div>
    );
  }

  const selectedCount = draft?.permissions.size ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.list.title}
        subtitle={t.list.subtitle}
        actions={
          actorIsSuperAdmin && !draft ? (
            <button
              type="button"
              onClick={startCreate}
              className={`inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 ${focusRing}`}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              {t.builder.newRole}
            </button>
          ) : null
        }
      />

      {!actorIsSuperAdmin && <Notice tone="info">{t.list.superAdminOnly}</Notice>}
      {defaultSetupRequired && <Notice tone="info">{t.list.defaultSetupRequired}</Notice>}

      {notice && (
        <Notice tone={notice.tone} onDismiss={() => setNotice(null)} dismissLabel={common.dismiss}>
          {notice.text}
        </Notice>
      )}

      {draft && (
        <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-brand-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-base font-bold text-slate-900">
              {draft.id ? t.builder.editTitle(draft.name || "") : t.builder.createTitle}
            </h3>
            <button
              type="button"
              onClick={() => setDraft(null)}
              aria-label={t.builder.cancel}
              className={`rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 ${focusRing}`}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="role-name" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t.builder.nameLabel}
              </label>
              <input
                id="role-name"
                required
                minLength={2}
                maxLength={40}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder={t.builder.namePlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label htmlFor="role-description" className="mb-1.5 block text-sm font-semibold text-slate-700">
                {t.builder.descriptionLabel}
              </label>
              <input
                id="role-description"
                maxLength={200}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                placeholder={t.builder.descriptionPlaceholder}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-slate-700">{t.builder.colorLabel}</legend>
            <div className="flex flex-wrap gap-2">
              {CUSTOM_ROLE_COLORS.map((color) => {
                const selected = draft.color === color;
                return (
                  <label
                    key={color}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-colors ${
                      selected ? `${COLOR_STYLES[color].chip} ring-2 ${COLOR_STYLES[color].ring}` : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role-color"
                      value={color}
                      checked={selected}
                      onChange={() => setDraft({ ...draft, color })}
                      className="sr-only"
                    />
                    <span aria-hidden="true" className={`h-3 w-3 rounded-full ${COLOR_STYLES[color].dot}`} />
                    {t.builder.colors[color]}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div>
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-slate-700">{t.builder.permissionsLabel}</h4>
              <p className="text-sm text-slate-500">{t.builder.permissionsHint}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {PERMISSION_GROUPS.map((group) => {
                const allOn = group.permissions.every((p) => draft.permissions.has(p));
                return (
                  <section key={group.key} className="rounded-xl border border-slate-200 bg-slate-50/60">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-2.5">
                      <h5 className="text-sm font-bold text-slate-900">{group.label[locale]}</h5>
                      <button
                        type="button"
                        onClick={() => setGroup(group.permissions, !allOn)}
                        className={`rounded-lg px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50 ${focusRing}`}
                      >
                        {allOn ? t.builder.disableAll : t.builder.enableAll}
                      </button>
                    </div>
                    <ul className="divide-y divide-slate-200">
                      {group.permissions.map((permission) => {
                        const info = PERMISSION_INFO[permission];
                        const on = draft.permissions.has(permission);
                        return (
                          <li key={permission} className="flex items-start justify-between gap-4 bg-white px-4 py-3 first:rounded-none last:rounded-b-xl">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900">{info.label[locale]}</p>
                              <p className="text-sm text-slate-500">{info.description[locale]}</p>
                              <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                                <Layers className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                                {t.builder.opensPage}: {info.page[locale]}
                              </p>
                            </div>
                            <Switch
                              checked={on}
                              onChange={(next) => togglePermission(permission, next)}
                              label={info.label[locale]}
                            />
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-slate-500">{t.builder.selectedCount(selectedCount)}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className={`rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${focusRing}`}
              >
                {t.builder.cancel}
              </button>
              <button
                type="submit"
                disabled={saving || (selectedCount === 0 && !draft.isDefault) || draft.name.trim().length < 2}
                className={`inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                {saving ? t.builder.saving : draft.id ? t.builder.save : t.builder.create}
              </button>
            </div>
          </div>
        </form>
      )}

      {roles.length === 0 ? (
        !draft && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <EmptyState icon={ShieldCheck} message={`${t.list.emptyTitle} ${actorIsSuperAdmin ? t.list.emptyHint : ""}`} />
          </div>
        )
      ) : (
        <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {roles.map((role) => {
            const isAssigning = assigningRoleId === role.id;
            const assignable = canAssignRole(role);
            const holders = role.memberIds.map((id) => usersById.get(id)).filter(Boolean) as AdminUserItem[];
            return (
              <li key={role.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="flex flex-wrap items-center gap-2 font-display text-base font-bold text-slate-900">
                      <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-full ${COLOR_STYLES[role.color].dot}`} />
                      <span className="truncate">{role.name}</span>
                      {role.isDefault && (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-sans text-xs font-semibold text-emerald-800">
                          {t.list.defaultBadge}
                        </span>
                      )}
                    </h3>
                    {role.description && <p className="mt-1 text-sm text-slate-500">{role.description}</p>}
                    <p className="mt-1 text-xs text-slate-500">
                      {t.list.permissionCount(role.permissions.length)}
                      {!role.isDefault && ` · ${t.list.memberCount(role.memberIds.length)}`}
                    </p>
                  </div>
                  {actorIsSuperAdmin && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => startEdit(role)}
                        aria-label={`${t.list.edit}: ${role.name}`}
                        className={`rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 ${focusRing}`}
                      >
                        <Pencil className="h-4 w-4" aria-hidden="true" />
                      </button>
                      {!role.isDefault && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(role.id)}
                          aria-label={`${t.list.remove}: ${role.name}`}
                          className={`rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700 ${focusRing}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {role.permissions.map((permission) => (
                    <li key={permission} className={`rounded-md border px-2 py-0.5 text-xs font-medium ${customRoleChipClass(role.color)}`}>
                      {PERMISSION_INFO[permission].label[locale]}
                    </li>
                  ))}
                </ul>

                {confirmDeleteId === role.id && (
                  <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" role="alert">
                    <p>{t.list.confirmDelete(role.name)}</p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleDelete(role)}
                        disabled={pendingKey === `delete:${role.id}`}
                        className={`inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-60 ${focusRing}`}
                      >
                        {pendingKey === `delete:${role.id}` && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                        {t.list.confirmYes}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className={`rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 ${focusRing}`}
                      >
                        {t.list.confirmNo}
                      </button>
                    </div>
                  </div>
                )}

                {role.isDefault ? (
                  <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-500">{t.list.defaultHolders}</p>
                ) : (
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-slate-700">{t.list.holders}</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setAssigningRoleId(isAssigning ? null : role.id);
                        setMemberQuery("");
                      }}
                      disabled={!assignable}
                      aria-expanded={isAssigning}
                      title={assignable ? undefined : t.messages.escalation}
                      className={`inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                    >
                      <UserPlus className="h-4 w-4" aria-hidden="true" />
                      {isAssigning ? t.list.closeAssign : t.list.assignMembers}
                    </button>
                  </div>

                  {holders.length === 0 ? (
                    <p className="mt-2 text-sm text-slate-500">{t.list.noHolders}</p>
                  ) : (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {holders.map((member) => (
                        <li key={member.id} className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-0.5 pl-3 pr-1 text-sm text-slate-700">
                          <MemberName userId={member.id} name={member.fullName} />
                          {assignable && member.id !== currentUserId && (
                            <button
                              type="button"
                              onClick={() => handleAssign(role, member.id, false)}
                              disabled={pendingKey !== null}
                              aria-label={`${t.list.unassign}: ${member.fullName}`}
                              className={`rounded-full p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50 ${focusRing}`}
                            >
                              {pendingKey === `${role.id}:${member.id}` ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                              ) : (
                                <X className="h-3.5 w-3.5" aria-hidden="true" />
                              )}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {isAssigning && (
                    <div className="mt-3 space-y-2">
                      <div className="relative">
                        <label htmlFor={`member-search-${role.id}`} className="sr-only">
                          {t.list.memberSearchLabel}
                        </label>
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                        <input
                          id={`member-search-${role.id}`}
                          type="search"
                          autoFocus
                          value={memberQuery}
                          onChange={(e) => setMemberQuery(e.target.value)}
                          placeholder={t.list.memberSearchPlaceholder}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                      {matchingMembers(role).length === 0 ? (
                        <p className="px-1 text-sm text-slate-500">{t.list.noMembersFound}</p>
                      ) : (
                        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                          {matchingMembers(role).map((member) => {
                            const isSelf = member.id === currentUserId;
                            const pending = pendingKey === `${role.id}:${member.id}`;
                            return (
                              <li key={member.id} className="flex items-center justify-between gap-3 px-3 py-2">
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium text-slate-900">
                                    <MemberName userId={member.id} name={member.fullName} />
                                    {isSelf && <span className="ml-1.5 text-xs font-normal text-slate-500">({t.list.you})</span>}
                                  </p>
                                  <p className="truncate text-xs text-slate-500">{member.email}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleAssign(role, member.id, true)}
                                  disabled={isSelf || pendingKey !== null}
                                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                                >
                                  {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5" aria-hidden="true" />}
                                  {t.list.assign}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

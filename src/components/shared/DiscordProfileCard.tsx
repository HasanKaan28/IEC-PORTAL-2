"use client";

import React, { useRef } from "react";
import { FolderGit2, Github, Linkedin, Lock, Mail, MessageCircle, Shield, X } from "lucide-react";
import { ROLE_LABELS, type UserRole } from "@/lib/rbac/permissions";
import { useLocale } from "@/lib/i18n/locale-context";
import {
  localizeClassYear,
  localizeDepartment,
  messagesProfileText,
} from "@/lib/i18n/portal/messages-profile";
import type { ProfileCardData } from "@/lib/messages/message-types";
import { safeHexColor, safeHttpUrl } from "@/lib/messages/utils";
import { customRoleChipClass } from "@/lib/rbac/role-colors";
import MemberAvatar from "@/components/portal/messages/MemberAvatar";
import { useDialog } from "@/components/portal/messages/hooks";

export type { ProfileCardData } from "@/lib/messages/message-types";

interface DiscordProfileCardProps {
  user: ProfileCardData;
  isOpen: boolean;
  onClose: () => void;
  /** Optional extra actions shown at the bottom of the card. */
  footer?: React.ReactNode;
}

/**
 * Member profile card shown as a modal. Contact buttons respect the member's privacy flags; for
 * other members the server has already removed hidden email / phone values.
 */
export default function DiscordProfileCard(props: DiscordProfileCardProps) {
  if (!props.isOpen) return null;
  return <ProfileCardDialog {...props} />;
}

function ProfileCardDialog({ user, onClose, footer }: DiscordProfileCardProps) {
  const { locale } = useLocale();
  const t = messagesProfileText[locale].card;
  const common = messagesProfileText[locale].common;
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialog(true, onClose, dialogRef);

  // Built-in roles other than the base member role (in practice: super admin), then custom roles.
  // The plain "member" label only appears when the member has no custom role at all.
  const customRoles = user.customRoles ?? [];
  const builtIn: UserRole[] = (user.roles ?? []).filter((role) => role !== "member");
  const roles: UserRole[] = builtIn.length === 0 && customRoles.length === 0 ? ["member"] : builtIn;
  const phoneDigits = user.phone ? user.phone.replace(/[^0-9]/g, "") : "";
  const canWhatsApp = !user.hidePhone && phoneDigits.length >= 6;
  const canEmail = !user.hideEmail && Boolean(user.email);
  const githubUrl = safeHttpUrl(user.githubUrl);
  const linkedinUrl = safeHttpUrl(user.linkedinUrl);
  const subtitle = [localizeDepartment(user.department, locale), localizeClassYear(user.classYear, locale)]
    .filter(Boolean)
    .join(" · ");
  const hasContactRow = canWhatsApp || canEmail || user.hidePhone || user.hideEmail;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t.dialogLabel(user.fullName)}
        tabIndex={-1}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl focus:outline-hidden"
      >
        <div className="relative h-24 bg-linear-to-r/srgb from-brand-700 via-brand-600 to-brand-400">
          <button
            type="button"
            onClick={onClose}
            aria-label={common.close}
            className="absolute right-3 top-3 rounded-full bg-black/25 p-1.5 text-white transition-colors hover:bg-black/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="px-5 pb-5">
          <div className="-mt-10 mb-3">
            <MemberAvatar name={user.fullName} src={user.avatarUrl} size="xl" locale={locale} className="ring-4 ring-white" />
          </div>

          <h2 className="font-display text-lg font-bold leading-tight text-slate-900">{user.fullName}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}

          <section className="mt-4 border-t border-slate-100 pt-3">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.roles}</h3>
            <ul className="flex flex-wrap gap-1.5">
              {roles.map((role) => (
                <li
                  key={role}
                  className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700"
                >
                  <Shield className="h-3 w-3" aria-hidden="true" />
                  <span>{ROLE_LABELS[role]?.[locale] ?? role}</span>
                </li>
              ))}
              {customRoles.map((role) => (
                <li
                  key={role.name}
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${customRoleChipClass(role.color)}`}
                >
                  <Shield className="h-3 w-3" aria-hidden="true" />
                  <span>{role.name}</span>
                </li>
              ))}
            </ul>
          </section>

          {user.bio && (
            <section className="mt-4 border-t border-slate-100 pt-3">
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.about}</h3>
              <p className="whitespace-pre-line wrap-break-word text-sm leading-relaxed text-slate-700">{user.bio}</p>
            </section>
          )}

          {user.projects && user.projects.length > 0 && (
            <section className="mt-4 border-t border-slate-100 pt-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{t.projects}</h3>
              <ul className="space-y-1.5">
                {user.projects.map((project, index) => (
                  <li
                    key={`${project.name}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FolderGit2
                        className="h-4 w-4 shrink-0"
                        style={{ color: safeHexColor(project.accentColor) }}
                        aria-hidden="true"
                      />
                      <span className="truncate font-medium text-slate-800">{project.name}</span>
                    </span>
                    {project.role && <span className="shrink-0 text-xs text-slate-500">{project.role}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(hasContactRow || githubUrl || linkedinUrl) && (
            <section className="mt-4 space-y-2 border-t border-slate-100 pt-3">
              {hasContactRow && (
                <div className="flex items-center gap-2">
                  {canWhatsApp ? (
                    <a
                      href={`https://wa.me/${phoneDigits}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                      <span>{t.whatsapp}</span>
                      <span className="sr-only">{t.opensInNewTab}</span>
                    </a>
                  ) : user.hidePhone ? (
                    <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t.phoneHidden}</span>
                    </span>
                  ) : null}

                  {canEmail ? (
                    <a
                      href={`mailto:${user.email}`}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    >
                      <Mail className="h-4 w-4" aria-hidden="true" />
                      <span>{t.email}</span>
                    </a>
                  ) : user.hideEmail ? (
                    <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
                      <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{t.emailHidden}</span>
                    </span>
                  ) : null}
                </div>
              )}

              {(githubUrl || linkedinUrl) && (
                <div className="flex items-center justify-center gap-2 pt-1">
                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t.github} ${t.opensInNewTab}`}
                      className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Github className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                  {linkedinUrl && (
                    <a
                      href={linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t.linkedin} ${t.opensInNewTab}`}
                      className="rounded-xl border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      <Linkedin className="h-4 w-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}
            </section>
          )}

          {footer && <div className="mt-4 border-t border-slate-100 pt-3">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  MessageSquare,
  PenSquare,
  ScrollText,
  Shield,
  ShieldAlert,
  UserCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { getSessionUser, userCan } from "@/lib/auth/session";
import { canAccessAdminConsole } from "@/lib/admin/admin-access";
import { getAdminUsersAction, getAuditLogsAction } from "@/lib/admin/admin-actions";
import { auditActionLabel, auditDetail } from "@/lib/admin/audit-format";
import { getAllBlogCommentsForAdmin, getBlogPosts } from "@/lib/blog/blog-queries";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { getServerLocale } from "@/lib/i18n/server";
import { formatDateTime, formatRelative } from "@/lib/i18n/format";
import { adminText } from "@/lib/i18n/portal/admin";
import { EmptyState, Notice, focusRing } from "./_components/AdminUi";

interface StatCard {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  iconClass: string;
}

export default async function AdminDashboardPage() {
  const user = await getSessionUser();
  if (!canAccessAdminConsole(user)) redirect("/portal");

  const locale = await getServerLocale();
  const text = adminText[locale];
  const t = text.overview;

  const canRoles = userCan(user, "roles.manage");
  const canAudit = userCan(user, "audit.view");
  const canModerate = userCan(user, "blog.moderate");
  const canWrite = userCan(user, "blog.write");
  const canBlog = canWrite || userCan(user, "blog.publish") || canModerate;
  const canApplications = userCan(user, "applications.review");

  const [usersResult, logsResult, posts, flagged] = await Promise.all([
    canRoles ? getAdminUsersAction() : Promise.resolve(null),
    canAudit ? getAuditLogsAction() : Promise.resolve(null),
    canBlog ? getBlogPosts({ status: "all" }) : Promise.resolve(null),
    canModerate ? getAllBlogCommentsForAdmin("flagged") : Promise.resolve(null),
  ]);

  const users = usersResult?.success ? usersResult.data ?? [] : [];
  const logs = logsResult?.success ? logsResult.data ?? [] : [];

  const stats: StatCard[] = [];
  if (canRoles) {
    stats.push({
      label: t.membersLabel,
      value: users.length,
      hint: t.membersHint,
      icon: Users,
      iconClass: "bg-brand-50 text-brand-600",
    });
    stats.push({
      label: t.staffLabel,
      value: users.filter((u) => u.roles.some((r) => r === "super_admin" || r === "admin" || r === "leader")).length,
      hint: t.staffHint,
      icon: Shield,
      iconClass: "bg-accent-100 text-accent-700",
    });
  }
  if (posts) {
    const published = posts.filter((p) => p.status === "published").length;
    stats.push({
      label: t.postsLabel,
      value: posts.length,
      hint: t.postsHint(published, posts.length - published),
      icon: BookOpen,
      iconClass: "bg-emerald-50 text-emerald-600",
    });
  }
  if (flagged) {
    stats.push({
      label: t.flaggedLabel,
      value: flagged.length,
      hint: t.flaggedHint,
      icon: ShieldAlert,
      iconClass: "bg-rose-50 text-rose-600",
    });
  }
  if (canAudit) {
    stats.push({
      label: t.auditLabel,
      value: logs.length,
      hint: t.auditHint,
      icon: ScrollText,
      iconClass: "bg-slate-100 text-slate-600",
    });
  }

  const quickLinks: { href: string; label: string; icon: LucideIcon }[] = [];
  if (canWrite) quickLinks.push({ href: "/portal/blog/yaz", label: t.quickNewPost, icon: PenSquare });
  if (canModerate) quickLinks.push({ href: "/portal/admin/blog/yorumlar", label: t.quickModeration, icon: MessageSquare });
  if (canRoles) quickLinks.push({ href: "/portal/admin/roller", label: t.quickRoles, icon: Users });

  return (
    <div className="space-y-6">
      {!isSupabaseAdminConfigured() && <Notice tone="info">{text.actions.adminNotConfigured}</Notice>}

      {stats.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-600">{stat.label}</span>
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${stat.iconClass}`}>
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{stat.value}</div>
                <p className="mt-0.5 text-xs text-slate-500">{stat.hint}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {canAudit && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="recent-audit-title">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 id="recent-audit-title" className="text-sm font-bold text-slate-900">
                  {t.recentAuditTitle}
                </h2>
                <p className="text-xs text-slate-500">{t.recentAuditSubtitle}</p>
              </div>
              <Link
                href="/portal/admin/denetim"
                className={`inline-flex items-center gap-1 rounded-md text-sm font-semibold text-brand-600 hover:text-brand-700 ${focusRing}`}
              >
                <span>{t.openAudit}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            {logs.length === 0 ? (
              <EmptyState icon={ScrollText} message={t.noAudit} />
            ) : (
              <ul className="mt-3 space-y-2">
                {logs.slice(0, 5).map((log) => (
                  <li key={log.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-x-2">
                        <span className="text-sm font-semibold text-slate-900">{auditActionLabel(log.action, locale)}</span>
                        <time
                          dateTime={log.createdAt}
                          title={formatDateTime(log.createdAt, locale)}
                          className="text-xs text-slate-500"
                        >
                          {formatRelative(log.createdAt, locale)}
                        </time>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-600">
                        {(log.actorName ?? text.audit.systemActor) + ": " + auditDetail(log, locale)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        <div className="space-y-6">
          {canApplications && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="applications-title">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-100 text-accent-700">
                  <UserCheck className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h2 id="applications-title" className="text-sm font-bold text-slate-900">
                    {t.applicationsTitle}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">{t.applicationsBody}</p>
                  <Link
                    href="/portal/admin/basvurular"
                    className={`mt-3 inline-flex items-center gap-1 rounded-md text-sm font-semibold text-brand-600 hover:text-brand-700 ${focusRing}`}
                  >
                    <span>{t.applicationsLink}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {quickLinks.length > 0 && (
            <section className="rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="quick-title">
              <h2 id="quick-title" className="text-sm font-bold text-slate-900">
                {t.quickTitle}
              </h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {quickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={`flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 ${focusRing}`}
                      >
                        <Icon className="h-4 w-4" aria-hidden="true" />
                        <span>{link.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

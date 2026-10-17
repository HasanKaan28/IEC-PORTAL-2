import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  FolderGit2,
  ListTodo,
  MapPin,
  MessageSquare,
  Trophy,
  UserCog,
  type LucideIcon,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth/session";
import { getDashboardData, type DashboardTaskStatus } from "@/lib/portal/dashboard-queries";
import { getServerLocale } from "@/lib/i18n/server";
import { formatDate, formatDateTime } from "@/lib/i18n/format";
import { portalShellText } from "@/lib/i18n/portal/shell";

export async function generateMetadata() {
  const locale = await getServerLocale();
  return { title: portalShellText[locale].shell.nav.dashboard };
}

const STATUS_STYLES: Record<DashboardTaskStatus, string> = {
  todo: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-accent-50 text-accent-800 border-accent-200",
  in_review: "bg-brand-50 text-brand-700 border-brand-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function greetingFor(hour: number, t: (typeof portalShellText)["tr"]["dashboard"]): string {
  if (hour < 12) return t.greetingMorning;
  if (hour < 18) return t.greetingDay;
  return t.greetingEvening;
}

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-3 font-display text-3xl font-bold tabular-nums text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{hint}</div>
    </div>
  );
}

export default async function PortalDashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/portal/giris");

  const [locale, data] = await Promise.all([getServerLocale(), getDashboardData(user.id)]);
  const t = portalShellText[locale].dashboard;
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/Sarajevo" }).format(new Date())
  );
  const firstName = user.fullName.split(/\s+/)[0] || user.fullName;
  const now = Date.now();

  const quickLinks: Array<{ href: string; label: string; icon: LucideIcon }> = [
    { href: "/portal/hackathon", label: t.links.hackathons, icon: Trophy },
    { href: "/portal/mesajlar", label: t.links.messages, icon: MessageSquare },
    { href: "/portal/sertifikalarim", label: t.links.certificates, icon: Award },
    { href: "/portal/profil", label: t.links.profile, icon: UserCog },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-brand-100 via-accent-50 to-emerald-50 p-6 text-slate-900 shadow-soft sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(36rem_14rem_at_0%_0%,rgba(190,165,217,0.5),transparent_70%),radial-gradient(28rem_12rem_at_100%_100%,rgba(181,214,191,0.5),transparent_70%)]"
        />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{t.eyebrow}</p>
            <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
              {greetingFor(hour, t)}, {firstName}
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-600">{t.intro}</p>
          </div>
          <Link
            href="/portal/gorevler"
            className="inline-flex items-center gap-2 self-start rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 sm:self-auto"
          >
            <span>{t.openBoard}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label={t.quickLinks}>
        <StatCard
          label={t.stats.openTasks}
          value={data.openTasks}
          hint={`${data.inProgressTasks} ${t.stats.inProgress}`}
          icon={Clock}
          tone="bg-accent-100 text-accent-700"
        />
        <StatCard
          label={t.stats.done}
          value={data.doneTasks}
          hint={t.stats.doneHint}
          icon={CheckCircle2}
          tone="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label={t.stats.projects}
          value={data.projects}
          hint={t.stats.projectsHint}
          icon={FolderGit2}
          tone="bg-brand-100 text-brand-700"
        />
        <StatCard
          label={t.stats.certificates}
          value={data.certificates}
          hint={t.stats.certificatesHint}
          icon={Award}
          tone="bg-violet-100 text-violet-700"
        />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="flex items-center gap-2 font-display text-base font-semibold text-slate-900">
              <ListTodo className="w-4 h-4 text-brand-600" aria-hidden="true" />
              {t.myTasks}
            </h2>
            <Link href="/portal/gorevler" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-800">
              {t.allTasks}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>

          {data.nextTasks.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm font-medium text-slate-800">{t.noTasksTitle}</p>
              <p className="mt-1 text-sm text-slate-500">{t.noTasksHint}</p>
              <Link
                href="/portal/projeler"
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                {t.browseProjects}
              </Link>
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {data.nextTasks.map((task) => {
                const overdue = task.dueDate ? Date.parse(task.dueDate) < now : false;
                return (
                  <li key={task.id}>
                    <Link
                      href="/portal/gorevler"
                      className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
                    >
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          {task.priority === "urgent" && (
                            <Flame className="w-4 h-4 shrink-0 text-rose-500" aria-label={t.priority.urgent} />
                          )}
                          <span className="truncate text-sm font-semibold text-slate-800 group-hover:text-brand-700">
                            {task.title}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs text-slate-500">
                          <span>{task.projectTitle ? task.projectTitle[locale] : t.noProject}</span>
                          {task.dueDate && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className={overdue ? "font-medium text-rose-600" : ""}>
                                {overdue ? t.overdue : t.due}: {formatDate(task.dueDate, locale, { day: "numeric", month: "short" })}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[task.status]}`}>
                          {t.status[task.status]}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600" aria-hidden="true" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="flex items-center gap-2 font-display text-base font-semibold text-slate-900">
                <Calendar className="w-4 h-4 text-brand-600" aria-hidden="true" />
                {t.upcomingEvents}
              </h2>
              <Link href="/portal/etkinlikler" className="text-sm font-medium text-brand-700 hover:text-brand-800">
                {t.allEvents}
              </Link>
            </div>
            {data.upcomingEvents.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">{t.noEvents}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {data.upcomingEvents.map((event) => (
                  <li key={event.id} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-sm font-semibold text-slate-900">{event.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(event.dateTime, locale)}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      {event.venue}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="border-b border-slate-100 pb-3 font-display text-base font-semibold text-slate-900">{t.quickLinks}</h2>
            <ul className="mt-2">
              {quickLinks.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group flex items-center justify-between rounded-xl px-2 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 hover:text-brand-700"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 text-slate-400 group-hover:text-brand-600" aria-hidden="true" />
                      {label}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

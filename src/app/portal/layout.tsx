import React from "react";
import type { Metadata } from "next";
import PortalShell from "@/components/portal/PortalShell";
import PortalHeaderUserMenu from "@/components/portal/PortalHeaderUserMenu";
import PortalNotificationBell from "@/components/portal/PortalNotificationBell";
import LanguageSwitcher from "@/components/shared/LanguageSwitcher";
import { getSessionUser, userCan } from "@/lib/auth/session";
import { canAccessAdminConsole } from "@/lib/admin/admin-access";
import { visiblePages } from "@/lib/rbac/page-access";
import { getNotifications } from "@/lib/messages/message-queries";
import { getServerLocale } from "@/lib/i18n/server";
import { ROLE_HIERARCHY, ROLE_LABELS, type UserRole } from "@/lib/rbac/permissions";

export const metadata: Metadata = {
  title: { default: "Portal", template: "%s | IEC Portal" },
  robots: { index: false, follow: false },
};

function highestRole(roles: UserRole[]): UserRole {
  return [...roles].sort((a, b) => (ROLE_HIERARCHY[b] ?? 0) - (ROLE_HIERARCHY[a] ?? 0))[0] ?? "member";
}

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  // The middleware lets signed-out visitors reach only the sign-in, sign-up and password pages,
  // which bring their own full-screen layout.
  if (!user) {
    return <div className="theme-portal min-h-screen bg-canvas antialiased">{children}</div>;
  }

  const [locale, notifications] = await Promise.all([getServerLocale(), getNotifications()]);
  // A member whose only extra rights come from a custom role is labelled with that role's name.
  const topRole = highestRole(user.roles);
  const roleLabel =
    topRole !== "member"
      ? ROLE_LABELS[topRole][locale]
      : user.customRoles[0]?.name ?? user.defaultRole?.name ?? ROLE_LABELS.member[locale];
  const showAdmin = canAccessAdminConsole(user);

  return (
    <PortalShell
      user={{ fullName: user.fullName, email: user.email, avatarUrl: user.avatarUrl, roleLabel, pages: visiblePages(user), canPlan: userCan(user, "planning.manage") }}
      showAdmin={showAdmin}
      headerActions={
        <>
          <LanguageSwitcher tone="light" />
          <PortalNotificationBell initialNotifications={notifications} />
          <span className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden="true" />
          <PortalHeaderUserMenu user={{ ...user, roleLabel }} />
        </>
      }
    >
      {children}
    </PortalShell>
  );
}

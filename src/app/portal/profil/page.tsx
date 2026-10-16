import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { formatDate } from "@/lib/i18n/format";
import { messagesProfileText } from "@/lib/i18n/portal/messages-profile";
import { getMemberProjects, getOwnProfile, type OwnProfile } from "@/lib/messages/member-profiles";
import ProfileSettingsForm from "./ProfileSettingsForm";

export async function generateMetadata(): Promise<Metadata> {
  const t = messagesProfileText[await getServerLocale()].profile;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/portal/giris?redirect=/portal/profil");

  const locale = await getServerLocale();
  const [stored, projects] = await Promise.all([getOwnProfile(user.id), getMemberProjects(user.id, locale)]);

  // The sign-up trigger creates the profile row; fall back to the session data if it is missing.
  const profile: OwnProfile = stored ?? {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    avatarUrl: user.avatarUrl,
    department: user.department,
    classYear: user.classYear,
    bio: null,
    linkedinUrl: null,
    githubUrl: null,
    phone: null,
    hidePhone: true,
    hideEmail: false,
    createdAt: null,
  };

  const memberSince = profile.createdAt
    ? formatDate(profile.createdAt, locale, { month: "long", year: "numeric" })
    : null;

  return <ProfileSettingsForm profile={profile} roles={user.roles} projects={projects} memberSince={memberSince} />;
}

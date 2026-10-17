import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { UserRole } from "@/lib/rbac/permissions";
import type { SupportedLocale } from "@/lib/i18n/translations";
import { messagesProfileText } from "@/lib/i18n/portal/messages-profile";
import type { ProfileCardData } from "./message-types";
import { isUuid, safeHexColor, safeHttpUrl } from "./utils";

/**
 * Server-side profile reads. Privacy rule: another member's email / phone never leave the server
 * when they chose to hide them. Call these only after the viewer is authenticated, passing the
 * session user's id as viewerId.
 */

// email and phone are not column-readable by members (see the security migration). They come from
// the member_contact() database function, which applies the hide flags for anyone but the owner.
const PROFILE_COLUMNS =
  "id, full_name, avatar_url, department, class_year, bio, linkedin_url, github_url, hide_phone, hide_email, created_at";

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  department: string | null;
  class_year: string | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  phone: string | null;
  hide_phone: boolean | null;
  hide_email: boolean | null;
  created_at: string | null;
}

/** The signed-in user's own editable profile. */
export interface OwnProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  department: string | null;
  classYear: string | null;
  bio: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  phone: string | null;
  hidePhone: boolean;
  hideEmail: boolean;
  createdAt: string | null;
}

type ProjectList = NonNullable<ProfileCardData["projects"]>;

async function fetchProfileRow(memberId: string): Promise<ProfileRow | null> {
  if (!isUuid(memberId) || !isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const [profileResult, contactResult] = await Promise.all([
    (supabase.from("profiles") as any).select(PROFILE_COLUMNS).eq("id", memberId).maybeSingle(),
    (supabase as any).rpc("member_contact", { _member_id: memberId }),
  ]);
  if (profileResult.error) {
    console.error("[profile] load failed", profileResult.error);
    return null;
  }
  const profile = profileResult.data as Omit<ProfileRow, "email" | "phone"> | null;
  if (!profile) return null;
  if (contactResult.error) console.error("[profile] contact load failed", contactResult.error);
  const contactRows = (contactResult.data as Array<{ email: string | null; phone: string | null }> | null) ?? [];
  const contact = contactRows[0] ?? { email: null, phone: null };
  return { ...profile, email: contact.email ?? "", phone: contact.phone };
}

export async function getOwnProfile(userId: string): Promise<OwnProfile | null> {
  const row = await fetchProfileRow(userId);
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name?.trim() || row.email.split("@")[0],
    avatarUrl: safeHttpUrl(row.avatar_url),
    department: row.department,
    classYear: row.class_year,
    bio: row.bio,
    linkedinUrl: row.linkedin_url,
    githubUrl: row.github_url,
    phone: row.phone,
    hidePhone: row.hide_phone ?? true,
    hideEmail: row.hide_email ?? false,
    createdAt: row.created_at,
  };
}

export async function getMemberRoles(memberId: string): Promise<UserRole[]> {
  if (!isUuid(memberId) || !isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await (supabase.from("user_roles") as any).select("role").eq("user_id", memberId);
  if (error) {
    console.error("[profile] roles failed", error);
    return [];
  }
  const roles = ((data as Array<{ role: UserRole }> | null) ?? []).map((row) => row.role);
  return roles.length > 0 ? roles : ["member"];
}

/** The member's custom roles, with the default role (held by everyone) first. */
export async function getMemberCustomRoles(memberId: string): Promise<Array<{ name: string; color: string }>> {
  if (!isUuid(memberId) || !isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const [assigned, fallback] = await Promise.all([
    (supabase.from("user_custom_roles") as any).select("role:custom_roles(name, color)").eq("user_id", memberId),
    (supabase.from("custom_roles") as any).select("name, color").eq("is_default", true).maybeSingle(),
  ]);
  const roles: Array<{ name: string; color: string }> = [];
  // Either query fails harmlessly before the custom roles migrations have run.
  if (!fallback.error && fallback.data) roles.push(fallback.data as { name: string; color: string });
  if (!assigned.error) {
    for (const row of (assigned.data ?? []) as Array<{ role: { name: string; color: string } | null }>) {
      if (row.role) roles.push(row.role);
    }
  }
  return roles;
}

/** Projects the member belongs to (real project_members rows), titled in the viewer's language. */
export async function getMemberProjects(memberId: string, locale: SupportedLocale): Promise<ProjectList> {
  if (!isUuid(memberId) || !isSupabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase.from("project_members") as any)
      .select("role, projects(title_tr, title_en, accent_color)")
      .eq("user_id", memberId)
      .order("joined_at", { ascending: false })
      .limit(6);
    if (error) {
      console.error("[profile] projects failed", error);
      return [];
    }
    const memberLabel = messagesProfileText[locale].card.projectMember;
    type ProjectJoin = { title_tr: string; title_en: string; accent_color: string | null };
    const rows =
      (data as Array<{ role: string | null; projects: ProjectJoin | ProjectJoin[] | null }> | null) ?? [];
    const projects: ProjectList = [];
    for (const row of rows) {
      const project = Array.isArray(row.projects) ? row.projects[0] : row.projects;
      if (!project) continue;
      const role = row.role?.trim();
      projects.push({
        name: locale === "en" ? project.title_en : project.title_tr,
        role: !role || role.toLowerCase() === "member" ? memberLabel : role,
        accentColor: safeHexColor(project.accent_color),
      });
    }
    return projects;
  } catch (error) {
    console.error("[profile] projects failed", error);
    return [];
  }
}

/**
 * Profile card for any member as seen by viewerId. Hidden email / phone are dropped here, on the
 * server, so they are never serialised to another member's browser.
 */
export async function getMemberProfileCard(
  viewerId: string,
  memberId: string,
  locale: SupportedLocale
): Promise<ProfileCardData | null> {
  const [row, roles, projects, customRoles] = await Promise.all([
    fetchProfileRow(memberId),
    getMemberRoles(memberId),
    getMemberProjects(memberId, locale),
    getMemberCustomRoles(memberId),
  ]);
  if (!row) return null;

  const isSelf = viewerId === memberId;
  const hidePhone = row.hide_phone ?? true;
  const hideEmail = row.hide_email ?? false;

  return {
    id: row.id,
    fullName: row.full_name?.trim() || "?",
    email: isSelf || !hideEmail ? row.email : null,
    phone: isSelf || !hidePhone ? row.phone : null,
    hidePhone,
    hideEmail,
    avatarUrl: safeHttpUrl(row.avatar_url),
    department: row.department,
    classYear: row.class_year,
    bio: row.bio,
    linkedinUrl: safeHttpUrl(row.linkedin_url),
    githubUrl: safeHttpUrl(row.github_url),
    roles,
    customRoles,
    projects,
  };
}

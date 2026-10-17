import { redirect } from "next/navigation";
import { getSessionUser, type SessionUser } from "@/lib/auth/session";
import { canSeePage, type PortalPage } from "./page-access";

const PAGE_PATHS: Record<PortalPage, string> = {
  tasks: "/portal/gorevler",
  projects: "/portal/projeler",
  hackathons: "/portal/hackathon",
  events: "/portal/etkinlikler",
  certificates: "/portal/sertifikalarim",
  messages: "/portal/mesajlar",
};

/**
 * First line of every role-controlled member page (server components only): signed-out visitors go
 * to sign-in, members whose roles do not include the page go back to the overview.
 */
export async function guardPortalPage(page: PortalPage): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/portal/giris?redirect=${encodeURIComponent(PAGE_PATHS[page])}`);
  if (!canSeePage(user, page)) redirect("/portal");
  return user;
}

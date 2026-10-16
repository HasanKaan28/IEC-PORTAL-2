import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ProjectsPortalClient from "@/components/portal/projects/ProjectsPortalClient";
import { getSessionUser, userCan } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { tasksProjectsText } from "@/lib/i18n/portal/tasks-projects";
import { getPortalProjects, getProjectJoinRequests } from "@/lib/projects/project-queries";
import type { ProjectViewer } from "@/lib/projects/project-types";

export async function generateMetadata(): Promise<Metadata> {
  const t = tasksProjectsText[await getServerLocale()].projects;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function PortalProjectsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/portal/giris?redirect=/portal/projeler");

  const locale = await getServerLocale();
  const [projects, requests] = await Promise.all([
    getPortalProjects(user.id, locale),
    getProjectJoinRequests(user, locale),
  ]);

  const canReviewAll = userCan(user, "projects.review_requests");
  const viewer: ProjectViewer = {
    id: user.id,
    canCreate: userCan(user, "projects.create"),
    canReviewAll,
    canReview: canReviewAll || projects.some((project) => project.userStatus === "lead"),
  };

  return <ProjectsPortalClient initialProjects={projects} initialRequests={requests} viewer={viewer} />;
}

import React from "react";
import { Metadata } from "next";
import ProjectsPortalClient from "@/components/portal/projects/ProjectsPortalClient";
import {
  getPortalProjects,
  getProjectJoinRequests,
} from "@/lib/projects/project-queries";

export const metadata: Metadata = {
  title: "Projeler & Çalışma Grupları | IUS Engineering Club",
  description: "Kulüp donanım, yazılım, yapay zekâ ve İHA projeleri, katılım başvuruları.",
};

export default async function PortalProjectsPage() {
  const [projects, requests] = await Promise.all([
    getPortalProjects(),
    getProjectJoinRequests(),
  ]);

  return (
    <ProjectsPortalClient
      initialProjects={projects}
      initialRequests={requests}
    />
  );
}

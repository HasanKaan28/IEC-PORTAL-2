import React from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import TasksManagerClient from "@/components/portal/tasks/TasksManagerClient";
import { getSessionUser, userCan } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { tasksProjectsText } from "@/lib/i18n/portal/tasks-projects";
import { getAssignableMembers, getAvailableProjects, getTasks } from "@/lib/tasks/task-queries";
import type { TaskViewer } from "@/lib/tasks/task-types";

export async function generateMetadata(): Promise<Metadata> {
  const t = tasksProjectsText[await getServerLocale()].tasks;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function PortalTasksPage() {
  const user = await getSessionUser();
  if (!user) redirect("/portal/giris?redirect=/portal/gorevler");

  const locale = await getServerLocale();
  const [tasks, members, projects] = await Promise.all([
    getTasks(undefined, locale),
    getAssignableMembers(),
    getAvailableProjects(locale),
  ]);

  const viewer: TaskViewer = {
    id: user.id,
    canAssign: userCan(user, "tasks.assign"),
    canManage: userCan(user, "tasks.manage"),
  };

  return <TasksManagerClient initialTasks={tasks} members={members} projects={projects} viewer={viewer} />;
}

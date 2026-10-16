import React from "react";
import { Metadata } from "next";
import TasksManagerClient from "@/components/portal/tasks/TasksManagerClient";
import {
  getTasks,
  getAssignableMembers,
  getAvailableProjects,
} from "@/lib/tasks/task-queries";

export const metadata: Metadata = {
  title: "Görev Panosu",
  description: "Sprint ve proje görevleri, Kanban panosu ve atama yönetimi.",
};

export default async function PortalTasksPage() {
  const [tasks, members, projects] = await Promise.all([
    getTasks(),
    getAssignableMembers(),
    getAvailableProjects(),
  ]);

  return (
    <TasksManagerClient
      initialTasks={tasks}
      members={members}
      projects={projects}
    />
  );
}

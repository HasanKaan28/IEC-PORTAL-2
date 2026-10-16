import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type DashboardTaskStatus = "todo" | "in_progress" | "in_review" | "done";
export type DashboardTaskPriority = "low" | "medium" | "high" | "urgent";

export interface DashboardTask {
  id: string;
  title: string;
  status: DashboardTaskStatus;
  priority: DashboardTaskPriority;
  dueDate: string | null;
  projectTitle: { tr: string; en: string } | null;
}

export interface DashboardEvent {
  id: string;
  title: string;
  venue: string;
  dateTime: string;
}

export interface DashboardData {
  openTasks: number;
  inProgressTasks: number;
  doneTasks: number;
  projects: number;
  certificates: number;
  nextTasks: DashboardTask[];
  upcomingEvents: DashboardEvent[];
}

const EMPTY: DashboardData = {
  openTasks: 0,
  inProgressTasks: 0,
  doneTasks: 0,
  projects: 0,
  certificates: 0,
  nextTasks: [],
  upcomingEvents: [],
};

const PRIORITY_ORDER: Record<DashboardTaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };

/** Everything on the portal home for one member, read through RLS with their own session. */
export async function getDashboardData(userId: string): Promise<DashboardData> {
  if (!isSupabaseConfigured()) return EMPTY;
  try {
    const supabase = await createClient();
    const [tasksResult, projectsResult, certificatesResult, eventsResult] = await Promise.all([
      (supabase.from("tasks") as any)
        .select("id, title, status, priority, due_date, project:projects(title_tr, title_en)")
        .eq("assignee_id", userId)
        .limit(200),
      (supabase.from("project_members") as any).select("id", { count: "exact", head: true }).eq("user_id", userId),
      (supabase.from("certificates") as any).select("id", { count: "exact", head: true }).eq("user_id", userId),
      (supabase.from("events") as any)
        .select("id, title, venue, date_time")
        .gte("date_time", new Date().toISOString())
        .order("date_time", { ascending: true })
        .limit(3),
    ]);

    const rows = (tasksResult.data ?? []) as Array<{
      id: string;
      title: string;
      status: DashboardTaskStatus;
      priority: DashboardTaskPriority;
      due_date: string | null;
      project: { title_tr: string; title_en: string } | null;
    }>;

    const open = rows.filter((row) => row.status !== "done");
    const nextTasks = [...open]
      .sort((a, b) => {
        const aDue = a.due_date ? Date.parse(a.due_date) : Number.POSITIVE_INFINITY;
        const bDue = b.due_date ? Date.parse(b.due_date) : Number.POSITIVE_INFINITY;
        if (aDue !== bDue) return aDue - bDue;
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      })
      .slice(0, 5)
      .map((row) => ({
        id: row.id,
        title: row.title,
        status: row.status,
        priority: row.priority,
        dueDate: row.due_date,
        projectTitle: row.project ? { tr: row.project.title_tr, en: row.project.title_en } : null,
      }));

    const events = (eventsResult.data ?? []) as Array<{ id: string; title: string; venue: string; date_time: string }>;

    return {
      openTasks: open.length,
      inProgressTasks: open.filter((row) => row.status === "in_progress").length,
      doneTasks: rows.length - open.length,
      projects: projectsResult.count ?? 0,
      certificates: certificatesResult.count ?? 0,
      nextTasks,
      upcomingEvents: events.map((event) => ({
        id: event.id,
        title: event.title,
        venue: event.venue,
        dateTime: event.date_time,
      })),
    };
  } catch (error) {
    console.error("[dashboard] query failed", error);
    return EMPTY;
  }
}

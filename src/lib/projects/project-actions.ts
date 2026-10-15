"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ProjectJoinRequestItem, PortalProjectItem } from "./project-types";
import {
  memoryProjects,
  memoryProjectJoinRequests,
  getProjectJoinRequests,
} from "./project-queries";

export async function requestJoinProjectAction(projectId: string, message: string) {
  if (!message || message.trim().length < 5) {
    return { success: false, error: "Lütfen en az 5 karakterlik bir motivasyon notu yazınız." };
  }

  let currentUserId = "usr-current";
  let currentUserName = "Kaan Mete Şenyıldız";
  let currentUserEmail = "student@ius.edu.ba";
  let currentUserDept = "Bilgisayar Bilimleri (CSE)";
  let currentUserClass = "2. Sınıf";

  const cookieStore = await cookies();
  const hasDemo = cookieStore.get("iec_demo_session")?.value === "true";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      currentUserId = user.id;
      const { data: prof } = (await supabase
        .from("profiles")
        .select("full_name, email, department, class_year")
        .eq("id", user.id)
        .single()) as any;

      if (prof) {
        currentUserName = prof.full_name || user.email;
        currentUserEmail = prof.email || user.email;
        currentUserDept = prof.department || "FENS";
        currentUserClass = prof.class_year || "1. Sınıf";
      }
    }
  } catch {
    // Fallback
  }

  const proj = memoryProjects.find((p) => p.id === projectId);

  const newRequest: ProjectJoinRequestItem = {
    id: `pjr-${Date.now()}`,
    projectId,
    projectTitle: proj?.title || "Mühendislik Projesi",
    userId: currentUserId,
    userName: currentUserName,
    userEmail: currentUserEmail,
    userDepartment: currentUserDept,
    classYear: currentUserClass,
    message: message.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  try {
    const admin = createAdminClient();
    await (admin.from("project_join_requests") as any).insert({
      project_id: projectId,
      user_id: currentUserId,
      message: message.trim(),
      status: "pending",
    });
  } catch {
    // Fallback
  }

  memoryProjectJoinRequests.unshift(newRequest);

  // Update user status in memory project
  if (proj) {
    proj.userStatus = "pending";
  }

  revalidatePath("/portal/projeler");
  return { success: true, request: newRequest };
}

export async function reviewProjectJoinRequestAction(
  requestId: string,
  status: "approved" | "rejected",
  reviewerNote?: string
) {
  try {
    const admin = createAdminClient();
    await (admin.from("project_join_requests") as any)
      .update({
        status,
        reviewer_note: reviewerNote || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);
  } catch {
    // Fallback
  }

  const req = memoryProjectJoinRequests.find((r) => r.id === requestId);
  if (req) {
    req.status = status;
    req.reviewerNote = reviewerNote || null;

    if (status === "approved") {
      const proj = memoryProjects.find((p) => p.id === req.projectId);
      if (proj) {
        proj.membersCount += 1;
        proj.userStatus = "member";
      }
    }
  }

  revalidatePath("/portal/projeler");
  return { success: true };
}

export async function getProjectJoinRequestsAction() {
  return getProjectJoinRequests();
}

export async function createProjectAction(data: {
  title: string;
  category: "Gömülü Sistemler" | "Web & Mobil" | "Yapay Zekâ" | "Havacılık & Robotik";
  description: string;
  openPositions: string[];
  githubUrl?: string;
  demoUrl?: string;
}) {
  if (!data.title || data.title.trim().length < 3) {
    return { success: false, error: "Lütfen en az 3 karakterlik geçerli bir proje başlığı giriniz." };
  }

  let currentUserId = "";
  let currentUserName = "";
  let currentUserRole = "Proje Yürütücüsü";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      currentUserId = user.id;
      const { data: prof } = (await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()) as any;
      if (prof) {
        currentUserName = prof.full_name || user.email || "";
      }
    }
  } catch {
    // Fallback
  }

  const slug = data.title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const newProject: PortalProjectItem = {
    id: `proj-${Date.now()}`,
    slug: slug || `project-${Date.now()}`,
    title: data.title.trim(),
    description: data.description.trim(),
    category: data.category,
    status: "planning",
    leadId: currentUserId,
    leadName: currentUserName,
    leadRole: currentUserName ? currentUserRole : "",
    membersCount: currentUserId ? 1 : 0,
    openPositions: data.openPositions || [],
    githubUrl: data.githubUrl || undefined,
    demoUrl: data.demoUrl || undefined,
    userStatus: currentUserId ? "lead" : "none",
  };

  try {
    const admin = createAdminClient();
    await (admin.from("projects") as any).insert({
      id: newProject.id,
      slug: newProject.slug,
      title: newProject.title,
      description: newProject.description,
      category: newProject.category,
      status: "planning",
      lead_id: currentUserId || null,
      github_url: data.githubUrl || null,
      demo_url: data.demoUrl || null,
    });
  } catch {
    // Fallback
  }

  memoryProjects.push(newProject);
  revalidatePath("/portal/projeler");
  return { success: true, project: newProject };
}


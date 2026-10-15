"use server";

import { revalidatePath } from "next/cache";
import { UserRole, canManageRole } from "@/lib/rbac/permissions";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export interface AdminUserItem {
  id: string;
  fullName: string;
  email: string;
  department: string;
  classYear: string;
  roles: UserRole[];
  joinedAt: string;
}

export interface AdminApplicationItem {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  department: string;
  classYear: string;
  statement: string;
  status: "pending" | "approved" | "rejected";
  reviewerNotes?: string | null;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}

// In-memory store for development/preview when remote DB is not yet connected
let localMockUsers: AdminUserItem[] = [
  {
    id: "usr-1",
    fullName: "Kaan Mete Şenyıldız",
    email: "student@ius.edu.ba",
    department: "Bilgisayar Bilimleri (CSE)",
    classYear: "2. Sınıf",
    roles: ["super_admin", "leader"],
    joinedAt: "2026-10-10",
  },
  {
    id: "usr-2",
    fullName: "Mahmut İhsan Avcı",
    email: "mavci@student.ius.edu.ba",
    department: "Yazılım Mühendisliği (SE)",
    classYear: "2. Sınıf",
    roles: ["admin", "leader", "project_lead"],
    joinedAt: "2026-10-11",
  },
  {
    id: "usr-3",
    fullName: "Bekir Enes Çokbekler",
    email: "bcokbekler@student.ius.edu.ba",
    department: "Mühendislik Fakültesi (FENS)",
    classYear: "2. Sınıf",
    roles: ["admin", "task_manager"],
    joinedAt: "2026-10-11",
  },
  {
    id: "usr-4",
    fullName: "Muhammed Efe Ural",
    email: "mural@student.ius.edu.ba",
    department: "Mühendislik Fakültesi (FENS)",
    classYear: "2. Sınıf",
    roles: ["leader", "blog_author"],
    joinedAt: "2026-10-12",
  },
  {
    id: "usr-5",
    fullName: "Bakir Bašić",
    email: "bbasic@student.ius.edu.ba",
    department: "FENS 1. Sınıf",
    classYear: "1. Sınıf",
    roles: ["blog_author", "member"],
    joinedAt: "2026-10-12",
  },
  {
    id: "usr-6",
    fullName: "Nazlıcan Cebeci",
    email: "ncebeci@student.ius.edu.ba",
    department: "Endüstri Mühendisliği (IE)",
    classYear: "1. Sınıf",
    roles: ["member"],
    joinedAt: "2026-10-13",
  },
];

let localMockApplications: AdminApplicationItem[] = [
  {
    id: "app-101",
    fullName: "Bilal Yusuf Şimşek",
    email: "bsimsek@student.ius.edu.ba",
    phone: "+387 61 111 222",
    department: "Computer Sciences and Engineering (CSE)",
    classYear: "1. Sınıf",
    statement: "DevHack 2027 ve donanım istasyonlarında gömülü yazılım geliştirmek istiyorum. C++ ve Python deneyimim var.",
    status: "pending",
    createdAt: "2026-10-14T10:30:00Z",
  },
  {
    id: "app-102",
    fullName: "Emin Efe Duman",
    email: "eduman@student.ius.edu.ba",
    phone: "+387 62 333 444",
    department: "Software Engineering (SE)",
    classYear: "2. Sınıf",
    statement: "Yapay zekâ ve web teknolojileri komitesinde aktif olmak, kampüs yemekhane mobil uygulamasını geliştirmek istiyorum.",
    status: "pending",
    createdAt: "2026-10-14T14:15:00Z",
  },
  {
    id: "app-103",
    fullName: "Işıl Irmak Cihan",
    email: "icihan@student.ius.edu.ba",
    department: "Electrical and Electronics Engineering (EE)",
    classYear: "1. Sınıf",
    statement: "PowerHub manyetik şarj devre tasarımı ve batarya yönetim sistemi testlerinde yer almak istiyorum.",
    status: "approved",
    reviewerNotes: "Donanım komitesi için uygun bulundu.",
    createdAt: "2026-10-13T09:00:00Z",
  },
];

let localMockAuditLogs: AuditLogItem[] = [
  {
    id: "log-1",
    actorName: "Kaan Mete Şenyıldız",
    action: "role.assign",
    targetType: "user",
    targetId: "usr-4",
    details: "Muhammed Efe Ural kullanıcısına 'leader' rolü atandı.",
    createdAt: "2026-10-15T12:00:00Z",
  },
  {
    id: "log-2",
    actorName: "Mahmut İhsan Avcı",
    action: "application.approve",
    targetType: "application",
    targetId: "app-103",
    details: "Işıl Irmak Cihan üyelik başvurusu kabul edildi.",
    createdAt: "2026-10-14T16:30:00Z",
  },
];

export async function getAdminUsersAction(): Promise<AdminUserItem[]> {
  try {
    const supabase = await createClient();
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, department, class_year, created_at");
    const { data: roles } = await supabase.from("user_roles").select("user_id, role");

    if (profiles && (profiles as any[]).length > 0) {
      return (profiles as any[]).map((p: any) => {
        const userRoles = ((roles as any[]) || [])
          .filter((r: any) => r.user_id === p.id)
          .map((r: any) => r.role as UserRole);

        return {
          id: p.id,
          fullName: p.full_name,
          email: p.email,
          department: p.department || "FENS",
          classYear: p.class_year || "1. Sınıf",
          roles: userRoles.length > 0 ? userRoles : ["member"],
          joinedAt: p.created_at,
        };
      });
    }
  } catch {
    // Fallback to in-memory state
  }

  return localMockUsers;
}

export async function toggleUserRoleAction(userId: string, targetRole: UserRole, assign: boolean) {
  // Check permission hierarchy
  const actorRoles: UserRole[] = ["super_admin"];
  if (!canManageRole(actorRoles, targetRole)) {
    return {
      success: false,
      error: "Bu rolü değiştirmek için yetkiniz bulunmamaktadır.",
    };
  }

  try {
    const adminClient = createAdminClient();
    if (assign) {
      await (adminClient.from("user_roles") as any).insert({
        user_id: userId,
        role: targetRole,
      });
    } else {
      await (adminClient.from("user_roles") as any)
        .delete()
        .eq("user_id", userId)
        .eq("role", targetRole);
    }

    // Write to audit log
    await (adminClient.from("audit_logs") as any).insert({
      action: assign ? "role.assign" : "role.remove",
      target_type: "user",
      target_id: userId,
      details: { role: targetRole },
    });
  } catch {
    // Fallback in-memory
    const u = localMockUsers.find((x) => x.id === userId);
    if (u) {
      if (assign && !u.roles.includes(targetRole)) {
        u.roles.push(targetRole);
      } else if (!assign) {
        u.roles = u.roles.filter((r) => r !== targetRole);
      }

      localMockAuditLogs.unshift({
        id: `log-${Date.now()}`,
        actorName: "Süper Yönetici",
        action: assign ? "role.assign" : "role.remove",
        targetType: "user",
        targetId: userId,
        details: `${u.fullName} kullanıcısına '${targetRole}' rolü ${assign ? "verildi" : "kaldırıldı"}.`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  revalidatePath("/portal/admin");
  revalidatePath("/portal/admin/roller");

  return { success: true };
}

export async function getAdminApplicationsAction(): Promise<AdminApplicationItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("applications").select("*").order("created_at", { ascending: false });

    if (data && data.length > 0) {
      return data.map((a: any) => ({
        id: a.id,
        fullName: a.full_name,
        email: a.email,
        phone: a.phone,
        department: a.department,
        classYear: a.class_year,
        statement: a.statement,
        status: a.status,
        reviewerNotes: a.reviewer_notes,
        createdAt: a.created_at,
      }));
    }
  } catch {
    // Fallback
  }

  return localMockApplications;
}

export async function updateApplicationStatusAction(
  appId: string,
  newStatus: "approved" | "rejected",
  notes?: string
) {
  try {
    const adminClient = createAdminClient();
    await (adminClient.from("applications") as any)
      .update({
        status: newStatus,
        reviewer_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appId);

    await (adminClient.from("audit_logs") as any).insert({
      action: `application.${newStatus}`,
      target_type: "application",
      target_id: appId,
      details: { status: newStatus, notes },
    });
  } catch {
    const app = localMockApplications.find((a) => a.id === appId);
    if (app) {
      app.status = newStatus;
      app.reviewerNotes = notes || null;

      localMockAuditLogs.unshift({
        id: `log-${Date.now()}`,
        actorName: "Yönetici",
        action: `application.${newStatus}`,
        targetType: "application",
        targetId: appId,
        details: `${app.fullName} isimli adayın başvurusu ${newStatus === "approved" ? "onaylandı" : "reddedildi"}.`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  revalidatePath("/portal/admin");
  revalidatePath("/portal/admin/basvurular");

  return { success: true };
}

export async function getAuditLogsAction(): Promise<AuditLogItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false });

    if (data && data.length > 0) {
      return data.map((l: any) => ({
        id: l.id,
        actorName: l.actor_id || "Yönetici",
        action: l.action,
        targetType: l.target_type,
        targetId: l.target_id || "",
        details: typeof l.details === "object" ? JSON.stringify(l.details) : String(l.details || ""),
        createdAt: l.created_at,
      }));
    }
  } catch {
    // Fallback
  }

  return localMockAuditLogs;
}

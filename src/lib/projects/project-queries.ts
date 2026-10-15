import { createClient } from "@/lib/supabase/server";
import { PortalProjectItem, ProjectJoinRequestItem } from "./project-types";

export const initialProjects: PortalProjectItem[] = [
  {
    id: "proj-1",
    slug: "ius-powerhub-smart-station",
    title: "IUS PowerHub — Akıllı Şarj İstasyonu",
    description:
      "FENS koridorları için tasarlanan modüler akıllı şarj istasyonu. ESP32 mikrokontrolcü, SPI tabanlı Mifare RFID okuyucu, manyetik röle koruması ve FreeRTOS çekirdek izolasyonu ile donatılmıştır.",
    category: "Gömülü Sistemler",
    status: "in_progress",
    leadId: "",
    leadName: "",
    leadRole: "",
    leadAvatar: undefined,
    membersCount: 0,
    openPositions: ["PCB Layout Designer", "Gömülü C++ Geliştirici", "MQTT Telemetri Uzmanı"],
    githubUrl: "https://github.com/HasanKaan28/ius-powerhub",
    demoUrl: "https://iec.ius.edu.ba/projeler/powerhub",
    userStatus: "none",
  },
  {
    id: "proj-2",
    slug: "devhack-2027-competition-platform",
    title: "DevHack 2027 — Hackathon Platformu",
    description:
      "24 saatlik uluslararası Saraybosna hackathonu için takım eşleştirme, jüri puanlama sistemi, canlı mentor çağrı botu ve dinamik QR sertifika üretim platformu.",
    category: "Web & Mobil",
    status: "in_progress",
    leadId: "",
    leadName: "",
    leadRole: "",
    leadAvatar: undefined,
    membersCount: 0,
    openPositions: ["Next.js Frontend Geliştirici", "Supabase DB Mimarı", "UI/UX Tasarımcı"],
    githubUrl: "https://github.com/HasanKaan28/devhack-platform",
    demoUrl: "https://devhack.ius.edu.ba",
    userStatus: "none",
  },
  {
    id: "proj-3",
    slug: "ius-campus-assistant-app",
    title: "IUS Kampüs Asistanı — Mobil Uygulama",
    description:
      "Öğrencilerin kampüs yemekhane menüsünü, derslik boşluk durumlarını, ring servis saatlerini ve kulüp etkinliklerini tek ekrandan takip ettiği React Native / Expo tabanlı mobil asistan.",
    category: "Web & Mobil",
    status: "in_progress",
    leadId: "",
    leadName: "",
    leadRole: "",
    leadAvatar: undefined,
    membersCount: 0,
    openPositions: ["React Native Geliştirici", "Figma Tasarımcısı"],
    githubUrl: "https://github.com/HasanKaan28/campus-assistant",
    userStatus: "none",
  },
];

export const initialProjectJoinRequests: ProjectJoinRequestItem[] = [];

export const memoryProjects: PortalProjectItem[] = [...initialProjects];
export const memoryProjectJoinRequests: ProjectJoinRequestItem[] = [...initialProjectJoinRequests];

export async function getPortalProjects(): Promise<PortalProjectItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("projects").select("*, profiles:lead_id(full_name, avatar_url)");

    if (data && (data as any[]).length > 0) {
      return (data as any[]).map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        category: p.category || "Gömülü Sistemler",
        status: p.status,
        leadId: p.lead_id || "",
        leadName: p.profiles?.full_name || "",
        leadRole: p.lead_role || "",
        leadAvatar: p.profiles?.avatar_url,
        membersCount: p.members_count || 0,
        openPositions: p.open_positions || ["Geliştirici"],
        githubUrl: p.github_url,
        demoUrl: p.demo_url,
        userStatus: "none",
      }));
    }
  } catch {
    // Fallback
  }

  return memoryProjects;
}

export async function getProjectJoinRequests(): Promise<ProjectJoinRequestItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("project_join_requests")
      .select("*, projects:project_id(title), profiles:user_id(full_name, email, department, class_year)")
      .order("created_at", { ascending: false });

    if (data && (data as any[]).length > 0) {
      return (data as any[]).map((r: any) => ({
        id: r.id,
        projectId: r.project_id,
        projectTitle: r.projects?.title || "Proje",
        userId: r.user_id,
        userName: r.profiles?.full_name || "Aday Üye",
        userEmail: r.profiles?.email || "",
        userDepartment: r.profiles?.department || "FENS",
        classYear: r.profiles?.class_year || "1. Sınıf",
        message: r.message,
        status: r.status,
        reviewerNote: r.reviewer_note,
        createdAt: r.created_at,
      }));
    }
  } catch {
    // Fallback
  }

  return memoryProjectJoinRequests;
}

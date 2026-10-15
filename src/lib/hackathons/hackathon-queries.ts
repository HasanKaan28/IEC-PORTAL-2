import { createClient } from "@/lib/supabase/server";
import {
  HackathonItem,
  HackathonTeamItem,
  HackathonJoinRequestItem,
  LookingForTeamMemberItem,
} from "./hackathon-types";

export const initialHackathons: HackathonItem[] = [
  {
    id: "hack-1",
    title: "DevHack 2027 — Uluslararası Saraybosna Hackathonu",
    description:
      "24 saat boyunca kesintisiz kodlama ve prototipleme maratonu! Akıllı Kampüs & IoT, FinTech ve Açık Kaynak Sosyal Fayda kategorilerinde üniversite öğrencilerini buluşturan amiral gemisi etkinliğimiz.",
    locationCountry: "Saraybosna, Bosna-Hersek (IUS Kampüsü)",
    startDate: "2027-05-15",
    endDate: "2027-05-16",
    applicationUrl: "https://devhack.ius.edu.ba",
    tags: ["24-Saat", "IoT", "Yapay Zeka", "Ödüllü", "FENS"],
    teamsCount: 8,
    isOpen: true,
  },
  {
    id: "hack-2",
    title: "IEEE TechX Balkan Engineering Challenge",
    description:
      "Güneydoğu Avrupa IEEE öğrenci kolları ortaklığıyla düzenlenen hibrit donanım ve gömülü yazılım yarışması.",
    locationCountry: "Zagreb / Hibrit",
    startDate: "2027-04-22",
    endDate: "2027-04-24",
    applicationUrl: "https://ieee-techx.org",
    tags: ["Donanım", "IEEE", "Robotik", "Hibrit"],
    teamsCount: 3,
    isOpen: true,
  },
  {
    id: "hack-3",
    title: "NASA Space Apps Challenge — Sarajevo Local",
    description:
      "NASA'nın açık uydu ve gezegen verilerini kullanarak dünya ve uzay problemlerine 48 saatlik global çözüm maratonu.",
    locationCountry: "Saraybosna Etabı / Global",
    startDate: "2027-10-02",
    endDate: "2027-10-04",
    applicationUrl: "https://spaceappschallenge.org",
    tags: ["NASA", "Uzay", "Büyük Veri", "Global"],
    teamsCount: 2,
    isOpen: false,
  },
];

export const initialHackathonTeams: HackathonTeamItem[] = [
  {
    id: "team-1",
    hackathonId: "hack-1",
    hackathonTitle: "DevHack 2027",
    name: "Sarajevo Pulse IoT",
    description:
      "Kampüs içi enerji tüketimini ve priz doluluk oranını gerçek zamanlı izleyen, ESP32 ve BLE örgü ağ (mesh network) mimarisine sahip donanım MVP'si geliştiriyoruz.",
    isOpen: true,
    lookingFor: ["Flutter / Mobil Geliştirici", "Altium PCB Çizimcisi", "3D Kabin Tasarımcısı"],
    leaderId: "usr-1",
    leaderName: "Hasan Kaan Karabulut",
    leaderAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    leaderRole: "Takım Kaptanı & Donanımcı",
    members: [
      {
        id: "usr-1",
        name: "Hasan Kaan Karabulut",
        role: "Donanım Lideri",
        department: "CSE",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      },
    ],
    userStatus: "leader",
  },
];

export const initialLookingForTeamMembers: LookingForTeamMemberItem[] = [];

export const initialHackathonJoinRequests: HackathonJoinRequestItem[] = [];

export const memoryHackathons: HackathonItem[] = [...initialHackathons];
export const memoryHackathonTeams: HackathonTeamItem[] = [...initialHackathonTeams];
export const memoryLookingForTeamMembers: LookingForTeamMemberItem[] = [...initialLookingForTeamMembers];
export const memoryHackathonJoinRequests: HackathonJoinRequestItem[] = [...initialHackathonJoinRequests];

export async function getHackathons(): Promise<HackathonItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("hackathons").select("*").order("start_date", { ascending: true });

    if (data && (data as any[]).length > 0) {
      return (data as any[]).map((h: any) => ({
        id: h.id,
        title: h.title,
        description: h.description,
        locationCountry: h.location_country,
        startDate: h.start_date,
        endDate: h.end_date,
        applicationUrl: h.application_url,
        tags: h.tags || [],
        teamsCount: 3,
        isOpen: true,
      }));
    }
  } catch {
    // Fallback
  }

  return memoryHackathons;
}

export async function getHackathonTeams(hackathonId?: string): Promise<HackathonTeamItem[]> {
  if (hackathonId && hackathonId !== "all") {
    return memoryHackathonTeams.filter((t) => t.hackathonId === hackathonId);
  }
  return memoryHackathonTeams;
}

export async function getLookingForTeamMembers(): Promise<LookingForTeamMemberItem[]> {
  return memoryLookingForTeamMembers;
}

export async function getHackathonJoinRequests(teamId?: string): Promise<HackathonJoinRequestItem[]> {
  if (teamId) {
    return memoryHackathonJoinRequests.filter((r) => r.teamId === teamId);
  }
  return memoryHackathonJoinRequests;
}

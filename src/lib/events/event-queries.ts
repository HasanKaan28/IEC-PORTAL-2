import { createClient } from "@/lib/supabase/server";
import {
  EventItem,
  EventAttendanceItem,
  CertificateItem,
} from "./event-types";

export const initialEvents: EventItem[] = [
  {
    id: "evt-1",
    slug: "freertos-esp32-embedded-masterclass",
    title: "FreeRTOS & ESP32 Gömülü Sistemler Masterclass",
    description:
      "FENS donanım laboratuvarında ESP32 çift çekirdekli mimari, görev önceliklendirme, semafor/kuyruk yönetimi ve SPI/I2C sensör kilitlenmelerini önleyen gerçek zamanlı işletim sistemi (RTOS) atölyesi.",
    venue: "IUS A-Block Donanım Laboratuvarı (Lab 102)",
    dateTime: "2026-10-24T14:00:00Z",
    endTime: "2026-10-24T17:30:00Z",
    category: "workshop",
    instructor: {
      name: "Hasan Kaan Karabulut",
      title: "Donanım Lideri & Bşk.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    },
    capacity: 35,
    registeredCount: 22,
    attendeesCount: 0,
    qrSigningSecret: "sec-freertos-esp32-iec2026",
    isPast: false,
    userStatus: "registered",
    tags: ["FreeRTOS", "ESP32", "Gömülü C++", "Donanım", "Laboratuvar"],
  },
  {
    id: "evt-2",
    slug: "sarajevo-techsummit-2026-industry-keynotes",
    title: "Saraybosna TechSummit 2026: Yapay Zekâ & Endüstriyel Yazılım",
    description:
      "Bit Alliance üyesi küresel teknoloji şirketlerinin CTO'ları ve FENS akademisyenleri ile buluşma. Dağıtık mikroservis mimarileri, bulut güvenliği ve Bosna-Hersek staj fırsatları paneli.",
    venue: "IUS Ana Amfitiyatro (Amphitheater A)",
    dateTime: "2026-11-05T13:00:00Z",
    endTime: "2026-11-05T18:00:00Z",
    category: "seminar",
    instructor: {
      name: "Prof. Dr. Leila Miller",
      title: "FENS Profesörü & Kulüp Akademik Danışmanı",
    },
    capacity: 150,
    registeredCount: 84,
    attendeesCount: 0,
    qrSigningSecret: "sec-techsummit-sarajevo-2026",
    isPast: false,
    userStatus: "none",
    tags: ["AI", "Yazılım Mimarisi", "Kariyer", "Bit Alliance", "Sponsorluk"],
  },
  {
    id: "evt-3",
    slug: "devhack-2027-international-sarajevo-hackathon",
    title: "DevHack 2027: 24 Saatlik Saraybosna Hackathon Açılışı",
    description:
      "Saraybosna'nın en büyük üniversiteler arası 24 saatlik yatılı kodlama ve donanım maratonu. IoT, FinTech ve sosyal fayda kategorilerinde nakit ödüllü jüri sunumları.",
    venue: "IUS FENS Atrium & Konferans Salonu",
    dateTime: "2027-05-15T09:00:00Z",
    endTime: "2027-05-16T12:00:00Z",
    category: "hackathon",
    instructor: {
      name: "Mahmut İhsan Avcı",
      title: "Asistan & DevHack Direktörü",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    },
    capacity: 100,
    registeredCount: 42,
    attendeesCount: 0,
    qrSigningSecret: "sec-devhack-marathon-2027",
    isPast: false,
    userStatus: "none",
    tags: ["24-Saat", "Yarışma", "Nakit Ödül", "Prototipleme", "Jüri"],
  },
  {
    id: "evt-4",
    slug: "pcb-design-altium-prototyping-workshop",
    title: "PCB Tasarımı ve Altium Donanım Prototipleme Atölyesi",
    description:
      "Şematik çizimden çok katmanlı PCB layout tasarımına, gerber dosyası üretiminden SMD fırın lehimlemesine kadar tam kapsamlı donanım mühendisliği atölyesi.",
    venue: "IUS A-Block Donanım Laboratuvarı (Lab 102)",
    dateTime: "2026-10-10T10:00:00Z",
    endTime: "2026-10-10T16:00:00Z",
    category: "workshop",
    instructor: {
      name: "Hasan Kaan Karabulut",
      title: "Donanım Lideri & Bşk.",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    },
    capacity: 30,
    registeredCount: 28,
    attendeesCount: 26,
    qrSigningSecret: "sec-pcb-altium-past-2026",
    isPast: true,
    userStatus: "attended",
    tags: ["Altium Designer", "PCB Layout", "Donanım", "SMD Lehimleme"],
  },
];

export const initialCertificates: CertificateItem[] = [
  {
    id: "cert-101",
    eventId: "evt-4",
    eventTitle: "PCB Tasarımı ve Altium Donanım Prototipleme Atölyesi",
    userId: "usr-current",
    userName: "Kaan Mete Şenyıldız",
    userDepartment: "Bilgisayar Bilimleri ve Mühendisliği (CSE)",
    certificateCode: "IEC-2026-E49A",
    issueDate: "2026-10-10",
    trainingHours: 6,
    skills: ["Altium Designer", "PCB Layout", "Şematik Tasarım", "SMD Lehimleme", "Donanım Koruması"],
    instructorName: "Hasan Kaan Karabulut",
    verifyUrl: "http://localhost:3000/dogrula?code=IEC-2026-E49A",
  },
];

export const initialEventAttendances: EventAttendanceItem[] = [
  {
    id: "att-1",
    eventId: "evt-4",
    userId: "usr-current",
    userName: "Kaan Mete Şenyıldız",
    userEmail: "student@ius.edu.ba",
    userRole: "Üye",
    checkedInAt: "2026-10-10T10:15:00Z",
  },
];

export const memoryEvents: EventItem[] = [...initialEvents];
export const memoryCertificates: CertificateItem[] = [...initialCertificates];
export const memoryAttendances: EventAttendanceItem[] = [...initialEventAttendances];

export async function getEvents(): Promise<EventItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from("events").select("*").order("date_time", { ascending: true });
    if (data && (data as any[]).length > 0) {
      return (data as any[]).map((e: any) => ({
        id: e.id,
        slug: e.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        title: e.title,
        description: e.description,
        venue: e.venue,
        dateTime: e.date_time,
        endTime: new Date(new Date(e.date_time).getTime() + 3.5 * 3600000).toISOString(),
        category: "workshop",
        instructor: { name: "Hasan Kaan Karabulut", title: "Başkan Yardımcısı" },
        capacity: 40,
        registeredCount: 15,
        attendeesCount: 0,
        qrSigningSecret: e.qr_signing_secret || "default-secret",
        isPast: new Date(e.date_time) < new Date(),
        userStatus: "none",
        tags: ["Mühendislik", "Etkinlik"],
      }));
    }
  } catch {
    // Fallback
  }
  return memoryEvents;
}

export async function getEventById(id: string): Promise<EventItem | null> {
  const all = await getEvents();
  return all.find((e) => e.id === id) || null;
}

export async function getUserCertificates(userId?: string): Promise<CertificateItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("certificates")
      .select("*, events:event_id(title), profiles:user_id(full_name, department)");

    if (data && (data as any[]).length > 0) {
      return (data as any[]).map((c: any) => ({
        id: c.id,
        eventId: c.event_id,
        eventTitle: c.events?.title || "Mühendislik Eğitimi",
        userId: c.user_id,
        userName: c.profiles?.full_name || "Kulüp Üyesi",
        userDepartment: c.profiles?.department || "FENS",
        certificateCode: c.certificate_code,
        issueDate: c.issued_at ? c.issued_at.substring(0, 10) : "2026-10-15",
        trainingHours: 6,
        skills: ["Gömülü Sistemler", "Mühendislik Pratiği"],
        instructorName: "Hasan Kaan Karabulut",
        pdfUrl: c.pdf_url,
        verifyUrl: `http://localhost:3000/dogrula?code=${c.certificate_code}`,
      }));
    }
  } catch {
    // Fallback
  }
  return memoryCertificates;
}

export async function getCertificateByCode(code: string): Promise<CertificateItem | null> {
  const cleanCode = code.trim().toUpperCase();

  try {
    const supabase = await createClient();
    const { data } = await (supabase.from("certificates") as any)
      .select("*, events:event_id(title), profiles:user_id(full_name, department)")
      .ilike("certificate_code", cleanCode)
      .single();

    if (data) {
      return {
        id: data.id,
        eventId: data.event_id,
        eventTitle: data.events?.title || "Mühendislik Eğitimi",
        userId: data.user_id,
        userName: data.profiles?.full_name || "Kulüp Üyesi",
        userDepartment: data.profiles?.department || "FENS",
        certificateCode: data.certificate_code,
        issueDate: data.issued_at ? data.issued_at.substring(0, 10) : "2026-10-15",
        trainingHours: 6,
        skills: ["Donanım Prototipleme", "Gömülü Sistemler", "Mühendislik"],
        instructorName: "Hasan Kaan Karabulut",
        pdfUrl: data.pdf_url,
        verifyUrl: `http://localhost:3000/dogrula?code=${data.certificate_code}`,
      };
    }
  } catch {
    // Fallback
  }

  const match = memoryCertificates.find(
    (c) => c.certificateCode.toUpperCase() === cleanCode
  );
  return match || null;
}

export async function getEventAttendances(eventId: string): Promise<EventAttendanceItem[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("event_attendances")
      .select("*, profiles:user_id(full_name, email)")
      .eq("event_id", eventId)
      .order("checked_in_at", { ascending: false });

    if (data && (data as any[]).length > 0) {
      return (data as any[]).map((a: any) => ({
        id: a.id,
        eventId: a.event_id,
        userId: a.user_id,
        userName: a.profiles?.full_name || "Katılımcı",
        userEmail: a.profiles?.email || "",
        userRole: "Üye",
        checkedInAt: a.checked_in_at,
      }));
    }
  } catch {
    // Fallback
  }

  return memoryAttendances.filter((a) => a.eventId === eventId);
}

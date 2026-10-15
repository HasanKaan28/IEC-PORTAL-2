import { createClient } from "@/lib/supabase/server";
import {
  DirectMessageItem,
  ConversationContact,
  InAppNotificationItem,
} from "./message-types";

export const initialContacts: ConversationContact[] = [
  {
    id: "usr-2",
    name: "Mahmut İhsan Avcı",
    email: "mavci@student.ius.edu.ba",
    role: "Başkan Yardımcısı & Fullstack",
    department: "Yazılım Mühendisliği (SE)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    isOnline: true,
    lastMessage: "Harika! Yarın FENS amfisinde projeksiyona yansıtıp test edelim.",
    lastMessageTime: "17:42",
    unreadCount: 1,
  },
  {
    id: "usr-3",
    name: "Bekir Enes Çokbekler",
    email: "bcokbekler@student.ius.edu.ba",
    role: "Sayman & Finans Lideri",
    department: "Endüstri Mühendisliği (IE)",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80",
    isOnline: false,
    lastMessage: "Kaan, 1.300 KM kulüp bütçe taslağını ve SCC F252 formunu hazırladık.",
    lastMessageTime: "Dün",
    unreadCount: 0,
  },
  {
    id: "usr-advisor",
    name: "Prof. Dr. Leila Miller",
    email: "lmiller@ius.edu.ba",
    role: "FENS Profesörü & Kulüp Akademik Danışmanı",
    department: "Faculty of Engineering (FENS)",
    isOnline: true,
    lastMessage: "FENS laboratuvar rezervasyonu onaylandı, etkinlik duyurusunu paylaşabilirsiniz.",
    lastMessageTime: "12 Eki",
    unreadCount: 0,
  },
  {
    id: "usr-4",
    name: "Muhammed Efe Ural",
    email: "mural@student.ius.edu.ba",
    role: "PR & Medya / Sponsorluk Lideri",
    department: "Bilgisayar Mühendisliği (CSE)",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    isOnline: false,
    lastMessage: "Instagram afiş tasarımlarını ve LinkedIn duyuru metnini yayına aldım.",
    lastMessageTime: "11 Eki",
    unreadCount: 0,
  },
];

export const initialDirectMessages: DirectMessageItem[] = [
  {
    id: "msg-1",
    senderId: "usr-2",
    receiverId: "usr-current",
    content: "Kaan selam! DevHack 2027 platformunda takım kurma ve başvuru modüllerini test ettim, gayet stabil çalışıyor.",
    isRead: true,
    createdAt: "2026-10-15T15:20:00Z",
  },
  {
    id: "msg-2",
    senderId: "usr-current",
    receiverId: "usr-2",
    content: "Selam Mahmut! Eline sağlık, süper olmuş. FreeRTOS Masterclass etkinliği için 60 saniyede bir dönen dinamik QR yoklama motorunu da bağladık.",
    isRead: true,
    createdAt: "2026-10-15T15:28:00Z",
  },
  {
    id: "msg-3",
    senderId: "usr-2",
    receiverId: "usr-current",
    content: "Harika! Yarın FENS amfisinde projeksiyona yansıtıp test edelim.",
    isRead: false,
    createdAt: "2026-10-15T15:42:00Z",
  },
  {
    id: "msg-4",
    senderId: "usr-3",
    receiverId: "usr-current",
    content: "Kaan, 1.300 KM kulüp bütçe taslağını ve SCC F252 formunu hazırladık. İmzalar tamamlanınca teslim edeceğiz.",
    isRead: true,
    createdAt: "2026-10-14T11:15:00Z",
  },
];

export const initialNotifications: InAppNotificationItem[] = [
  {
    id: "notif-1",
    userId: "usr-current",
    type: "cert",
    title: "Yeni Sertifikanız Hazırlandı!",
    message: "PCB Tasarımı ve Altium Prototipleme Atölyesi katılım sertifikanız üretildi: IEC-2026-E49A.",
    link: "/portal/sertifikalarim",
    isRead: false,
    createdAt: "2026-10-15T16:30:00Z",
  },
  {
    id: "notif-2",
    userId: "usr-current",
    type: "task",
    title: "Yeni Görev Atandı",
    message: "FreeRTOS SPI Bus & FreeRTOS Çekirdek İzolasyonu görevi size atandı.",
    link: "/portal/gorevler",
    isRead: false,
    createdAt: "2026-10-15T14:10:00Z",
  },
  {
    id: "notif-3",
    userId: "usr-current",
    type: "event",
    title: "Yaklaşan Etkinlik Hatırlatıcısı",
    message: "FreeRTOS & ESP32 Masterclass etkinliği bu Cumartesi saat 14:00'te A-Block Lab 102'de başlıyor.",
    link: "/portal/etkinlikler",
    isRead: true,
    createdAt: "2026-10-14T09:00:00Z",
  },
  {
    id: "notif-4",
    userId: "usr-current",
    type: "team",
    title: "Hackathon Takım Güncellemesi",
    message: "DevHack 2027: Sarajevo Pulse IoT takımına yeni üye katılım isteği geldi.",
    link: "/portal/hackathon",
    isRead: true,
    createdAt: "2026-10-13T11:20:00Z",
  },
];

export const memoryContacts: ConversationContact[] = [...initialContacts];
export const memoryDirectMessages: DirectMessageItem[] = [...initialDirectMessages];
export const memoryNotifications: InAppNotificationItem[] = [...initialNotifications];

export async function getContacts(): Promise<ConversationContact[]> {
  try {
    const supabase = await createClient();
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, email, department, role, avatar_url");

    if (profiles && profiles.length > 0) {
      return profiles.map((p: any) => ({
        id: p.id,
        name: p.full_name || "Kulüp Üyesi",
        email: p.email,
        role: p.role || "Üye",
        department: p.department || "FENS",
        avatar: p.avatar_url,
        isOnline: true,
        lastMessage: "Sohbet başlatmak için tıklayın.",
        lastMessageTime: "Yeni",
        unreadCount: 0,
      }));
    }
  } catch {
    // Fallback
  }

  return memoryContacts;
}

export async function getDirectMessages(otherUserId: string): Promise<DirectMessageItem[]> {
  const currentUserId = "usr-current";

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("direct_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    if (data && (data as any[]).length > 0) {
      return (data as any[]).map((m: any) => ({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        content: m.content,
        isRead: m.is_read,
        createdAt: m.created_at,
      }));
    }
  } catch {
    // Fallback
  }

  return memoryDirectMessages.filter(
    (m) =>
      (m.senderId === currentUserId && m.receiverId === otherUserId) ||
      (m.senderId === otherUserId && m.receiverId === currentUserId)
  );
}

export async function getNotifications(): Promise<InAppNotificationItem[]> {
  const currentUserId = "usr-current";

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (data && (data as any[]).length > 0) {
      return (data as any[]).map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        type: "task",
        title: n.title,
        message: n.message,
        link: n.link || "/portal",
        isRead: n.is_read,
        createdAt: n.created_at,
      }));
    }
  } catch {
    // Fallback
  }

  return memoryNotifications;
}

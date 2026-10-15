export type EventCategory = "workshop" | "seminar" | "hackathon" | "project_meetup";

export interface EventInstructor {
  name: string;
  title: string;
  avatar?: string;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  venue: string;
  dateTime: string;
  endTime: string;
  category: EventCategory;
  instructor: EventInstructor;
  capacity: number;
  registeredCount: number;
  attendeesCount: number;
  qrSigningSecret: string;
  isPast: boolean;
  userStatus: "none" | "registered" | "attended";
  tags: string[];
}

export interface EventAttendanceItem {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
  checkedInAt: string;
}

export interface CertificateItem {
  id: string;
  eventId: string;
  eventTitle: string;
  userId: string;
  userName: string;
  userDepartment: string;
  certificateCode: string; // e.g. "IEC-2026-E49A"
  issueDate: string;
  trainingHours: number;
  skills: string[];
  instructorName: string;
  pdfUrl?: string;
  verifyUrl: string;
}

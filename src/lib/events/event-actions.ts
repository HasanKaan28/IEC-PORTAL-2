"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { verifyEventTOTP, generateEventTOTP } from "./totp";
import {
  memoryEvents,
  memoryCertificates,
  memoryAttendances,
  getEventById,
  getCertificateByCode,
  getEventAttendances,
} from "./event-queries";
import { CertificateItem, EventAttendanceItem } from "./event-types";
import { generateCertificatePdf } from "@/lib/certificates/certificate-pdf";

export async function registerForEventAction(eventId: string) {
  const event = memoryEvents.find((e) => e.id === eventId);
  if (!event) {
    return { success: false, error: "Etkinlik bulunamadı." };
  }

  if (event.registeredCount >= event.capacity) {
    return { success: false, error: "Bu etkinlik için kontenjan tamamen dolmuştur." };
  }

  event.registeredCount += 1;
  event.userStatus = "registered";

  revalidatePath("/portal/etkinlikler");
  return { success: true };
}

export async function checkInWithTOTPAction(eventId: string, inputCode: string) {
  if (!inputCode || inputCode.trim().length < 5) {
    return { success: false, error: "Lütfen 6 haneli yoklama kodunu veya QR verisini giriniz." };
  }

  const event = memoryEvents.find((e) => e.id === eventId);
  if (!event) {
    return { success: false, error: "Etkinlik bulunamadı." };
  }

  // Verify rotating 60s TOTP code
  const isValid = verifyEventTOTP(event.id, event.qrSigningSecret, inputCode);
  if (!isValid) {
    return {
      success: false,
      error:
        "Yoklama kodu geçersiz veya 60 saniyelik süresi doldu. Lütfen organizatör ekranındaki güncel kodu giriniz.",
    };
  }

  // Get current user details
  let currentUserId = "usr-current";
  let currentUserName = "Kaan Mete Şenyıldız";
  let currentUserEmail = "student@ius.edu.ba";
  let currentUserDept = "Bilgisayar Bilimleri ve Mühendisliği (CSE)";

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      currentUserId = user.id;
      currentUserEmail = user.email || currentUserEmail;
      const { data: prof } = (await supabase
        .from("profiles")
        .select("full_name, department")
        .eq("id", user.id)
        .single()) as any;
      if (prof?.full_name) {
        currentUserName = prof.full_name;
      }
      if (prof?.department) {
        currentUserDept = prof.department;
      }
    }
  } catch {
    // Fallback
  }

  // Check if already checked in
  const existingAttendance = memoryAttendances.find(
    (a) => a.eventId === eventId && a.userId === currentUserId
  );

  if (existingAttendance) {
    const existingCert = memoryCertificates.find(
      (c) => c.eventId === eventId && c.userId === currentUserId
    );
    return {
      success: true,
      alreadyCheckedIn: true,
      certificateCode: existingCert?.certificateCode,
      message: "Yoklamanız daha önce onaylanmıştır. Sertifikanız hazır!",
    };
  }

  // Record Attendance
  const newAttendance: EventAttendanceItem = {
    id: `att-${Date.now()}`,
    eventId,
    userId: currentUserId,
    userName: currentUserName,
    userEmail: currentUserEmail,
    userRole: "Katılımcı",
    checkedInAt: new Date().toISOString(),
  };
  memoryAttendances.unshift(newAttendance);

  event.attendeesCount += 1;
  event.userStatus = "attended";

  // Generate Unique Certificate Code: IEC-2026-XXXX
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  const certCode = `IEC-2026-${randomSuffix}`;

  const newCertificate: CertificateItem = {
    id: `cert-${Date.now()}`,
    eventId: event.id,
    eventTitle: event.title,
    userId: currentUserId,
    userName: currentUserName,
    userDepartment: currentUserDept,
    certificateCode: certCode,
    issueDate: new Date().toISOString().substring(0, 10),
    trainingHours: event.category === "workshop" ? 4 : 6,
    skills: event.tags,
    instructorName: event.instructor.name,
    verifyUrl: `http://localhost:3000/dogrula?code=${certCode}`,
  };

  memoryCertificates.unshift(newCertificate);

  // Attempt database insertion
  try {
    const admin = createAdminClient();
    await (admin.from("event_attendances") as any).insert({
      event_id: eventId,
      user_id: currentUserId,
    });
    await (admin.from("certificates") as any).insert({
      event_id: eventId,
      user_id: currentUserId,
      certificate_code: certCode,
      pdf_url: `/api/certificates/${certCode}/pdf`,
    });
  } catch {
    // Fallback
  }

  revalidatePath("/portal/etkinlikler");
  revalidatePath("/portal/sertifikalarim");

  return {
    success: true,
    certificateCode: certCode,
    certificate: newCertificate,
  };
}

export async function getCertificatePdfBase64Action(certificateCode: string) {
  const cert = await getCertificateByCode(certificateCode);
  if (!cert) {
    return { success: false, error: "Sertifika bulunamadı." };
  }

  try {
    const pdfBytes = await generateCertificatePdf(cert);
    const base64 = Buffer.from(pdfBytes).toString("base64");
    return {
      success: true,
      base64,
      fileName: `${cert.certificateCode}_${cert.userName.replace(/\s+/g, "_")}.pdf`,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "PDF üretilemedi." };
  }
}

export async function getEventLiveTOTPAction(eventId: string) {
  const event = memoryEvents.find((e) => e.id === eventId);
  if (!event) {
    return { success: false, error: "Etkinlik bulunamadı." };
  }

  const { code, payload, remainingSeconds } = generateEventTOTP(
    event.id,
    event.qrSigningSecret
  );

  const attendances = await getEventAttendances(eventId);

  return {
    success: true,
    code,
    payload,
    remainingSeconds,
    attendeesCount: attendances.length,
    attendees: attendances,
  };
}


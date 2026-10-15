import React from "react";
import { Metadata } from "next";
import EmailTemplatesClient from "@/components/portal/admin/EmailTemplatesClient";

export const metadata: Metadata = {
  title: "E-Posta Şablonları & Önizleme | IUS Engineering Club",
  description:
    "Supabase Auth ve Resend uyumlu kurumsal e-posta şablonları canlı önizleme ve yönetim aracı.",
};

export default function AdminEmailTemplatesPage() {
  return <EmailTemplatesClient />;
}

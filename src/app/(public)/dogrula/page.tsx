import React, { Suspense } from "react";
import { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import CertificateVerificationClient from "@/components/public/CertificateVerificationClient";

export const metadata: Metadata = {
  title: "Sertifika Doğrulama Portalı | IUS Engineering Club",
  description:
    "IUS Engineering Club ve FENS tarafından verilen resmi etkinlik, atölye ve hackathon sertifikalarını anında doğrulayın.",
};

export default function CertificateVerificationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#070a11]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <Suspense
          fallback={
            <div className="text-center py-20 text-slate-400 font-mono text-xs">
              Doğrulama portalı yükleniyor...
            </div>
          }
        >
          <CertificateVerificationClient />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

import React, { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import CertificateVerificationClient from "@/components/public/CertificateVerificationClient";
import { getServerLocale } from "@/lib/i18n/server";
import { publicPagesText } from "@/lib/i18n/public/pages";

export async function generateMetadata(): Promise<Metadata> {
  const t = publicPagesText[await getServerLocale()].verify;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function CertificateVerificationPage() {
  const t = publicPagesText[await getServerLocale()].verify;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 px-4 py-16 sm:px-6">
        <Suspense fallback={<p className="py-20 text-center text-sm text-slate-500">{t.loading}</p>}>
          <CertificateVerificationClient />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

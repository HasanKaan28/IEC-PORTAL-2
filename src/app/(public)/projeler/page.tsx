import React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import ProjectsCatalog from "@/components/public/ProjectsCatalog";
import { getServerLocale } from "@/lib/i18n/server";
import { publicPagesText } from "@/lib/i18n/public/pages";

export async function generateMetadata(): Promise<Metadata> {
  const t = publicPagesText[await getServerLocale()].projects;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default function ProjectsCatalogPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 px-4 py-16 sm:px-6">
        <ProjectsCatalog />
      </main>
      <Footer />
    </div>
  );
}

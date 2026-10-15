import React, { Suspense } from "react";
import { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import BlogCatalogView from "@/components/public/BlogCatalogView";
import { getBlogPosts } from "@/lib/blog/blog-queries";

export const metadata: Metadata = {
  title: "Teknik Mühendislik Blogu | IUS Engineering Club",
  description:
    "FENS öğrencilerinin kampüs donanım projeleri, açık kaynak yazılımlar, yapay zekâ deneyleri ve hackathon stratejileri.",
  openGraph: {
    title: "Mühendislik Yazıları | IUS Engineering Club",
    description:
      "FENS öğrencilerinin kampüs donanım projeleri, açık kaynak yazılımlar ve yapay zekâ deneyleri.",
    url: "https://iec.ius.edu.ba/blog",
    siteName: "IUS Engineering Club",
    type: "website",
  },
};

export default async function BlogListingPage() {
  const posts = await getBlogPosts({ status: "published" });

  return (
    <div className="flex flex-col min-h-screen bg-[#070a11]">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Suspense
            fallback={
              <div className="py-24 text-center font-mono text-xs text-slate-500">
                Makaleler yükleniyor...
              </div>
            }
          >
            <BlogCatalogView initialPosts={posts} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

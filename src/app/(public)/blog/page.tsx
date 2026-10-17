import React, { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import BlogCatalogView from "@/components/public/BlogCatalogView";
import { getBlogPosts } from "@/lib/blog/blog-queries";
import { getSessionUser } from "@/lib/auth/session";
import { getServerLocale } from "@/lib/i18n/server";
import { OG_LOCALE } from "@/lib/i18n/format";
import { blogText } from "@/lib/i18n/public/blog";
import { SITE_URL } from "@/lib/site-url";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const t = blogText[locale].meta;

  return {
    title: t.listTitle,
    description: t.listDescription,
    alternates: { canonical: `${SITE_URL}/blog` },
    openGraph: {
      title: t.listTitle,
      description: t.listDescription,
      url: `${SITE_URL}/blog`,
      siteName: "IUS Engineering Club",
      type: "website",
      locale: OG_LOCALE[locale],
      images: [{ url: "/brand/og-card.jpg", width: 1200, height: 630, alt: "IUS Engineering Club" }],
    },
  };
}

export default async function BlogListingPage() {
  const [posts, locale, user] = await Promise.all([
    getBlogPosts({ status: "published" }),
    getServerLocale(),
    getSessionUser(),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main id="main-content" className="flex-1 py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <Suspense
            fallback={
              <div role="status" className="py-24 text-center font-mono text-xs text-slate-500">
                {blogText[locale].catalog.loading}
              </div>
            }
          >
            <BlogCatalogView initialPosts={posts} isSignedIn={Boolean(user)} />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}

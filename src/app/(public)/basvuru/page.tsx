import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import GoogleFormEmbed from "@/components/public/GoogleFormEmbed";
import DimensionLine from "@/components/public/blueprint/DimensionLine";
import { getServerLocale } from "@/lib/i18n/server";
import { publicPagesText } from "@/lib/i18n/public/pages";

export async function generateMetadata(): Promise<Metadata> {
  const t = publicPagesText[await getServerLocale()].apply;
  return { title: t.metaTitle, description: t.metaDescription };
}

export default async function ApplicationPage() {
  const t = publicPagesText[await getServerLocale()].apply;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 px-4 py-16 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-accent-700">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                {t.eyebrow}
              </p>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{t.title}</h1>
              <DimensionLine className="mt-4 w-32" />
              <p className="mt-4 text-sm leading-relaxed text-slate-600">{t.intro}</p>

              <ol className="mt-8 space-y-5">
                {t.steps.map((step, index) => (
                  <li key={step.title} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-brand-300 bg-white/80 font-mono text-sm font-bold text-brand-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">{step.title}</h2>
                      <p className="mt-0.5 text-sm text-slate-500">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <p className="mt-8 text-xs leading-relaxed text-slate-500">
                {t.privacy}{" "}
                <Link href="/kvkk" className="font-medium text-brand-700 hover:text-brand-800">
                  {t.privacyLink}
                </Link>
              </p>
            </div>
          </aside>

          <section className="lg:col-span-8" aria-label={t.formTitle}>
            <GoogleFormEmbed />
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

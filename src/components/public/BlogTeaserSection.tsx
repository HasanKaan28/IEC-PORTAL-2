"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n/locale-context";

// Language-independent post metadata; titles and excerpts come from the dictionary in the same order.
const TEASER_POSTS = [
  { slug: "esp32-rfid-iot-station-architecture", minutes: 5, publishedOn: "2026-10-14" },
  { slug: "linear-task-driven-student-club-management", minutes: 4, publishedOn: "2026-10-12" },
  { slug: "local-rag-ollama-fens-labs", minutes: 7, publishedOn: "2026-10-10" },
];

export default function BlogTeaserSection() {
  const { locale, t } = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <section className="py-20 sm:py-24 px-4 sm:px-6 relative z-10 border-t border-slate-800/80 bg-[#070a11]">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white font-display tracking-tight">{t.blog.title}</h2>
            <p className="text-slate-300 text-base mt-3 max-w-[60ch]">{t.blog.description}</p>
            {t.blog.languageNote && <p className="text-sm text-slate-400 mt-2">{t.blog.languageNote}</p>}
          </div>
          <Link
            href="/blog"
            className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-300 hover:text-white transition-colors"
          >
            <span>{t.blog.viewAll}</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <ul className="divide-y divide-slate-800 border-y border-slate-800">
          {TEASER_POSTS.map((post, index) => {
            const copy = t.blog.posts[index];
            if (!copy) return null;
            return (
              <li key={post.slug}>
                <article className="group relative grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 py-7">
                  <div className="md:col-span-3 text-sm text-slate-400 space-y-1">
                    <time dateTime={post.publishedOn} className="block">
                      {dateFormatter.format(new Date(`${post.publishedOn}T12:00:00`))}
                    </time>
                    <span className="block">{copy.category}</span>
                  </div>
                  <div className="md:col-span-9">
                    <h3 className="text-lg sm:text-xl font-bold text-white font-display group-hover:text-blue-300 transition-colors">
                      <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
                        {copy.title}
                      </Link>
                    </h3>
                    <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-[65ch]">{copy.excerpt}</p>
                    <p className="text-sm text-slate-400 mt-3">
                      {copy.author}, {copy.role} · {post.minutes} {t.blog.minutesRead}
                    </p>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

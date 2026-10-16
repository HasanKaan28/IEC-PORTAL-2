import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import MarkdownRenderer from "@/components/public/MarkdownRenderer";
import BlogCommentSection from "@/components/public/BlogCommentSection";
import BlogDetailClientBar from "@/components/public/BlogDetailClientBar";
import {
  getBlogPostBySlug,
  getBlogComments,
  getBlogPosts,
} from "@/lib/blog/blog-queries";
import { createClient } from "@/lib/supabase/server";
import { Clock, Calendar, ArrowLeft, Tag, BookOpen } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Yazı Bulunamadı",
    };
  }

  const siteUrl = "https://iec.ius.edu.ba";
  const postUrl = `${siteUrl}/blog/${post.slug}`;
  const ogImage =
    post.coverImage ||
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80";

  return {
    title: `${post.title} | IUS Engineering Club`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.authorName }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: postUrl,
      siteName: "IUS Engineering Club",
      type: "article",
      publishedTime: post.publishedAt,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [ogImage],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const comments = await getBlogComments(slug);
  const relatedPosts = (await getBlogPosts({ category: post.category }))
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  // Check auth user
  const cookieStore = await cookies();
  const hasDemo = cookieStore.get("iec_demo_session")?.value === "true";
  let currentUser: { id: string; fullName: string; email: string } | null = null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: prof } = (await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single()) as any;

      currentUser = {
        id: user.id,
        fullName: prof?.full_name || user.email || "Kullanıcı",
        email: prof?.email || user.email || "",
      };
    } else if (hasDemo) {
      currentUser = {
        id: "usr-demo",
        fullName: "Kaan Mete Şenyıldız",
        email: "student@ius.edu.ba",
      };
    }
  } catch {
    if (hasDemo) {
      currentUser = {
        id: "usr-demo",
        fullName: "Kaan Mete Şenyıldız",
        email: "student@ius.edu.ba",
      };
    }
  }

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#070a11]">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <article className="max-w-4xl mx-auto space-y-8">
          {/* Back Link */}
          <div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 hover:text-purple-300 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tüm Yazılara Dön</span>
            </Link>
          </div>

          {/* Header Metadata */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-xs font-mono text-purple-400 font-semibold">
                {post.category}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                <span>{post.readingTimeMin} dk okuma</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{formattedDate}</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
              {post.title}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
              {post.excerpt}
            </p>

            {/* Author Block */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-800/60">
              <div className="w-11 h-11 rounded-full bg-purple-500/20 border border-purple-500/40 overflow-hidden flex items-center justify-center font-bold text-white text-sm">
                {post.authorAvatar ? (
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  post.authorName.charAt(0)
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  {post.authorName}
                </div>
                <div className="text-xs text-purple-400 font-mono">
                  {post.authorRole}
                </div>
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 aspect-video shadow-2xl">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070a11]/60 via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          {/* Client Interactive Bar: Reading progress + Likes + Social Shares */}
          <BlogDetailClientBar
            slug={post.slug}
            title={post.title}
            initialLikes={post.likesCount}
          />

          {/* Main Markdown Body */}
          <div className="pt-4">
            <MarkdownRenderer content={post.content} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="pt-8 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400 mr-1" />
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/blog?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-xs font-mono text-slate-300 hover:text-purple-300 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <BlogCommentSection
            postSlug={post.slug}
            initialComments={comments}
            currentUser={currentUser}
          />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section className="mt-16 pt-12 border-t border-slate-800/80 space-y-6">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <h3 className="text-lg font-bold text-white font-display">
                  Benzer Mühendislik Yazıları
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map((rel) => (
                  <Link
                    key={rel.slug}
                    href={`/blog/${rel.slug}`}
                    className="glass-panel p-5 rounded-xl border border-slate-800/80 hover:border-purple-500/40 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                        {rel.category}
                      </span>
                      <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors mt-2">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {rel.excerpt}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-800/40 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{rel.authorName}</span>
                      <span>{rel.readingTimeMin} dk</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>
      </main>

      <Footer />
    </div>
  );
}

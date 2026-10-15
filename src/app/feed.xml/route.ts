import { NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/blog/blog-queries";

export async function GET() {
  const posts = await getBlogPosts({ status: "published" });
  const siteUrl = "https://iec.ius.edu.ba";

  const itemsXml = posts
    .map(
      (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${siteUrl}/blog/${p.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${p.slug}</guid>
      <description><![CDATA[${p.excerpt}]]></description>
      <category><![CDATA[${p.category}]]></category>
      <author><![CDATA[${p.authorName}]]></author>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
    </item>`
    )
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>IUS Engineering Club — Teknik Bülten</title>
    <link>${siteUrl}/blog</link>
    <description>Uluslararası Saraybosna Üniversitesi Mühendislik Kulübü (IEC) teknik makaleleri, donanım mimarileri ve yapay zekâ araştırmaları.</description>
    <language>tr-TR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml.trim(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://hasankaan28.github.io/ius-engineering-events-site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/portal/",
          "/api/",
          "/_next/",
          "/feed.xml",
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

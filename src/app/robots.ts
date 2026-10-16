import { MetadataRoute } from "next";
import { SITE_URL as BASE_URL } from "@/lib/site-url";

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

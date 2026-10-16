const PRODUCTION_FALLBACK_URL = "https://iec-portal-2.vercel.app";

function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  // Vercel injects the production domain at build time, so previews and custom domains stay correct.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return PRODUCTION_FALLBACK_URL;
}

export const SITE_URL = resolveSiteUrl().replace(/\/$/, "");

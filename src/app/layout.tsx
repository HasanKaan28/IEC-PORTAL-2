import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n/locale-context";
import { getServerLocale } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site-url";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0c0810",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const SITE_META = {
  tr: {
    title: "IUS Engineering Club (IEC) | Saraybosna",
    description:
      "Uluslararası Saraybosna Üniversitesi (IUS) Mühendislik Kulübü'nün resmi sitesi ve üye portalı. Donanım ve yazılım projeleri, atölyeler, hackathonlar ve sertifikalı etkinlikler.",
    ogDescription: "IUS öğrencilerinin gerçek mühendislik projeleri geliştirdiği kulüp.",
    ogAlt: "IUS Engineering Club logosu",
  },
  en: {
    title: "IUS Engineering Club (IEC) | Sarajevo",
    description:
      "Official website and member portal of the International University of Sarajevo (IUS) Engineering Club. Hardware and software projects, workshops, hackathons and certified events.",
    ogDescription: "The club where IUS students build real engineering projects.",
    ogAlt: "IUS Engineering Club logo",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const meta = SITE_META[locale];
  return {
    ...baseMetadata,
    title: { default: meta.title, template: "%s | IUS Engineering Club" },
    description: meta.description,
    openGraph: {
      ...baseMetadata.openGraph,
      locale: locale === "en" ? "en_US" : "tr_TR",
      alternateLocale: locale === "en" ? "tr_TR" : "en_US",
      title: meta.title,
      description: meta.ogDescription,
      images: [{ url: "/brand/og-card.jpg", width: 1200, height: 630, alt: meta.ogAlt }],
    },
    twitter: {
      ...baseMetadata.twitter,
      title: meta.title,
      description: meta.ogDescription,
    },
  };
}

const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  keywords: [
    "IUS",
    "International University of Sarajevo",
    "Engineering Club",
    "FENS",
    "Computer Science",
    "Electrical Engineering",
    "Hackathon",
    "Sarajevo",
    "Student Portal",
    "DevHack",
  ],
  authors: [{ name: "IUS Engineering Club" }],
  creator: "IUS Engineering Club",
  publisher: "IUS Engineering Club",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "IUS Engineering Club",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/og-card.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getServerLocale();
  return (
    <html lang={locale} className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen font-sans bg-background text-foreground antialiased selection:bg-brand-500/20 selection:text-brand-300">
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}

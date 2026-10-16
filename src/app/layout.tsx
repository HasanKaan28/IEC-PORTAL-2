import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n/locale-context";
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
  themeColor: "#070a11",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "IUS Engineering Club (IEC) | Official Platform & Student Hub",
    template: "%s | IUS Engineering Club",
  },
  description:
    "Official website and student portal for International University of Sarajevo (IUS) Engineering Club. Hardware projects, AI bootcamps, hackathons, and certified events.",
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
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
    url: SITE_URL,
    title: "IUS Engineering Club (IEC) | Official Platform & Student Hub",
    description:
      "Bridging the gap between university engineering curriculum and real-world industrial practice.",
    siteName: "IUS Engineering Club",
  },
  twitter: {
    card: "summary_large_image",
    title: "IUS Engineering Club (IEC)",
    description:
      "Bridging the gap between university engineering curriculum and real-world industrial practice at IUS Sarajevo.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen font-sans bg-background text-foreground antialiased selection:bg-sky-500/20 selection:text-sky-300">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}

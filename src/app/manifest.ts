import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IUS Engineering Club (IEC)",
    short_name: "IEC",
    description:
      "International University of Sarajevo (IUS) Mühendislik Kulübü öğrenci ve proje platformu.",
    start_url: "/",
    display: "standalone",
    background_color: "#070a11",
    theme_color: "#070a11",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/iec-logo-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

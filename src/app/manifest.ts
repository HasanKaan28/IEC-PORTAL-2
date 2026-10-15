import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IUS Engineering Club (IEC)",
    short_name: "IEC",
    description:
      "International University of Sarajevo (IUS) Mühendislik Kulübü Resmi Öğrenci ve Proje Platformu.",
    start_url: "/",
    display: "standalone",
    background_color: "#030712",
    theme_color: "#0284c7",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

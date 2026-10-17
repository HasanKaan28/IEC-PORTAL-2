import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "IUS Engineering Club (IEC)",
    short_name: "IEC",
    description:
      "Website and member portal of the International University of Sarajevo (IUS) Engineering Club.",
    start_url: "/",
    display: "standalone",
    background_color: "#f2f5fa",
    theme_color: "#154a7f",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

import { Source_Serif_4 } from "next/font/google";

/** Serif for long-form reading: blog post bodies and the blog editor. Covers Turkish letters. */
export const readingSerif = Source_Serif_4({
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  variable: "--font-reading",
  display: "swap",
});

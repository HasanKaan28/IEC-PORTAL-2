import React from "react";
import ScrollToys from "@/components/public/ScrollToys";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen text-slate-800 flex flex-col selection:bg-brand-200 selection:text-brand-900">
      {/* One colour flow behind the whole page (sky blue, honey, sage), so sections never sit on flat white. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-site-flow" />
      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
      <ScrollToys />
    </div>
  );
}

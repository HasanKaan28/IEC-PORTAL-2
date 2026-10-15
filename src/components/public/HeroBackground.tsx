"use client";

import dynamic from "next/dynamic";

const DynamicShaderGradient = dynamic(
  () => import("./ShaderGradientBackground"),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/20 blur-[128px]" />
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-cyan-500/15 blur-[128px]" />
      </div>
    ),
  }
);

export default function HeroBackground() {
  return <DynamicShaderGradient />;
}

"use client";

import dynamic from "next/dynamic";

const DynamicShaderGradient = dynamic(() => import("./ShaderGradientBackground"), {
  ssr: false,
  loading: () => (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      aria-hidden="true"
      style={{
        maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
      }}
    >
      <div className="absolute inset-0 bg-palette-wash" />
    </div>
  ),
});

export default function HeroBackground() {
  return <DynamicShaderGradient />;
}

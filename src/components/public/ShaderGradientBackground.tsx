"use client";

import React, { useEffect, useState } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

/** Fades the hero background out at the bottom so it melts into the page colour flow. */
const FADE_OUT: React.CSSProperties = {
  maskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, black 55%, transparent 100%)",
};

// Violet, honey and sage from the club palette, on the lavender the page starts with.
const SHADER_URL =
  "https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23eee8f6&bgColor2=%23eee8f6&brightness=1.15&cAzimuthAngle=180&cDistance=3.6&cPolarAngle=90&cameraZoom=1&color1=%23cdb9e6&color2=%23f3d98a&color3=%23aed3b8&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&grain=off&lightType=3d&pixelDensity=1&positionX=-0.5&positionY=0.1&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=235&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.3&uFrequency=5.5&uSpeed=0.15&uStrength=2.4&uTime=0&wireframe=false";

export default function ShaderGradientBackground() {
  const [canRender3D, setCanRender3D] = useState(false);

  useEffect(() => {
    // Phones and reduced-motion users get the static colour wash instead of the WebGL scene.
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isMobile && !prefersReducedMotion) setCanRender3D(true);
  }, []);

  if (!canRender3D) {
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true" style={FADE_OUT}>
        <div className="absolute inset-0 bg-palette-wash" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true" style={FADE_OUT}>
      <ShaderGradientCanvas
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.8,
        }}
      >
        <ShaderGradient control="query" urlString={SHADER_URL} />
      </ShaderGradientCanvas>
      {/* A thin veil keeps the headline at full contrast over the moving colours. */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/25 to-transparent pointer-events-none" />
    </div>
  );
}

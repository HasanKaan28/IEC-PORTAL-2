"use client";

import React, { useEffect, useState } from "react";
import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";

export default function ShaderGradientBackground() {
  const [canRender3D, setCanRender3D] = useState(false);

  useEffect(() => {
    // Check for reduced motion preference or small mobile screens
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!isMobile && !prefersReducedMotion) {
      setCanRender3D(true);
    }
  }, []);

  if (!canRender3D) {
    return (
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/20 blur-[128px]" />
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full bg-cyan-500/15 blur-[128px]" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full bg-indigo-600/15 blur-[128px]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-60">
      <ShaderGradientCanvas
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      >
        <ShaderGradient
          control="query"
          urlString="https://www.shadergradient.co/customize?animate=on&axesHelper=off&bgColor1=%23000000&bgColor2=%23000000&brightness=1.2&cAzimuthAngle=180&cDistance=3.6&cPolarAngle=90&cameraZoom=1&color1=%23050814&color2=%232563eb&color3=%2306b6d4&destination=onCanvas&embedMode=off&envPreset=city&format=gif&fov=45&frameRate=10&grain=off&lightType=3d&pixelDensity=1&positionX=-0.5&positionY=0.1&positionZ=0&range=enabled&rangeEnd=40&rangeStart=0&reflection=0.1&rotationX=0&rotationY=0&rotationZ=235&shader=defaults&type=waterPlane&uAmplitude=0&uDensity=1.3&uFrequency=5.5&uSpeed=0.15&uStrength=2.4&uTime=0&wireframe=false"
        />
      </ShaderGradientCanvas>
      {/* Dark overlay to ensure contrast and WCAG AA readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070a11]/40 via-[#070a11]/70 to-[#070a11] pointer-events-none" />
    </div>
  );
}

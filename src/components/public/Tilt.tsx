"use client";

import React, { useEffect, useRef } from "react";

interface TiltProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum tilt in degrees on each axis. */
  max?: number;
}

/**
 * Tilts its card toward the mouse in 3D, with a soft highlight that follows the cursor.
 * Only on devices with a real hover pointer and when the visitor has not asked for reduced motion;
 * everywhere else it renders a plain block.
 */
export default function Tilt({ children, className = "", max = 7 }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduced) return;

    let frame = 0;
    let px = 0.5;
    let py = 0.5;

    const apply = () => {
      frame = 0;
      const rx = (0.5 - py) * max * 2;
      const ry = (px - 0.5) * max * 2;
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
      el.style.setProperty("--tilt-x", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--tilt-y", `${(py * 100).toFixed(1)}%`);
    };

    const onMove = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      px = (event.clientX - rect.left) / rect.width;
      py = (event.clientY - rect.top) / rect.height;
      el.style.transition = "transform 80ms linear";
      el.dataset.tilting = "true";
      if (!frame) frame = requestAnimationFrame(apply);
    };

    const onLeave = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      el.style.transition = "transform 450ms cubic-bezier(.2,.8,.2,1)";
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
      delete el.dataset.tilting;
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [max]);

  return (
    <div ref={ref} className={`tilt-card ${className}`}>
      {children}
    </div>
  );
}

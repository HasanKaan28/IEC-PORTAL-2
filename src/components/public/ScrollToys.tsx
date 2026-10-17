"use client";

import { useEffect, useRef } from "react";
import type { ToyScene } from "./toys/toy-scene";

/**
 * A little workshop easter egg: while the visitor scrolls down, real 3D screws, nuts, washers,
 * gears and brass springs drop in from random spots (or get tossed in from the sides), tumble and
 * bounce off the bottom of the screen, then pop out of sight.
 *
 * The three.js scene (toys/toy-scene.ts) is only downloaded on the first scroll, so the page itself
 * loads exactly as before. Decorative only: aria-hidden, no pointer events, a handful of pieces at
 * most, and switched off entirely for visitors who ask for reduced motion.
 */
export default function ScrollToys() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const small = window.innerWidth < 768;
    const spawnEvery = small ? 850 : 560;

    let scene: ToyScene | null = null;
    let loading = false;
    let failed = false;
    let disposed = false;
    let queued = 0;
    let lastScroll = window.scrollY;
    let travelled = spawnEvery * 0.6; // the first part shows up soon after scrolling starts

    const ensureScene = () => {
      if (scene || loading || failed) return;
      loading = true;
      import("./toys/toy-scene")
        .then(({ createToyScene }) => {
          if (disposed) return;
          scene = createToyScene(layer, { small });
          if (!scene) {
            failed = true;
            return;
          }
          for (; queued > 0; queued -= 1) scene.spawn();
        })
        .catch(() => {
          failed = true;
        })
        .finally(() => {
          loading = false;
        });
    };

    const spawn = () => {
      if (scene) scene.spawn();
      else if (!failed) {
        queued = Math.min(queued + 1, 2);
        ensureScene();
      }
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScroll;
      lastScroll = y;
      if (delta <= 0 || document.hidden) return;
      ensureScene();
      travelled += delta;
      if (travelled >= spawnEvery) {
        travelled = 0;
        spawn();
        if (Math.random() < 0.35) window.setTimeout(spawn, 240);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      disposed = true;
      window.removeEventListener("scroll", onScroll);
      scene?.dispose();
      scene = null;
    };
  }, []);

  return <div ref={layerRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 overflow-hidden" />;
}

"use client";

import { useEffect, useRef } from "react";

/**
 * A little workshop easter egg: while the visitor scrolls down, screws, nuts, gears and springs
 * drop in from the right, tumble in 3D and bounce off the bottom of the screen before fading out.
 *
 * Purely decorative: aria-hidden, pointer-events none, capped at a handful of pieces, driven by one
 * requestAnimationFrame loop that only runs while something is moving, and switched off entirely
 * for visitors who ask for reduced motion.
 */

type Kind = "screw" | "nut" | "gear" | "spring";

interface Piece {
  el: HTMLDivElement;
  kind: Kind;
  w: number;
  h: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  spin: number;
  tiltPhase: number;
  tiltSpeed: number;
  tiltMax: number;
  restitution: number;
  bounces: number;
  maxBounces: number;
  squash: number;
  age: number;
  fade: number | null;
}

const GRAVITY = 0.42;
const LIFETIME_MS = 6500;
const FADE_MS = 600;

// Shared gradients live in one hidden <svg>, referenced by id from every piece.
const DEFS = `
  <linearGradient id="iec-toy-steel" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#8a97a8"/><stop offset=".35" stop-color="#eef2f7"/>
    <stop offset=".6" stop-color="#b9c3d0"/><stop offset="1" stop-color="#6b7889"/>
  </linearGradient>
  <linearGradient id="iec-toy-steel-head" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#f4f7fb"/><stop offset=".55" stop-color="#b6c0cd"/><stop offset="1" stop-color="#7d8a9b"/>
  </linearGradient>
  <linearGradient id="iec-toy-brass" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#b5861d"/><stop offset=".45" stop-color="#f4d56b"/><stop offset="1" stop-color="#8c651a"/>
  </linearGradient>
  <radialGradient id="iec-toy-navy" cx=".35" cy=".3" r=".8">
    <stop offset="0" stop-color="#5a8cc5"/><stop offset=".6" stop-color="#1f5a94"/><stop offset="1" stop-color="#133556"/>
  </radialGradient>`;

function gearPath(teeth: number, outer: number, inner: number, cx = 24, cy = 24): string {
  const step = (Math.PI * 2) / teeth;
  const points: string[] = [];
  for (let i = 0; i < teeth; i += 1) {
    const a = i * step;
    const corners = [
      [inner, a - step * 0.28],
      [outer, a - step * 0.16],
      [outer, a + step * 0.16],
      [inner, a + step * 0.28],
    ];
    for (const [r, t] of corners) points.push(`${(cx + r * Math.cos(t)).toFixed(2)} ${(cy + r * Math.sin(t)).toFixed(2)}`);
  }
  return `M${points.join(" L")}Z`;
}

function springPath(): { back: string; front: string } {
  // A zigzag coil: front strands run down-left, back strands down-right behind them.
  let front = "";
  let back = "";
  for (let i = 0; i < 7; i += 1) {
    const top = 5 + i * 7.6;
    front += `M28 ${top} L4 ${top + 3.8} `;
    if (i < 6) back += `M4 ${top + 3.8} L28 ${top + 7.6} `;
  }
  return { back, front };
}

const SPRING = springPath();

const SVG: Record<Kind, string> = {
  screw: `<svg viewBox="0 0 24 64" width="100%" height="100%">
    <path d="M8 13h8v37l-4 12-4-12z" fill="url(#iec-toy-steel)"/>
    <path d="M8 18l8-2.6M8 23l8-2.6M8 28l8-2.6M8 33l8-2.6M8 38l8-2.6M8 43l8-2.6M8 48l8-2.6" stroke="#5b6b80" stroke-width="1.3" stroke-linecap="round" opacity=".75"/>
    <rect x="1" y="2" width="22" height="11.5" rx="5.5" fill="url(#iec-toy-steel-head)" stroke="#6b7889" stroke-width=".8"/>
    <path d="M12 4.2v7.2M8.4 7.8h7.2" stroke="#3b4a5e" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`,
  nut: `<svg viewBox="0 0 40 40" width="100%" height="100%">
    <path fill-rule="evenodd" d="M20 2 35.6 11v18L20 38 4.4 29V11z M20 12.5a7.5 7.5 0 1 0 .01 0z" fill="url(#iec-toy-steel)" stroke="#6b7889" stroke-width="1"/>
    <path d="M20 12.5a7.5 7.5 0 0 1 7.4 6.2" stroke="#3b4a5e" stroke-width="1.4" fill="none" opacity=".6"/>
  </svg>`,
  gear: `<svg viewBox="0 0 48 48" width="100%" height="100%">
    <path fill-rule="evenodd" d="${gearPath(9, 22, 16.5)} M24 17a7 7 0 1 0 .01 0z" fill="url(#iec-toy-navy)"/>
    <circle cx="24" cy="24" r="10.5" fill="none" stroke="#bcd3ec" stroke-width="1.2" opacity=".55"/>
  </svg>`,
  spring: `<svg viewBox="0 0 32 64" width="100%" height="100%">
    <g fill="none" stroke-linecap="round" stroke-width="3.4">
      <path d="${SPRING.back}" stroke="#73521b"/>
      <path d="${SPRING.front}" stroke="url(#iec-toy-brass)"/>
      <path d="M28 5 L28 1.5 M4 54.6 L4 60" stroke="#8c651a"/>
    </g>
  </svg>`,
};

const SIZE: Record<Kind, [number, number]> = {
  screw: [24, 64],
  nut: [36, 36],
  gear: [44, 44],
  spring: [32, 64],
};

function pickKind(): Kind {
  const roll = Math.random();
  if (roll < 0.34) return "screw";
  if (roll < 0.62) return "spring";
  if (roll < 0.82) return "nut";
  return "gear";
}

const rand = (min: number, max: number) => min + Math.random() * (max - min);

export default function ScrollToys() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const isSmall = window.innerWidth < 768;
    const maxPieces = isSmall ? 3 : 6;
    const spawnEvery = isSmall ? 900 : 620;

    const pieces: Piece[] = [];
    let frame = 0;
    let lastTime = 0;
    let lastScroll = window.scrollY;
    let travelled = spawnEvery * 0.55; // the first piece shows up soon after scrolling starts

    const spawn = () => {
      if (pieces.length >= maxPieces) return;
      const kind = pickKind();
      const [w, h] = SIZE[kind];
      const el = document.createElement("div");
      el.className = "absolute left-0 top-0 will-change-transform";
      el.style.width = `${w}px`;
      el.style.height = `${h}px`;
      el.style.filter = "drop-shadow(0 6px 5px rgba(15, 30, 55, 0.22))";
      el.innerHTML = SVG[kind];
      layer.appendChild(el);
      pieces.push({
        el,
        kind,
        w,
        h,
        x: window.innerWidth - rand(28, isSmall ? 90 : 170),
        y: -h - rand(0, 40),
        vx: -rand(0.5, isSmall ? 1.4 : 2.4),
        vy: rand(0.5, 2.5),
        angle: rand(0, 360),
        spin: kind === "spring" ? rand(-2.5, 2.5) : rand(-9, 9),
        // A wobble rather than a full flip, so thin parts never turn edge-on and vanish.
        tiltPhase: rand(0, Math.PI * 2),
        tiltSpeed: rand(0.06, 0.12),
        tiltMax: kind === "spring" ? 18 : kind === "screw" ? 48 : 58,
        restitution: kind === "spring" ? 0.78 : kind === "gear" ? 0.5 : 0.42,
        bounces: 0,
        maxBounces: kind === "spring" ? 5 : 3,
        squash: 0,
        age: 0,
        fade: null,
      });
      if (!frame) {
        lastTime = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };

    const tick = (now: number) => {
      const dt = Math.min((now - lastTime) / 16.67, 3);
      lastTime = now;
      const floor = window.innerHeight - 6;

      for (let i = pieces.length - 1; i >= 0; i -= 1) {
        const p = pieces[i];
        p.age += dt * 16.67;
        p.vy += GRAVITY * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.angle += p.spin * dt;
        p.tiltPhase += p.tiltSpeed * dt;
        p.squash *= Math.pow(0.82, dt);

        if (p.y + p.h > floor) {
          p.y = floor - p.h;
          if (p.vy > 1.6 && p.bounces < p.maxBounces) {
            p.vy = -p.vy * p.restitution;
            p.vx *= 0.82;
            p.spin *= 0.65;
            p.bounces += 1;
            p.squash = p.kind === "spring" ? 1 : 0.45;
          } else {
            p.vy = 0;
            p.vx *= 0.9;
            p.spin *= 0.8;
            if (p.fade === null) p.fade = p.age;
          }
        }
        if (p.age > LIFETIME_MS && p.fade === null) p.fade = p.age;

        const fadeProgress = p.fade === null ? 0 : (p.age - p.fade) / FADE_MS;
        if (fadeProgress >= 1 || p.x < -80) {
          p.el.remove();
          pieces.splice(i, 1);
          continue;
        }

        // Springs stretch while flying and squash on landing; metal parts just dent a little.
        const stretch = p.kind === "spring" ? Math.min(Math.abs(p.vy) / 28, 0.28) : 0;
        const scaleY = 1 + stretch - p.squash * (p.kind === "spring" ? 0.42 : 0.12);
        const scaleX = 1 + p.squash * (p.kind === "spring" ? 0.2 : 0.06);
        p.el.style.opacity = String(1 - Math.max(0, fadeProgress));
        p.el.style.transform =
          `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0) rotateZ(${p.angle.toFixed(1)}deg) ` +
          `rotateY(${(Math.sin(p.tiltPhase) * p.tiltMax).toFixed(1)}deg) scale(${scaleX.toFixed(3)}, ${scaleY.toFixed(3)})`;
      }

      frame = pieces.length > 0 ? requestAnimationFrame(tick) : 0;
    };

    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScroll;
      lastScroll = y;
      if (delta <= 0 || document.hidden) return;
      travelled += delta;
      if (travelled >= spawnEvery) {
        travelled = 0;
        spawn();
        if (Math.random() < 0.3) window.setTimeout(spawn, 260);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
      for (const p of pieces) p.el.remove();
      pieces.length = 0;
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      style={{ perspective: "900px" }}
    >
      <svg width="0" height="0" className="absolute" focusable="false" dangerouslySetInnerHTML={{ __html: `<defs>${DEFS}</defs>` }} />
    </div>
  );
}

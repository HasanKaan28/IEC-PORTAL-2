/**
 * Technical drawing behind the hero seal: centre lines, a protractor ring with degree ticks and a
 * slowly turning gear outline. Pure decoration, drawn once on the server.
 */

const C = 300;

/** Rounded so server and browser print identical numbers (avoids a hydration mismatch). */
function polar(radius: number, degrees: number): [number, number] {
  const radians = ((degrees - 90) * Math.PI) / 180;
  const round = (value: number) => Math.round(value * 100) / 100;
  return [round(C + radius * Math.cos(radians)), round(C + radius * Math.sin(radians))];
}

/** Gear outline: each tooth is root, rising flank, flat top, falling flank. */
function gearPath(teeth: number, outer: number, root: number): string {
  const pitch = 360 / teeth;
  const points: Array<[number, number]> = [];
  for (let i = 0; i < teeth; i += 1) {
    const start = i * pitch;
    points.push(polar(root, start));
    points.push(polar(root, start + pitch * 0.3));
    points.push(polar(outer, start + pitch * 0.45));
    points.push(polar(outer, start + pitch * 0.75));
    points.push(polar(root, start + pitch * 0.9));
  }
  return `M${points.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L")}Z`;
}

const GEAR = gearPath(20, 132, 121);

const TICKS = Array.from({ length: 72 }, (_, index) => {
  const degrees = index * 5;
  const major = degrees % 30 === 0;
  const [x1, y1] = polar(212, degrees);
  const [x2, y2] = polar(major ? 196 : 204, degrees);
  return { x1, y1, x2, y2, major, key: degrees };
});

export default function HeroBlueprint({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 600 600"
      className={`pointer-events-none ${className}`}
      style={{
        maskImage: "radial-gradient(circle at center, black 45%, transparent 72%)",
        WebkitMaskImage: "radial-gradient(circle at center, black 45%, transparent 72%)",
      }}
    >
      <g fill="none" stroke="currentColor" className="text-brand-600">
        {/* Centre lines (long dash, short dash) */}
        <g strokeWidth="1" strokeDasharray="22 6 4 6" opacity="0.45">
          <line x1="10" y1={C} x2="590" y2={C} />
          <line x1={C} y1="10" x2={C} y2="590" />
        </g>

        <circle cx={C} cy={C} r="96" strokeWidth="1" strokeDasharray="4 5" opacity="0.5" />
        <circle cx={C} cy={C} r="212" strokeWidth="1" opacity="0.45" />
        <circle cx={C} cy={C} r="268" strokeWidth="0.75" opacity="0.3" />

        <g opacity="0.55">
          {TICKS.map(({ x1, y1, x2, y2, major, key }) => (
            <line key={key} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={major ? 1.4 : 0.8} />
          ))}
        </g>

        <g className="blueprint-spin">
          <path d={GEAR} strokeWidth="1.2" className="text-accent-600" stroke="currentColor" opacity="0.7" />
          <circle cx={C} cy={C} r="112" strokeWidth="0.8" className="text-accent-600" stroke="currentColor" opacity="0.5" />
        </g>

        <g className="blueprint-spin blueprint-spin-reverse" opacity="0.4">
          <circle cx={C} cy={C} r="240" strokeWidth="1" strokeDasharray="2 10" />
        </g>
      </g>
    </svg>
  );
}

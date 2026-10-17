/** Decorative dimension line (ticks, arrows, measured line) used under headings. Styles in globals.css. */
export default function DimensionLine({ className = "", honey = false }: { className?: string; honey?: boolean }) {
  return (
    <span aria-hidden="true" className={`dimension-line ${honey ? "dimension-line-honey" : ""} ${className}`}>
      <span />
    </span>
  );
}

import type { CustomRoleColor } from "./permission-catalog";

/** Tailwind classes for each custom role colour (chips, dots, selected rings). */
export const ROLE_COLOR_STYLES: Record<CustomRoleColor, { chip: string; dot: string; ring: string }> = {
  brand: { chip: "border-brand-200 bg-brand-50 text-brand-700", dot: "bg-brand-500", ring: "ring-brand-500" },
  accent: { chip: "border-accent-200 bg-accent-50 text-accent-800", dot: "bg-accent-400", ring: "ring-accent-500" },
  emerald: { chip: "border-emerald-200 bg-emerald-50 text-emerald-800", dot: "bg-emerald-500", ring: "ring-emerald-500" },
  rose: { chip: "border-rose-200 bg-rose-50 text-rose-700", dot: "bg-rose-400", ring: "ring-rose-400" },
  slate: { chip: "border-slate-200 bg-slate-100 text-slate-700", dot: "bg-slate-400", ring: "ring-slate-400" },
};

export function customRoleChipClass(color: string): string {
  return (ROLE_COLOR_STYLES as Record<string, { chip: string }>)[color]?.chip ?? ROLE_COLOR_STYLES.brand.chip;
}

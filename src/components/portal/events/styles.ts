/** Shared class names for the events, certificates and hackathons portal screens (light theme). */

const focusRing =
  "focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

export const primaryButton = `inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const secondaryButton = `inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const successButton = `inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const iconButton = `inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 ${focusRing}`;

export const linkedInButton = `inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0a66c2] px-3 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-[#004182] ${focusRing}`;

export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:border-brand-500 focus:outline-hidden focus:ring-2 focus:ring-brand-500/25";

export const labelClass = "mb-1 block text-sm font-semibold text-slate-700";

export const hintClass = "mt-1 text-xs text-slate-500";

export const cardClass = "rounded-2xl border border-slate-200 bg-white";

export const chipClass = "inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium";

export function tabButton(active: boolean): string {
  return `inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${focusRing} ${
    active
      ? "bg-brand-600 text-white shadow-xs"
      : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
  }`;
}

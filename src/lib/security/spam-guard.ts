/**
 * Bot traps for public forms, shared by the form (client) and its server action.
 *
 * - Honeypot: a field people never see. Bots that fill every input fill it too.
 * - Fill time: measured in the browser from page load to submit, so clock differences between the
 *   visitor and the server do not matter. Scripts that post instantly are turned away.
 */

export const HONEYPOT_FIELD = "iec_hp";
export const FILL_TIME_FIELD = "iec_ft";

/** Nobody fills in the sign-up form (name, email, password, department, year, consent) this fast. */
export const MIN_FILL_MS = 2500;

export type SpamVerdict = "honeypot" | "too-fast" | null;

export function checkSpamTraps(formData: FormData): SpamVerdict {
  if (String(formData.get(HONEYPOT_FIELD) ?? "") !== "") return "honeypot";
  const elapsed = Number(formData.get(FILL_TIME_FIELD));
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return "too-fast";
  return null;
}

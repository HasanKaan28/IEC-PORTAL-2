/** Only IUS student mailboxes may create portal accounts. Keep in sync with supabase/migrations (enforce_student_email). */
export const ALLOWED_EMAIL_DOMAIN = "student.ius.edu.ba";

export function isAllowedStudentEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  const at = normalized.lastIndexOf("@");
  return at > 0 && normalized.slice(at + 1) === ALLOWED_EMAIL_DOMAIN;
}

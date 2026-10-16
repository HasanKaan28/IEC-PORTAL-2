import type { CertificateItem } from "@/lib/events/event-types";

/** Fields needed for LinkedIn's "Add licence or certification" link (works with public certificates too). */
export type LinkedInCertificateFields = Pick<CertificateItem, "eventTitle" | "issueDate" | "verifyUrl" | "certificateCode">;

/** Builds LinkedIn's "Add to profile" certification URL. Safe for client components (no PDF code). */
export function generateLinkedInCertUrl(cert: LinkedInCertificateFields): string {
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: `${cert.eventTitle} (IUS Engineering Club)`,
    organizationName: "International University of Sarajevo (IUS)",
    certId: cert.certificateCode,
  });
  if (cert.verifyUrl) params.set("certUrl", cert.verifyUrl);
  const issued = new Date(`${cert.issueDate}T00:00:00Z`);
  if (!Number.isNaN(issued.getTime())) {
    params.set("issueYear", String(issued.getUTCFullYear()));
    params.set("issueMonth", String(issued.getUTCMonth() + 1));
  }
  return `https://www.linkedin.com/profile/add?${params.toString()}`;
}

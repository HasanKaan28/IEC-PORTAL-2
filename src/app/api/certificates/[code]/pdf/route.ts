import { NextRequest, NextResponse } from "next/server";
import { getCertificateForPdf } from "@/lib/events/event-queries";
import { normalizeCertificateCode } from "@/lib/events/event-types";
import { generateCertificatePdf } from "@/lib/certificates/certificate-pdf";
import { RATE_LIMITS, clientIp, consumeRateLimit, retryAfterSeconds } from "@/lib/security/rate-limit";

/**
 * Certificate PDF by exact verification code (validated format, exact match, no pattern search).
 * Anyone holding the code can already verify the certificate publicly; the PDF shows the same facts
 * and nothing else (no ids, emails or departments). Without the service role key, RLS limits the
 * lookup to the holder's own certificates and to leaders.
 */
export const dynamic = "force-dynamic";

const PLAIN_HEADERS = { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" };

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  // Building a PDF costs CPU, so one address cannot request them in bulk.
  if (!(await consumeRateLimit(RATE_LIMITS.certificatePdf, await clientIp()))) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: { ...PLAIN_HEADERS, "Retry-After": retryAfterSeconds(RATE_LIMITS.certificatePdf) },
    });
  }

  const { code: rawCode } = await params;
  const code = normalizeCertificateCode(rawCode ?? "");
  if (!code) {
    return new NextResponse("Invalid certificate code", { status: 400, headers: PLAIN_HEADERS });
  }

  const cert = await getCertificateForPdf(code);
  if (!cert) {
    return new NextResponse("Certificate not found", { status: 404, headers: PLAIN_HEADERS });
  }

  try {
    const pdfBytes = await generateCertificatePdf(cert);
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${cert.certificateCode}.pdf"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("[certificates] PDF generation failed", error);
    return new NextResponse("Could not generate the certificate", { status: 500, headers: PLAIN_HEADERS });
  }
}

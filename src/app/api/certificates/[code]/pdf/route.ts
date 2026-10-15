import { NextRequest, NextResponse } from "next/server";
import { getCertificateByCode } from "@/lib/events/event-queries";
import { generateCertificatePdf } from "@/lib/certificates/certificate-pdf";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  if (!code) {
    return new NextResponse("Certificate code missing", { status: 400 });
  }

  const cert = await getCertificateByCode(code);
  if (!cert) {
    return new NextResponse("Certificate not found", { status: 404 });
  }

  try {
    const pdfBytes = await generateCertificatePdf(cert);
    const pdfBuffer = Buffer.from(pdfBytes);
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${cert.certificateCode}.pdf"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Error generating certificate: ${err.message}`, {
      status: 500,
    });
  }
}

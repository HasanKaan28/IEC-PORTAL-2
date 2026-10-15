import { NextRequest, NextResponse } from "next/server";
import { getCertificateByCode } from "@/lib/events/event-queries";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code || code.trim().length < 4) {
    return NextResponse.json({ verified: false, error: "Geçersiz kod" }, { status: 400 });
  }

  const cert = await getCertificateByCode(code.trim());

  if (cert) {
    return NextResponse.json({ verified: true, cert });
  }

  return NextResponse.json({ verified: false, message: "Sertifika bulunamadı" });
}

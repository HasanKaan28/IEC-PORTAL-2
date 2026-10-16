import { NextRequest, NextResponse } from "next/server";
import { getPublicCertificateByCode } from "@/lib/events/event-queries";
import { normalizeCertificateCode } from "@/lib/events/event-types";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";

/**
 * Public certificate verification by exact code.
 * Contract: { verified: true, cert: PublicCertificate } on a match, { verified: false } with 400/404
 * when the code is malformed or unknown, 5xx only when the server cannot check.
 * The response never includes ids, emails or departments.
 */
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" };

export async function GET(req: NextRequest) {
  const code = normalizeCertificateCode(req.nextUrl.searchParams.get("code") ?? "");
  if (!code) {
    return NextResponse.json({ verified: false }, { status: 400, headers: NO_STORE });
  }
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ verified: false, error: "unavailable" }, { status: 503, headers: NO_STORE });
  }

  let cert;
  try {
    cert = await getPublicCertificateByCode(code);
  } catch (error) {
    console.error("[certificates] verification failed", error);
    return NextResponse.json({ verified: false, error: "server_error" }, { status: 500, headers: NO_STORE });
  }
  if (!cert) {
    return NextResponse.json({ verified: false }, { status: 404, headers: NO_STORE });
  }
  return NextResponse.json({ verified: true, cert }, { headers: NO_STORE });
}

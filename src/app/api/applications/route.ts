import { NextResponse } from "next/server";
import { getServerLocale } from "@/lib/i18n/server";
import { adminText } from "@/lib/i18n/portal/admin";

/**
 * The in-portal membership application flow is retired: applications are collected with the
 * Google Form embedded on the public Apply page. This endpoint stays only to answer old clients
 * with 410 Gone; it no longer reads or stores anything.
 */

const APPLICATION_FORM_URL = "https://forms.gle/v8c85MgFUmVvpzTH6";

async function gone() {
  const locale = await getServerLocale();
  return NextResponse.json(
    {
      success: false,
      message: adminText[locale].api.applicationsGone,
      formUrl: APPLICATION_FORM_URL,
    },
    { status: 410, headers: { "Cache-Control": "no-store" } }
  );
}

export async function POST() {
  return gone();
}

export async function GET() {
  return gone();
}

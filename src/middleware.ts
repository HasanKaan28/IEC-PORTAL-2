import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/** Only for signed-out visitors; a signed-in visitor is sent to the dashboard. */
const AUTH_ROUTES = new Set(["/portal/giris", "/portal/kayit", "/portal/sifre-sifirla"]);
const PASSWORD_RESET_ROUTE = "/portal/sifre-sifirla";
/** Target of the reset email: either carries the link's one-time code or needs a recovery session. */
const PASSWORD_UPDATE_ROUTE = "/portal/sifre-yenile";

type SupabaseClient = ReturnType<typeof createServerClient>;

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder") && url.startsWith("https://"));
}

/**
 * Handles the reset links that open a session on page load. The club template sends `token_hash`,
 * which is NOT verified here but when the new password is submitted: mail scanners such as Outlook
 * Safe Links open links before the member does, and verifying on load let them use up the code.
 * Supabase's default template sends a PKCE `code` instead; it only works with the code verifier
 * cookie of the browser that asked for the email, so a scanner cannot use it up.
 */
async function openRecoveryLink(supabase: SupabaseClient, params: URLSearchParams): Promise<"opened" | "invalid" | "deferred" | "none"> {
  if (params.has("token_hash")) return "deferred";
  const code = params.get("code");
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return error ? "invalid" : "opened";
  }
  // Supabase sends expired or already used links back with an error instead of a code.
  return params.has("error") || params.has("error_code") ? "invalid" : "none";
}

function invalidLinkRedirect(request: NextRequest): URL {
  const url = new URL(PASSWORD_RESET_ROUTE, request.url);
  url.searchParams.set("link", "invalid");
  return url;
}

/**
 * Portal gate. Only a real Supabase session counts as signed in; there is no demo cookie.
 * Also refreshes the Supabase auth cookies on every portal request.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const path = request.nextUrl.pathname;
  const configured = isSupabaseConfigured();
  let isAuthenticated = false;

  if (configured) {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
              cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
              response = NextResponse.next({ request });
              cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
            },
          },
        }
      );

      if (path === PASSWORD_UPDATE_ROUTE) {
        const link = await openRecoveryLink(supabase, request.nextUrl.searchParams);
        // The page shows the form and passes the code on to the submit action.
        if (link === "deferred") return response;
        if (link !== "none") {
          // Reload without the one-time code in the address bar, carrying the new session cookies along.
          const target = link === "opened" ? new URL(PASSWORD_UPDATE_ROUTE, request.url) : invalidLinkRedirect(request);
          const redirect = NextResponse.redirect(target);
          response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
          return redirect;
        }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      isAuthenticated = Boolean(user);
    } catch {
      isAuthenticated = false;
    }
  }

  if (path === PASSWORD_UPDATE_ROUTE) {
    // Without Supabase the page only shows the maintenance notice.
    if (!configured || isAuthenticated) return response;
    return NextResponse.redirect(invalidLinkRedirect(request));
  }

  const isAuthRoute = AUTH_ROUTES.has(path);

  if (!isAuthRoute && !isAuthenticated) {
    const loginUrl = new URL("/portal/giris", request.url);
    // Keep the query too: a scanned check-in QR carries its code there.
    const target = `${path}${request.nextUrl.search}`;
    if (target !== "/portal") loginUrl.searchParams.set("redirect", target);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/portal/:path*"],
};

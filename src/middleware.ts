import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const path = request.nextUrl.pathname;

  // Check demo session cookie for local evaluation
  const hasDemoSession = request.cookies.get("iec_demo_session")?.value === "true";

  // Check Supabase session
  let hasSupabaseUser = false;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey && !supabaseUrl.includes("placeholder")) {
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request,
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      });

      const {
        data: { user },
      } = await supabase.auth.getUser();

      hasSupabaseUser = !!user;
    }
  } catch {
    hasSupabaseUser = false;
  }

  const isAuthenticated = hasSupabaseUser || hasDemoSession;

  const isAuthRoute =
    path === "/portal/giris" ||
    path === "/portal/kayit" ||
    path === "/portal/sifremi-unuttum";

  const isProtectedPortalRoute =
    path.startsWith("/portal") && !isAuthRoute;

  // Redirect unauthenticated users trying to access protected portal pages
  if (isProtectedPortalRoute && !isAuthenticated) {
    const loginUrl = new URL("/portal/giris", request.url);
    loginUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already authenticated users away from login/register to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/portal", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/portal/:path*",
  ],
};

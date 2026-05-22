import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { safeInternalPath } from "@/lib/auth/safePath"

/**
 * Routes that signed-out users may visit. Everything else requires a session.
 * Note: matcher below already excludes `_next`, static files, and assets.
 */
const PUBLIC_PATHS = new Set(["/login", "/signup", "/forgot", "/otp", "/public"])
const PUBLIC_PREFIXES = ["/auth/", "/public/", "/lab", "/__pin-test", "/pin-test"]

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true
  return PUBLIC_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  // Refresh JWT + read claims. Cheaper than getUser() — no extra network round-trip.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims ?? null

  const pathname = request.nextUrl.pathname
  const isAuthed = Boolean(claims?.sub)

  // Unauthenticated → block protected routes, redirect to login with `from`
  if (!isAuthed && !isPublicPath(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.search = ""
    // Skip `from=/` to avoid redirect-to-root after login (use default /dashboard instead)
    if (pathname !== "/" && pathname !== "/login") {
      url.searchParams.set("from", pathname + request.nextUrl.search)
    }
    return NextResponse.redirect(url)
  }

  // Authenticated → kick off /login to dashboard (or `from` if safe)
  if (isAuthed && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone()
    const from = safeInternalPath(request.nextUrl.searchParams.get("from"), "/dashboard")
    url.pathname = from.split("?")[0]
    url.search = from.includes("?") ? "?" + from.split("?").slice(1).join("?") : ""
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match everything except:
     * - _next/static (build assets)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, sitemap.xml
     * - file extensions for images, fonts, css, js (static assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico|css|js|woff|woff2|ttf|eot)).*)",
  ],
}

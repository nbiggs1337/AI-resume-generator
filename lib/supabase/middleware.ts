import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  console.log("[v0] Middleware - Processing request:", request.nextUrl.pathname)

  if (
    request.nextUrl.pathname.startsWith("/_vercel") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.includes("/api/_vercel") ||
    request.headers.get("user-agent")?.includes("vercel")
  ) {
    console.log("[v0] Middleware - Skipping analytics/internal request")
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // console.log("[v0] Middleware - Supabase URL exists:", !!supabaseUrl)
  // console.log("[v0] Middleware - Supabase Anon Key exists:", !!supabaseAnonKey)

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("[v0] Middleware - Missing Supabase environment variables")
    console.error("[v0] Middleware - NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl)
    console.error("[v0] Middleware - NEXT_PUBLIC_SUPABASE_ANON_KEY:", !!supabaseAnonKey)

    // Return early without authentication if env vars are missing
    return supabaseResponse
  }

  try {
    // With Fluid compute, don't put this client in a global environment
    // variable. Always create a new one on each request.
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    // Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    // IMPORTANT: If you remove getUser() and you use server-side rendering
    // with the Supabase client, your users may be randomly logged out.
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (request.nextUrl.pathname.startsWith("/admin")) {
      console.log("[v0] Admin route accessed by user:", user?.id)

      if (!user) {
        console.log("[v0] No user found, redirecting to login")
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }

      console.log("[v0] Checking admin status for user:", user.id)
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("is_admin, is_banned")
          .eq("id", user.id)
          .single()

        console.log("[v0] Profile query result:", { profile, error })

        if (error) {
          console.error("[v0] Error fetching profile:", error)
          // If columns don't exist, redirect to dashboard with error info
          const url = request.nextUrl.clone()
          url.pathname = "/dashboard"
          url.searchParams.set("error", "admin_setup_required")
          return NextResponse.redirect(url)
        }

        if (profile?.is_banned) {
          console.log("[v0] User is banned, redirecting")
          const url = request.nextUrl.clone()
          url.pathname = "/auth/banned"
          return NextResponse.redirect(url)
        }

        if (!profile?.is_admin) {
          console.log("[v0] User is not admin, redirecting to dashboard")
          const url = request.nextUrl.clone()
          url.pathname = "/dashboard"
          return NextResponse.redirect(url)
        }

        console.log("[v0] User is admin, allowing access")
      } catch (err) {
        console.error("[v0] Exception in admin check:", err)
        const url = request.nextUrl.clone()
        url.pathname = "/dashboard"
        return NextResponse.redirect(url)
      }
    }

    if (user && !request.nextUrl.pathname.startsWith("/auth")) {
      const { data: profile } = await supabase.from("profiles").select("is_banned").eq("id", user.id).single()

      if (profile?.is_banned && !request.nextUrl.pathname.startsWith("/auth/banned")) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/banned"
        return NextResponse.redirect(url)
      }
    }

    if (
      request.nextUrl.pathname !== "/" &&
      !user &&
      !request.nextUrl.pathname.startsWith("/auth") &&
      !request.nextUrl.pathname.startsWith("/privacy") &&
      !request.nextUrl.pathname.startsWith("/terms") &&
      !request.nextUrl.pathname.startsWith("/support") &&
      !request.nextUrl.pathname.startsWith("/faq") &&
      !request.nextUrl.pathname.startsWith("/docs") &&
      !request.nextUrl.pathname.startsWith("/tutorials")
    ) {
      console.log("[v0] Middleware - Redirecting unauthenticated user to login")
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      return NextResponse.redirect(url)
    }
  } catch (error) {
    console.error("[v0] Middleware - Error in Supabase client:", error)
    // Continue without authentication on error
  }

  console.log("[v0] Middleware - Request processed successfully")

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

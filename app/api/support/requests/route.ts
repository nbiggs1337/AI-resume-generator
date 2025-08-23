import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching support requests")

    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Auth error:", authError?.message)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      console.log("[v0] Admin access denied")
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const priority = searchParams.get("priority")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    // Build query - fetch support requests first, then get user profiles separately
    let query = supabase.from("support_requests").select("*").order("created_at", { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq("status", status)
    }
    if (category) {
      query = query.eq("category", category)
    }
    if (priority) {
      query = query.eq("priority", priority)
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: requests, error: fetchError } = await query

    if (fetchError) {
      console.error("[v0] Database fetch error:", fetchError)
      return NextResponse.json({ error: "Failed to fetch support requests" }, { status: 500 })
    }

    let requestsWithProfiles = requests || []

    if (requests && requests.length > 0) {
      // Get unique user IDs from requests
      const userIds = [...new Set(requests.map((req) => req.user_id).filter(Boolean))]

      if (userIds.length > 0) {
        // Fetch profiles for these users
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds)

        if (!profilesError && profiles) {
          // Create a map of user profiles
          const profileMap = new Map(profiles.map((profile) => [profile.id, profile]))

          // Merge profiles with requests
          requestsWithProfiles = requests.map((request) => ({
            ...request,
            profiles: request.user_id ? profileMap.get(request.user_id) || null : null,
          }))
        }
      }
    }

    // Get total count for pagination
    let countQuery = supabase.from("support_requests").select("*", { count: "exact", head: true })

    if (status) countQuery = countQuery.eq("status", status)
    if (category) countQuery = countQuery.eq("category", category)
    if (priority) countQuery = countQuery.eq("priority", priority)

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error("[v0] Count query error:", countError)
    }

    console.log("[v0] Fetched", requests?.length, "support requests")

    return NextResponse.json({
      requests: requestsWithProfiles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("[v0] Support requests fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

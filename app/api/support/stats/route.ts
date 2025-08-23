import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Fetching support request stats")

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

    // Get stats
    const [
      { count: totalRequests },
      { count: openRequests },
      { count: inProgressRequests },
      { count: resolvedRequests },
      { count: urgentRequests },
    ] = await Promise.all([
      supabase.from("support_requests").select("*", { count: "exact", head: true }),
      supabase.from("support_requests").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabase.from("support_requests").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
      supabase.from("support_requests").select("*", { count: "exact", head: true }).eq("status", "resolved"),
      supabase.from("support_requests").select("*", { count: "exact", head: true }).eq("priority", "urgent"),
    ])

    const stats = {
      total: totalRequests || 0,
      open: openRequests || 0,
      inProgress: inProgressRequests || 0,
      resolved: resolvedRequests || 0,
      urgent: urgentRequests || 0,
    }

    console.log("[v0] Support stats:", stats)

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("[v0] Support stats fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

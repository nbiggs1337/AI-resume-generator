import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest) {
  try {
    console.log("[v0] Support request update started")

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

    // Parse request body
    const body = await request.json()
    const { id, status, priority, admin_notes, assigned_to } = body

    console.log("[v0] Updating support request:", { id, status, priority, assigned_to })

    // Validate required fields
    if (!id) {
      return NextResponse.json({ error: "Request ID is required" }, { status: 400 })
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ["open", "in_progress", "resolved", "closed"]
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 })
      }
    }

    // Validate priority if provided
    if (priority) {
      const validPriorities = ["low", "medium", "high", "urgent"]
      if (!validPriorities.includes(priority)) {
        return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
      }
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes
    if (assigned_to !== undefined) updateData.assigned_to = assigned_to

    // Update support request
    const { data: updatedRequest, error: updateError } = await supabase
      .from("support_requests")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("[v0] Database update error:", updateError)
      return NextResponse.json({ error: "Failed to update support request" }, { status: 500 })
    }

    console.log("[v0] Support request updated successfully:", id)

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: "Support request updated successfully",
    })
  } catch (error) {
    console.error("[v0] Support request update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

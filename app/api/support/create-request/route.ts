import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Support request creation started")

    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      console.log("[v0] Auth error:", authError.message)
      return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { name, email, subject, message, category, priority } = body

    console.log("[v0] Support request data:", { name, email, subject, category, priority })

    // Validate required fields
    if (!name || !email || !subject || !message || !category) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, subject, message, and category are required" },
        { status: 400 },
      )
    }

    // Validate category
    const validCategories = ["technical", "billing", "feature", "general"]
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }

    // Validate priority
    const validPriorities = ["low", "medium", "high", "urgent"]
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 })
    }

    // Create support request
    const { data: supportRequest, error: insertError } = await supabase
      .from("support_requests")
      .insert({
        user_id: user?.id || null,
        name,
        email,
        subject,
        message,
        category,
        priority: priority || "medium",
        status: "open",
      })
      .select()
      .single()

    if (insertError) {
      console.error("[v0] Database insert error:", insertError)
      return NextResponse.json({ error: "Failed to create support request" }, { status: 500 })
    }

    console.log("[v0] Support request created successfully:", supportRequest.id)

    return NextResponse.json({
      success: true,
      request: supportRequest,
      message: "Support request submitted successfully",
    })
  } catch (error) {
    console.error("[v0] Support request creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

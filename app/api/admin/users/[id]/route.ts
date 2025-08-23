import { requireAdmin } from "@/lib/auth/admin"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params
    const { action, reason } = await request.json()

    const supabase = await createClient()

    let updateData: any = {}

    switch (action) {
      case "ban":
        updateData = {
          is_banned: true,
          banned_at: new Date().toISOString(),
          banned_reason: reason || "No reason provided",
        }
        break
      case "unban":
        updateData = {
          is_banned: false,
          banned_at: null,
          banned_reason: null,
        }
        break
      case "promote":
        updateData = {
          is_admin: true,
        }
        break
      case "demote":
        updateData = {
          is_admin: false,
        }
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const { error } = await supabase.from("profiles").update(updateData).eq("id", id)

    if (error) {
      console.error("Error updating user:", error)
      return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in user update API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

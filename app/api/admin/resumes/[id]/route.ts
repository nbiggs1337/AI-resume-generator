import { requireAdmin } from "@/lib/auth/admin"
import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    const supabase = await createClient()

    // Delete the resume
    const { error } = await supabase.from("resumes").delete().eq("id", id)

    if (error) {
      console.error("Error deleting resume:", error)
      return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in resume delete API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin()
    const { id } = await params

    const supabase = await createClient()

    // Get resume details
    const { data: resume, error } = await supabase
      .from("resumes")
      .select(`
        *,
        profiles(id, full_name, email)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching resume:", error)
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    return NextResponse.json(resume)
  } catch (error) {
    console.error("Error in resume get API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

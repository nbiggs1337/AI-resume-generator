import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch the resume data
    const { data: resume, error } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      console.error("Error fetching resume:", error)
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    const resumeData = {
      personal_info: resume.additional_sections?.personal_info || {},
      summary: resume.additional_sections?.summary || "",
      experience: resume.work_experience || [],
      education: resume.education || [],
      skills: resume.skills || { technical: [], soft: [] },
      projects: resume.projects || [],
      certifications: resume.certifications || [],
    }

    return NextResponse.json(resumeData)
  } catch (error) {
    console.error("Error in resumes API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

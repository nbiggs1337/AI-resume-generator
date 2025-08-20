import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { optimizeResumeForJob } from "@/lib/ai/resume-optimizer"

export async function POST(request: NextRequest) {
  try {
    const { resumeId, jobPostingId } = await request.json()

    if (!resumeId || !jobPostingId) {
      return NextResponse.json({ error: "Resume ID and Job Posting ID are required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch resume data
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single()

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    const resumeData = {
      personal_info: {
        full_name: resume.title || "Unknown", // Using title as fallback for name
        email: user.email || "",
      },
      summary: resume.additional_sections?.summary || "",
      experience: resume.work_experience || [],
      education: resume.education || [],
      skills: resume.skills || { technical: [], soft: [] },
    }

    // Fetch job posting data
    const { data: jobPosting, error: jobError } = await supabase
      .from("job_postings")
      .select("*")
      .eq("id", jobPostingId)
      .eq("user_id", user.id)
      .single()

    if (jobError || !jobPosting) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 })
    }

    // Generate optimization suggestions using AI
    const optimization = await optimizeResumeForJob(resumeData, jobPosting)

    // Save the customization to database
    const { data: customization, error: saveError } = await supabase
      .from("resume_customizations")
      .insert({
        user_id: user.id,
        base_resume_id: resumeId, // Changed from resume_id to base_resume_id
        job_posting_id: jobPostingId,
        customized_data: optimization, // Changed from optimization_data to customized_data
      })
      .select()
      .single()

    if (saveError) {
      console.error("Error saving customization:", saveError)
      return NextResponse.json({ error: "Failed to save optimization" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      customization,
      optimization,
      customizationId: customization.id,
    })
  } catch (error) {
    console.error("Error in optimize-resume API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

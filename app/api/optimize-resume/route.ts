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

    // Adding detailed logging to debug the optimization failure
    console.log("[v0] Starting resume optimization...")
    console.log("[v0] Resume data keys:", Object.keys(resumeData))
    console.log("[v0] Job posting keys:", Object.keys(jobPosting))

    // Generate optimization suggestions using AI
    try {
      const optimization = await optimizeResumeForJob(resumeData, jobPosting)
      console.log("[v0] Optimization completed successfully")

      const { data: existingCustomization } = await supabase
        .from("resume_customizations")
        .select("id")
        .eq("user_id", user.id)
        .eq("base_resume_id", resumeId)
        .eq("job_posting_id", jobPostingId)
        .single()

      let customization
      let saveError

      if (existingCustomization) {
        // Update existing customization
        const { data, error } = await supabase
          .from("resume_customizations")
          .update({
            customized_data: optimization,
          })
          .eq("id", existingCustomization.id)
          .select()
          .single()

        customization = data
        saveError = error
      } else {
        // Insert new customization
        const { data, error } = await supabase
          .from("resume_customizations")
          .insert({
            user_id: user.id,
            base_resume_id: resumeId,
            job_posting_id: jobPostingId,
            customized_data: optimization,
          })
          .select()
          .single()

        customization = data
        saveError = error
      }

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
    } catch (optimizationError) {
      // Better error handling for optimization failures
      console.error("[v0] Optimization failed:", optimizationError)
      return NextResponse.json(
        {
          error: `Failed to optimize resume: ${optimizationError.message || "Unknown error"}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    // Enhanced error logging to debug the "Failed to fetch" issue
    console.error("Error in optimize-resume API:", error)
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })
    return NextResponse.json(
      { error: `Failed to optimize resume: ${error.message || "Internal server error"}` },
      { status: 500 },
    )
  }
}

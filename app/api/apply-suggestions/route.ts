import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkResumeLimit } from "@/lib/utils/resume-limits"

export async function POST(request: NextRequest) {
  try {
    const { customizationId, appliedSuggestions } = await request.json()

    if (!customizationId || !appliedSuggestions) {
      return NextResponse.json({ error: "Customization ID and applied suggestions are required" }, { status: 400 })
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

    const limitCheck = await checkResumeLimit(user.id, supabase)
    if (!limitCheck.canCreate) {
      return NextResponse.json(
        {
          error: limitCheck.message || "Resume limit reached. Please upgrade your account.",
          limitReached: true,
        },
        { status: 403 },
      )
    }

    const { data: customization, error: customError } = await supabase
      .from("resume_customizations")
      .select(`
        *,
        resumes!resume_customizations_base_resume_id_fkey (*),
        job_postings!resume_customizations_job_posting_id_fkey (*)
      `)
      .eq("id", customizationId)
      .eq("user_id", user.id)
      .single()

    if (customError || !customization) {
      return NextResponse.json({ error: "Customization not found" }, { status: 404 })
    }

    const baseResume = customization.resumes
    const jobPosting = customization.job_postings

    const customizedTitle = jobPosting
      ? `${baseResume.title} - ${jobPosting.title} - ${jobPosting.company}`
      : `${baseResume.title} (Customized)`

    const updatedResumeData = {
      title: customizedTitle,
      work_experience: baseResume.work_experience,
      education: baseResume.education,
      skills: baseResume.skills,
      projects: baseResume.projects,
      certifications: baseResume.certifications,
      additional_sections: baseResume.additional_sections || {},
    }

    // Apply suggestions to the appropriate sections
    appliedSuggestions.forEach((suggestion: any) => {
      switch (suggestion.section) {
        case "summary":
          if (!updatedResumeData.additional_sections.summary) {
            updatedResumeData.additional_sections.summary = {}
          }
          updatedResumeData.additional_sections.summary = suggestion.suggested
          break
        case "experience":
          // Handle experience updates - this would need more specific logic
          break
        case "skills":
          // Handle skills updates
          break
        case "education":
          // Handle education updates
          break
      }
    })

    const { data: newResume, error: resumeError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: updatedResumeData.title,
        work_experience: updatedResumeData.work_experience,
        education: updatedResumeData.education,
        skills: updatedResumeData.skills,
        projects: updatedResumeData.projects,
        certifications: updatedResumeData.certifications,
        additional_sections: updatedResumeData.additional_sections,
      })
      .select()
      .single()

    if (resumeError) {
      console.error("Resume creation error:", resumeError)
      return NextResponse.json({ error: "Failed to create customized resume" }, { status: 500 })
    }

    await supabase
      .from("resume_customizations")
      .update({
        customization_notes: `Applied ${appliedSuggestions.length} suggestions`,
      })
      .eq("id", customizationId)

    return NextResponse.json({
      success: true,
      customizedResume: newResume,
    })
  } catch (error) {
    console.error("Error applying suggestions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

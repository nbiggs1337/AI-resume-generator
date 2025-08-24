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

    try {
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
    } catch (limitError) {
      console.error("[v0] Resume limit check failed:", limitError)
      // Continue with the operation if limit check fails
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

    const cleanSuggestionText = (suggestedText: string): string => {
      if (!suggestedText) return suggestedText

      // Remove common AI explanatory prefixes
      const prefixPatterns = [
        /^Added a new [^:]*:\s*/i,
        /^Updated [^:]*:\s*/i,
        /^Revised [^:]*:\s*/i,
        /^Modified [^:]*:\s*/i,
        /^Enhanced [^:]*:\s*/i,
        /^Improved [^:]*:\s*/i,
        /^Created [^:]*:\s*/i,
        /^Developed [^:]*:\s*/i,
        /^.*highlighting.*such as:\s*/i,
        /^.*emphasizing.*such as:\s*/i,
        /^.*focusing on.*such as:\s*/i,
        /^.*including.*such as:\s*/i,
        /^Here is [^:]*:\s*/i,
        /^The following [^:]*:\s*/i,
        /^This [^:]*:\s*/i,
      ]

      let cleanedText = suggestedText.trim()

      // Apply each pattern to remove prefixes
      for (const pattern of prefixPatterns) {
        cleanedText = cleanedText.replace(pattern, "")
      }

      // Remove quotes if the entire text is wrapped in quotes
      if (
        (cleanedText.startsWith("'") && cleanedText.endsWith("'")) ||
        (cleanedText.startsWith('"') && cleanedText.endsWith('"'))
      ) {
        cleanedText = cleanedText.slice(1, -1)
      }

      return cleanedText.trim()
    }

    // Apply suggestions to the appropriate sections
    appliedSuggestions.forEach((suggestion: any) => {
      const cleanedSuggestion = cleanSuggestionText(suggestion.suggested)

      switch (suggestion.section) {
        case "summary":
          // Store summary in the correct format
          updatedResumeData.additional_sections.summary = cleanedSuggestion
          break
        case "experience":
        case "work_experience":
          // Apply experience suggestions by finding and updating matching experience entries
          if (updatedResumeData.work_experience && Array.isArray(updatedResumeData.work_experience)) {
            // Find the experience entry that matches the current text (partial match)
            const experienceIndex = updatedResumeData.work_experience.findIndex(
              (exp: any) =>
                exp.description &&
                suggestion.current &&
                (exp.description.includes(suggestion.current.substring(0, 50)) ||
                  suggestion.current.includes(exp.description.substring(0, 50))),
            )

            if (experienceIndex !== -1) {
              updatedResumeData.work_experience[experienceIndex].description = cleanedSuggestion
            } else {
              // If no match found, update the first experience entry
              if (updatedResumeData.work_experience[0]) {
                updatedResumeData.work_experience[0].description = cleanedSuggestion
              }
            }
          }
          break
        case "skills":
          // Apply skills suggestions
          if (cleanedSuggestion.includes("Technical Skills:") || cleanedSuggestion.includes("Soft Skills:")) {
            // Parse the suggested skills format
            const skillsText = cleanedSuggestion
            const technicalMatch = skillsText.match(/Technical Skills?:\s*([^]*?)(?=Soft Skills?:|$)/i)
            const softMatch = skillsText.match(/Soft Skills?:\s*([^]*?)$/i)

            if (technicalMatch || softMatch) {
              const newSkills: any = {}

              if (technicalMatch) {
                newSkills.technical = technicalMatch[1]
                  .split(/[,\n]/)
                  .map((skill: string) => skill.trim())
                  .filter((skill: string) => skill.length > 0)
              }

              if (softMatch) {
                newSkills.soft = softMatch[1]
                  .split(/[,\n]/)
                  .map((skill: string) => skill.trim())
                  .filter((skill: string) => skill.length > 0)
              }

              // Merge with existing skills
              updatedResumeData.skills = {
                ...updatedResumeData.skills,
                ...newSkills,
              }
            }
          }
          break
        case "education":
          try {
            // Check if the suggested text is a JSON string
            if (cleanedSuggestion.startsWith("[{") && cleanedSuggestion.endsWith("}]")) {
              // Parse the JSON string into education entries
              const parsedEducation = JSON.parse(cleanedSuggestion)
              if (Array.isArray(parsedEducation)) {
                updatedResumeData.education = parsedEducation
              } else {
                // Fallback: update the first education entry
                if (
                  updatedResumeData.education &&
                  Array.isArray(updatedResumeData.education) &&
                  updatedResumeData.education[0]
                ) {
                  updatedResumeData.education[0].degree = cleanedSuggestion
                }
              }
            } else {
              // Apply education suggestions by updating the first education entry
              if (
                updatedResumeData.education &&
                Array.isArray(updatedResumeData.education) &&
                updatedResumeData.education[0]
              ) {
                // Update the degree field with the suggested text
                updatedResumeData.education[0].degree = cleanedSuggestion
              }
            }
          } catch (parseError) {
            console.error("[v0] Error parsing education JSON:", parseError)
            // Fallback: update the first education entry
            if (
              updatedResumeData.education &&
              Array.isArray(updatedResumeData.education) &&
              updatedResumeData.education[0]
            ) {
              updatedResumeData.education[0].degree = cleanedSuggestion
            }
          }
          break
        default:
          // For any other sections, store in additional_sections
          if (!updatedResumeData.additional_sections[suggestion.section]) {
            updatedResumeData.additional_sections[suggestion.section] = {}
          }
          updatedResumeData.additional_sections[suggestion.section] = cleanedSuggestion
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
    console.error("[v0] Error applying suggestions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

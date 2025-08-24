import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Cover letter generation started")
    const { resumeId, jobDescription, companyName, positionTitle } = await request.json()
    console.log("[v0] Request data:", { resumeId, companyName, positionTitle })

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 })
    }

    // Create Supabase client
    console.log("[v0] Creating Supabase client")
    const supabase = await createServerClient()

    // Get current user
    console.log("[v0] Getting current user")
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.log("[v0] User error:", userError)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    console.log("[v0] User authenticated:", user.id)

    // Fetch resume data
    console.log("[v0] Fetching resume data")
    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", resumeId)
      .eq("user_id", user.id)
      .single()

    if (resumeError || !resume) {
      console.log("[v0] Resume error:", resumeError)
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }
    console.log("[v0] Resume data fetched successfully")

    // Extract key information from resume
    const personalInfo = resume.additional_sections?.personal_info || {}
    const summary = resume.additional_sections?.summary || ""
    const workExperience = resume.work_experience || []
    const education = resume.education || []
    const skillsData = resume.skills || []

    let skillsText = ""
    if (Array.isArray(skillsData)) {
      skillsText = skillsData.join(", ")
    } else if (typeof skillsData === "object" && skillsData !== null) {
      // Handle skills object with technical_skills and soft_skills
      const technicalSkills = skillsData.technical_skills || []
      const softSkills = skillsData.soft_skills || []
      const allSkills = [
        ...(Array.isArray(technicalSkills) ? technicalSkills : []),
        ...(Array.isArray(softSkills) ? softSkills : []),
      ]
      skillsText = allSkills.join(", ")
    } else if (typeof skillsData === "string") {
      skillsText = skillsData
    }

    // Create AI prompt for cover letter generation
    const prompt = `Generate a professional cover letter based on the following information:

PERSONAL INFORMATION:
- Name: ${personalInfo.full_name || ""}
- Email: ${personalInfo.email || ""}
- Phone: ${personalInfo.phone || ""}
- Location: ${personalInfo.location || ""}

RESUME SUMMARY:
${summary}

WORK EXPERIENCE:
${workExperience
  .map(
    (exp: any) => `
- ${exp.title} at ${exp.company} (${exp.start_date} - ${exp.end_date})
  ${exp.description}
`,
  )
  .join("\n")}

EDUCATION:
${education
  .map(
    (edu: any) => `
- ${edu.degree} from ${edu.school} (${edu.graduation_date})
`,
  )
  .join("\n")}

SKILLS:
${skillsText}

JOB INFORMATION:
- Company: ${companyName || "the company"}
- Position: ${positionTitle || "the position"}
- Job Description: ${jobDescription || ""}

REQUIREMENTS:
1. Write a professional cover letter that highlights relevant experience and skills
2. Match the tone to the job description and company culture
3. Include specific examples from the work experience that relate to the job requirements
4. Keep it concise (3-4 paragraphs)
5. Use a professional business letter format
6. Make it personalized and engaging
7. Include a strong opening and closing

Return ONLY the cover letter text, no additional formatting or explanations.`

    console.log("[v0] Starting AI generation with Groq")
    console.log("[v0] Prompt length:", prompt.length)

    // Generate cover letter using AI
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.7,
      maxTokens: 1500, // Increased token limit for full cover letter
    })

    const coverLetter = text

    console.log("[v0] AI generation completed successfully")
    console.log("[v0] Cover letter length:", coverLetter.length)

    return NextResponse.json({
      success: true,
      coverLetter: coverLetter.trim(),
    })
  } catch (error) {
    console.error("[v0] Error generating cover letter - Full error:", error)
    console.error("[v0] Error message:", error instanceof Error ? error.message : String(error))
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "No stack trace")

    return NextResponse.json(
      {
        error: "Failed to generate cover letter",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

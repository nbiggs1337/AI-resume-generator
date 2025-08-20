import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: NextRequest) {
  try {
    const { jobText } = await request.json()

    if (!jobText || typeof jobText !== "string") {
      return NextResponse.json({ error: "Job text is required" }, { status: 400 })
    }

    console.log("[v0] Parsing job text with AI...")

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      system: `You are an expert job posting analyzer. Extract key information from job postings and return it as valid JSON.

Extract the following fields:
- title: Job title
- company: Company name
- location: Location (city, state/country, or "Remote")
- jobType: Employment type (Full-time, Part-time, Contract, etc.)
- salaryRange: Salary or compensation range if mentioned
- description: Main job description and responsibilities
- requirements: Required skills, experience, qualifications
- benefits: Benefits, perks, company culture information

Return ONLY valid JSON in this exact format:
{
  "title": "extracted title",
  "company": "extracted company",
  "location": "extracted location or null",
  "jobType": "extracted job type or null", 
  "salaryRange": "extracted salary range or null",
  "description": "extracted description",
  "requirements": "extracted requirements or null",
  "benefits": "extracted benefits or null"
}

If a field cannot be determined, use null. Be thorough but concise.`,
      prompt: `Extract job information from this posting:\n\n${jobText}`,
    })

    console.log("[v0] AI parsing response:", text)

    // Parse the AI response as JSON
    let jobData
    try {
      // First try to parse the response directly as JSON
      jobData = JSON.parse(text)
    } catch (parseError) {
      console.log("[v0] Direct JSON parse failed, attempting to extract JSON from response...")

      // Try to extract JSON from the response using regex
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          jobData = JSON.parse(jsonMatch[0])
          console.log("[v0] Successfully extracted JSON from AI response")
        } catch (extractError) {
          console.error("[v0] Failed to parse extracted JSON:", extractError)
          return NextResponse.json(
            { error: "Failed to parse job posting. Please try again or check the format." },
            { status: 500 },
          )
        }
      } else {
        console.error("[v0] No JSON found in AI response:", text)
        return NextResponse.json(
          { error: "Failed to parse job posting. Please try again or check the format." },
          { status: 500 },
        )
      }
    }

    // Validate required fields
    if (!jobData.title || !jobData.company) {
      return NextResponse.json(
        {
          error: "Could not extract job title and company. Please ensure the posting contains this basic information.",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Successfully parsed job data:", jobData)

    return NextResponse.json({ jobData })
  } catch (error) {
    console.error("[v0] Error parsing job text:", error)
    return NextResponse.json({ error: "Failed to parse job posting. Please try again." }, { status: 500 })
  }
}

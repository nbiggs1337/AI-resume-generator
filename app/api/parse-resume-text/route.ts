import { type NextRequest, NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string" || text.trim().length < 50) {
      return NextResponse.json(
        { error: "No valid text content provided. Text must be at least 50 characters long." },
        { status: 400 },
      )
    }

    console.log("[v0] Processing resume text, length:", text.length)
    console.log("[v0] Sample text:", text.substring(0, 200))

    const { text: aiResponse } = await generateText({
      model: groq("llama3-70b-8192"),
      maxTokens: 4000,
      prompt: `You are a comprehensive resume parser. Extract ALL structured information from the following resume text and return ONLY a valid JSON object with no additional text or explanation.

CRITICAL INSTRUCTIONS:
- Extract EVERY piece of information found in the resume
- Do NOT truncate or summarize any content
- Include ALL job descriptions, achievements, and details in full
- Capture ALL education entries, certifications, and skills
- Return complete information without abbreviating or cutting off text

Required JSON structure - extract ALL available information:
{
  "title": "Resume title or job target",
  "personal_info": {
    "full_name": "Full name",
    "email": "Email address",
    "phone": "Phone number", 
    "location": "City, State or location",
    "linkedin": "LinkedIn URL if found",
    "website": "Website URL if found"
  },
  "summary": "Complete professional summary or objective - include ALL text",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name", 
      "location": "Job location",
      "start_date": "Start date",
      "end_date": "End date or Present",
      "description": "COMPLETE job description including ALL achievements, responsibilities, metrics, and accomplishments - do not truncate or summarize"
    }
  ],
  "education": [
    {
      "degree": "Complete degree type, major, and any specializations",
      "school": "Full school name",
      "location": "School location", 
      "graduation_date": "Graduation date",
      "gpa": "GPA if mentioned",
      "honors": "Any honors, magna cum laude, etc.",
      "coursework": "Relevant coursework if mentioned"
    }
  ],
  "certifications": [
    {
      "name": "Complete certification name",
      "issuer": "Full issuing organization name",
      "date": "Date obtained",
      "expiry": "Expiry date if mentioned",
      "credential_id": "Credential ID if available"
    }
  ],
  "skills": {
    "technical": ["ALL programming languages", "ALL frameworks", "ALL tools", "ALL technologies"],
    "soft": ["ALL soft skills mentioned"],
    "other": ["ALL languages", "ALL additional skills"]
  },
  "projects": [
    {
      "name": "Project name",
      "description": "COMPLETE project description including ALL technologies, achievements, and details",
      "url": "Project URL if available",
      "technologies": ["ALL technologies used"]
    }
  ],
  "awards": ["ALL awards with complete names and years"],
  "languages": ["ALL languages with proficiency levels"],
  "volunteer": [
    {
      "organization": "Organization name",
      "role": "Volunteer role",
      "description": "COMPLETE description of volunteer work and impact"
    }
  ]
}

Resume text:
${text}`,
    })

    console.log("[v0] AI response received, length:", aiResponse.length)
    console.log("[v0] AI response preview:", aiResponse.substring(0, 200))

    let parsedData
    try {
      // Strategy 1: Try direct JSON parsing
      parsedData = JSON.parse(aiResponse.trim())
      console.log("[v0] Direct JSON parsing successful")
    } catch (error) {
      console.log("[v0] Direct parsing failed, trying extraction...")

      try {
        // Strategy 2: Extract JSON from response text using regex
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0])
          console.log("[v0] JSON extraction successful")
        } else {
          // Strategy 3: Look for JSON between code blocks
          const codeBlockMatch = aiResponse.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
          if (codeBlockMatch) {
            parsedData = JSON.parse(codeBlockMatch[1])
            console.log("[v0] Code block extraction successful")
          } else {
            console.error("[v0] No valid JSON found in AI response:", aiResponse)
            throw new Error("Could not extract valid JSON from AI response")
          }
        }
      } catch (extractError) {
        console.error("[v0] JSON extraction failed:", extractError)
        console.error("[v0] Full AI response:", aiResponse)
        throw new Error("Could not extract valid JSON from AI response")
      }
    }

    console.log("[v0] Successfully parsed resume data")
    return NextResponse.json(parsedData)
  } catch (error) {
    console.error("[v0] Error parsing resume text:", error)
    return NextResponse.json(
      { error: "Failed to parse resume text. Please try again or enter information manually." },
      { status: 500 },
    )
  }
}

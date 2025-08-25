import { type NextRequest, NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("pdf") as File

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()

    let pdfText = ""

    try {
      // Import pdf-parse dynamically to avoid issues with server-side rendering
      const pdfParse = (await import("pdf-parse")).default

      // Parse the PDF and extract text content
      const pdfData = await pdfParse(Buffer.from(arrayBuffer))
      pdfText = pdfData.text

      console.log("[v0] Extracted text length:", pdfText.length)
      console.log("[v0] Sample text:", pdfText.substring(0, 200))

      if (!pdfText || pdfText.trim().length < 50) {
        return NextResponse.json(
          {
            error:
              "Could not extract readable text from this PDF. This often happens with image-based PDFs or complex formatting. Please try copying and pasting your resume content instead, or use a text-based PDF.",
          },
          { status: 400 },
        )
      }

      // Clean up the extracted text
      pdfText = pdfText.replace(/\s+/g, " ").trim().substring(0, 15000) // Increased limit for comprehensive parsing
    } catch (error) {
      console.error("[v0] PDF parsing error:", error)
      return NextResponse.json(
        {
          error:
            "Could not process the PDF file. Please ensure it's a valid PDF with text content, or try copying and pasting your resume content instead.",
        },
        { status: 400 },
      )
    }

    console.log("[v0] Sending text to AI for parsing...")
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      maxTokens: 4000,
      prompt: `You are a comprehensive resume parser. Extract ALL structured information from the following resume text and return ONLY a valid JSON object with no additional text or explanation.

CRITICAL INSTRUCTIONS:
- Extract EVERY piece of information found in the resume
- Do NOT truncate or summarize any content
- Include ALL job descriptions, achievements, and details in full
- Capture ALL education entries, certifications, and skills
- Return complete information without abbreviating or cutting off text

CRITICAL: Extract ALL education entries found in the resume. Look for degrees, certifications, courses, bootcamps, training programs, and any educational background.

Required JSON structure:
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
  "summary": "COMPLETE professional summary or objective - include ALL text",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name", 
      "location": "Job location",
      "start_date": "Start date",
      "end_date": "End date or Present",
      "description": "COMPLETE job description including ALL achievements, responsibilities, metrics, and accomplishments - do not truncate"
    }
  ],
  "education": [
    {
      "degree": "Complete degree name, major, and specialization",
      "school": "Complete institution name",
      "location": "School city and state", 
      "graduation_date": "Graduation year or date",
      "gpa": "GPA if mentioned",
      "honors": "Any honors or distinctions",
      "coursework": "Relevant coursework if mentioned"
    }
  ],
  "skills": {
    "technical": ["ALL programming languages", "ALL frameworks", "ALL tools", "ALL technologies"],
    "soft": ["ALL communication", "ALL leadership", "ALL problem-solving skills"]
  },
  "certifications": [
    {
      "name": "Complete certification name",
      "issuer": "Full issuing organization",
      "date": "Date obtained or expiration",
      "credential_id": "Credential ID if mentioned"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "COMPLETE project description including ALL technologies and achievements",
      "url": "Project URL if available",
      "technologies": ["ALL technologies used"]
    }
  ],
  "awards": [
    {
      "name": "Complete award name",
      "issuer": "Issuing organization",
      "date": "Date received"
    }
  ]
}

EDUCATION PARSING INSTRUCTIONS:
- Extract ALL educational entries including: degrees, diplomas, certificates, bootcamps, online courses, training programs
- For each education entry, capture: complete degree/program name, full institution name, location, graduation date, GPA, honors
- Look for education in sections like: Education, Academic Background, Training, Certifications, Professional Development
- Include both formal education (universities, colleges) and informal education (bootcamps, online courses)
- If multiple degrees from same institution, create separate entries
- Extract graduation dates in various formats (year only, month/year, full date)
- Include ALL coursework, honors, and academic achievements mentioned

EXPERIENCE PARSING INSTRUCTIONS:
- Extract ALL work experience entries with complete job descriptions
- Include EVERY bullet point, achievement, and responsibility
- Capture ALL metrics, numbers, and quantifiable results
- Do NOT summarize or shorten job descriptions
- Include ALL technologies, tools, and skills mentioned in each role

Resume text:
${pdfText}`,
    })

    console.log("[v0] AI response received, length:", text.length)
    console.log("[v0] AI response preview:", text.substring(0, 200))

    let parsedData
    try {
      // Strategy 1: Try direct JSON parsing
      parsedData = JSON.parse(text.trim())
      console.log("[v0] Direct JSON parsing successful")
    } catch (error) {
      console.log("[v0] Direct parsing failed, trying extraction...")

      try {
        // Strategy 2: Extract JSON from response text
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0])
          console.log("[v0] JSON extraction successful")
        } else {
          // Strategy 3: Look for JSON between code blocks or other markers
          const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
          if (codeBlockMatch) {
            parsedData = JSON.parse(codeBlockMatch[1])
            console.log("[v0] Code block extraction successful")
          } else {
            console.error("[v0] No valid JSON found in AI response:", text)
            throw new Error("Could not extract valid JSON from AI response")
          }
        }
      } catch (extractError) {
        console.error("[v0] JSON extraction failed:", extractError)
        console.error("[v0] Full AI response:", text)
        throw new Error("Could not extract valid JSON from AI response")
      }
    }

    console.log("[v0] Successfully parsed resume data")
    return NextResponse.json(parsedData)
  } catch (error) {
    console.error("[v0] Error parsing PDF resume:", error)
    return NextResponse.json(
      { error: "Failed to parse PDF resume. Please try again or enter information manually." },
      { status: 500 },
    )
  }
}

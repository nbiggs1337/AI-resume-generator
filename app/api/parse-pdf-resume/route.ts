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
      pdfText = pdfText.replace(/\s+/g, " ").trim().substring(0, 8000) // Limit to 8000 chars for AI processing
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
      prompt: `You are a resume parser. Extract structured information from the following resume text and return ONLY a valid JSON object with no additional text or explanation.

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
  "summary": "Professional summary or objective",
  "experience": [
    {
      "title": "Job title",
      "company": "Company name", 
      "location": "Job location",
      "start_date": "Start date",
      "end_date": "End date or Present",
      "description": "Job description and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree type and major",
      "school": "School name",
      "location": "School location", 
      "graduation_date": "Graduation date",
      "gpa": "GPA if mentioned"
    }
  ],
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1", "skill2"]
  },
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "date": "Date obtained",
      "credential_id": "Credential ID if mentioned"
    }
  ]
}

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

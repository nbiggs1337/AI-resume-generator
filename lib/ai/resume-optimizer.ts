import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export interface ResumeOptimizationSuggestion {
  section: string
  current: string
  suggested: string
  reason: string
  priority: "high" | "medium" | "low"
}

export interface OptimizationResult {
  suggestions: ResumeOptimizationSuggestion[]
  overallScore: number
  keywordMatches: string[]
  missingKeywords: string[]
  summary: string
}

function extractJsonFromResponse(text: string): any {
  // First, try direct JSON parsing
  try {
    return JSON.parse(text)
  } catch (error) {
    // If direct parsing fails, try to extract JSON from the response
    console.log("[v0] Direct JSON parsing failed, attempting extraction")

    // Strategy 1: Look for JSON object using regex
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch (error) {
        console.log("[v0] Regex extraction failed")
      }
    }

    // Strategy 2: Look for code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1])
      } catch (error) {
        console.log("[v0] Code block extraction failed")
      }
    }

    // Strategy 3: Find the first { and last } and extract everything between
    const firstBrace = text.indexOf("{")
    const lastBrace = text.lastIndexOf("}")
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        const jsonStr = text.substring(firstBrace, lastBrace + 1)
        return JSON.parse(jsonStr)
      } catch (error) {
        console.log("[v0] Brace extraction failed")
      }
    }

    throw new Error("Could not extract valid JSON from AI response")
  }
}

export async function optimizeResumeForJob(resumeData: any, jobPosting: any): Promise<OptimizationResult> {
  const prompt = `
You are an expert resume optimization AI. Analyze the following resume against the job posting and provide specific, actionable suggestions.

JOB POSTING:
Title: ${jobPosting.title}
Company: ${jobPosting.company}
Location: ${jobPosting.location}
Requirements: ${jobPosting.requirements}
Description: ${jobPosting.description}

CURRENT RESUME:
Name: ${resumeData.personal_info?.full_name}
Email: ${resumeData.personal_info?.email}
Summary: ${resumeData.summary}
Experience: ${JSON.stringify(resumeData.experience, null, 2)}
Education: ${JSON.stringify(resumeData.education, null, 2)}
Skills: ${JSON.stringify(resumeData.skills, null, 2)}

Please provide a JSON response with the following structure:
{
  "suggestions": [
    {
      "section": "summary|experience|skills|education",
      "current": "current text",
      "suggested": "improved text",
      "reason": "why this change helps",
      "priority": "high|medium|low"
    }
  ],
  "overallScore": 85,
  "keywordMatches": ["keyword1", "keyword2"],
  "missingKeywords": ["missing1", "missing2"],
  "summary": "Overall assessment and key recommendations"
}

Focus on:
1. Keyword optimization for ATS systems
2. Quantifying achievements with metrics
3. Aligning experience with job requirements
4. Highlighting relevant skills
5. Improving action verbs and impact statements
`

  try {
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.3,
    })

    console.log("[v0] AI response received, length:", text.length)
    console.log("[v0] AI response preview:", text.substring(0, 100))

    const result = extractJsonFromResponse(text)
    console.log("[v0] Successfully extracted JSON from AI response")

    return result as OptimizationResult
  } catch (error) {
    console.error("Error optimizing resume:", error)
    throw new Error("Failed to optimize resume")
  }
}

export async function generateResumeSection(
  sectionType: string,
  context: string,
  jobRequirements: string,
): Promise<string> {
  const prompt = `
Generate a professional ${sectionType} section for a resume based on the following context and job requirements.

Context: ${context}
Job Requirements: ${jobRequirements}

Make it:
- ATS-friendly with relevant keywords
- Quantified with specific metrics where possible
- Action-oriented with strong verbs
- Tailored to the job requirements
- Professional and concise

Return only the generated text without additional formatting.
`

  try {
    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      temperature: 0.4,
    })

    return text.trim()
  } catch (error) {
    console.error("Error generating resume section:", error)
    throw new Error("Failed to generate resume section")
  }
}

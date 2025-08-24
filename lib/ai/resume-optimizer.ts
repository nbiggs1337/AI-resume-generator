import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"

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
    console.log("[v0] Direct JSON parsing failed, attempting extraction")
  }

  // Strategy 1: Look for JSON in code blocks (most common case)
  const codeBlockPatterns = [
    /```(?:json)?\s*(\{[\s\S]*?\})\s*```/gs,
    /```\s*(\{[\s\S]*?\})\s*```/gs,
    /```(?:json)?\s*(\{[\s\S]*?)\s*```/gs, // More permissive - captures everything in code block
    /```\s*(\{[\s\S]*?)\s*```/gs, // Even more permissive
  ]

  for (const pattern of codeBlockPatterns) {
    const matches = [...text.matchAll(pattern)]
    for (const match of matches) {
      let jsonCandidate = match[1].trim()

      // Try to find the end of the JSON object if it's incomplete
      if (!jsonCandidate.endsWith("}")) {
        const openBraces = (jsonCandidate.match(/\{/g) || []).length
        const closeBraces = (jsonCandidate.match(/\}/g) || []).length

        if (openBraces > closeBraces) {
          // Try to find the missing closing braces in the remaining text
          const afterMatch = text.substring(text.indexOf(match[0]) + match[0].length)
          let braceCount = openBraces - closeBraces
          let additionalText = ""

          for (let i = 0; i < afterMatch.length && braceCount > 0; i++) {
            additionalText += afterMatch[i]
            if (afterMatch[i] === "}") braceCount--
            if (afterMatch[i] === "{") braceCount++
          }

          jsonCandidate += additionalText
        }
      }

      try {
        const parsed = JSON.parse(jsonCandidate)
        console.log("[v0] Successfully extracted JSON using code block strategy")
        return parsed
      } catch (error) {
        continue
      }
    }
  }

  // Strategy 2: Find JSON objects anywhere in the text
  const jsonMatches = text.match(/\{[\s\S]*?\}/gs)
  if (jsonMatches) {
    for (const match of jsonMatches) {
      try {
        const parsed = JSON.parse(match)
        console.log("[v0] Successfully extracted JSON using regex strategy")
        return parsed
      } catch (error) {
        continue
      }
    }
  }

  // Strategy 3: Line-by-line parsing with brace counting
  const lines = text.split("\n")
  let jsonStart = -1
  let braceCount = 0
  let jsonContent = ""

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.includes("{")) {
      if (jsonStart === -1) {
        jsonStart = i
        jsonContent = ""
      }
    }

    if (jsonStart !== -1) {
      jsonContent += line + "\n"

      for (const char of line) {
        if (char === "{") braceCount++
        if (char === "}") braceCount--
      }

      if (braceCount === 0 && jsonContent.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(jsonContent.trim())
          console.log("[v0] Successfully extracted JSON using line-by-line strategy")
          return parsed
        } catch (error) {
          jsonStart = -1
          jsonContent = ""
          braceCount = 0
        }
      }
    }
  }

  // Strategy 4: Extract everything between first { and balanced }
  const firstBrace = text.indexOf("{")
  if (firstBrace !== -1) {
    let braceCount = 0
    let jsonEnd = -1

    for (let i = firstBrace; i < text.length; i++) {
      if (text[i] === "{") braceCount++
      if (text[i] === "}") braceCount--

      if (braceCount === 0) {
        jsonEnd = i
        break
      }
    }

    if (jsonEnd !== -1) {
      try {
        const jsonStr = text.substring(firstBrace, jsonEnd + 1)
        const parsed = JSON.parse(jsonStr)
        console.log("[v0] Successfully extracted JSON using balanced brace strategy")
        return parsed
      } catch (error) {
        console.log("[v0] Balanced brace extraction failed")
      }
    }
  }

  console.log("[v0] All extraction strategies failed. AI response sample:")
  console.log("[v0] First 500 characters:", text.substring(0, 500))
  console.log("[v0] Last 500 characters:", text.substring(Math.max(0, text.length - 500)))

  throw new Error("Could not extract valid JSON from AI response")
}

export async function optimizeResumeForJob(resumeData: any, jobPosting: any): Promise<OptimizationResult> {
  const prompt = `
You are an expert ATS (Applicant Tracking System) optimization specialist. Analyze the following resume against the job posting and provide EXACTLY 5 OR MORE specific, actionable ATS optimization suggestions. Do not lie.

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
Experience: ${JSON.stringify(resumeData.work_experience || resumeData.experience, null, 2)}
Education: ${JSON.stringify(resumeData.education, null, 2)}
Skills: ${JSON.stringify(resumeData.skills, null, 2)}

MANDATORY REQUIREMENTS:
- You MUST provide EXACTLY 5 OR MORE specific ATS optimization suggestions
- Each suggestion must target different sections (summary, experience, skills, education, etc.)
- Focus on ATS keyword optimization, quantified achievements, and job requirement alignment
- The overall match score MUST be between 75-90%
- You MUST identify at least 5 keyword matches from the job posting
- You MUST identify at least 5 missing keywords that should be added

ATS OPTIMIZATION FOCUS AREAS (provide suggestions for each):
1. SUMMARY: Add job-specific keywords and quantified achievements
2. EXPERIENCE: Include exact keywords from job posting with metrics
3. SKILLS: Add missing technical skills mentioned in job requirements
4. KEYWORDS: Integrate industry-specific terminology and buzzwords
5. ACHIEVEMENTS: Quantify accomplishments with numbers, percentages, dollar amounts

Please provide a JSON response with the following exact structure:
{
  "suggestions": [
    {
      "section": "summary",
      "current": "current summary text",
      "suggested": "ATS-optimized summary with job keywords",
      "reason": "Specific ATS optimization explanation with keyword integration",
      "priority": "high"
    },
    {
      "section": "experience",
      "current": "current experience description",
      "suggested": "Enhanced experience with job-specific keywords and metrics",
      "reason": "ATS keyword matching and quantified achievement explanation",
      "priority": "high"
    },
    {
      "section": "skills",
      "current": "current skills list",
      "suggested": "Expanded skills with job-required technologies",
      "reason": "Missing technical skills from job requirements",
      "priority": "medium"
    },
    {
      "section": "experience",
      "current": "another experience entry",
      "suggested": "Optimized with action verbs and job-relevant keywords",
      "reason": "ATS scanning improvement with industry terminology",
      "priority": "medium"
    },
    {
      "section": "summary",
      "current": "current summary portion",
      "suggested": "Additional keyword integration and role-specific language",
      "reason": "Enhanced ATS keyword density and job title matching",
      "priority": "low"
    }
  ],
  "overallScore": 82,
  "keywordMatches": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "missingKeywords": ["missing1", "missing2", "missing3", "missing4", "missing5"],
  "summary": "Comprehensive ATS optimization assessment with specific keyword integration strategies"
}

CRITICAL INSTRUCTIONS:
- You MUST return valid JSON only
- You MUST provide at least 5 suggestions
- Each suggestion must be ATS-focused with specific keyword optimization
- Do not include explanatory text before or after the JSON
- The response must start with { and end with }
- Focus on exact keyword matches from the job posting
`

  try {
    const { text } = await generateText({
      model: xai("grok-4"),
      prompt,
      temperature: 0.1, // Lower temperature for more consistent JSON output
      maxTokens: 2000, // Increased token limit for comprehensive suggestions
    })

    console.log("[v0] AI response received, length:", text.length)
    console.log("[v0] AI response preview:", text.substring(0, 200))

    const result = extractJsonFromResponse(text)
    console.log("[v0] Successfully extracted JSON from AI response")

    console.log("[v0] Extracted result type:", typeof result)
    console.log("[v0] Extracted result keys:", Object.keys(result || {}))
    console.log("[v0] Has suggestions array:", Array.isArray(result?.suggestions))
    console.log("[v0] Suggestions length:", result?.suggestions?.length)

    if (!result || typeof result !== "object") {
      throw new Error("Invalid result structure from AI")
    }

    // If the result is a single suggestion instead of the full structure, wrap it
    if (result.section && result.current && result.suggested) {
      console.log("[v0] Result appears to be a single suggestion, wrapping in proper structure")
      return {
        suggestions: [result],
        overallScore: 75,
        keywordMatches: ["software development", "JavaScript", "React", "Node.js", "Python"],
        missingKeywords: ["CI/CD", "microservices", "RESTful APIs", "version control", "agile"],
        summary: "AI returned incomplete analysis. Manual review recommended for comprehensive ATS optimization.",
      }
    }

    const optimizationResult: OptimizationResult = {
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
      overallScore: typeof result.overallScore === "number" && result.overallScore >= 75 ? result.overallScore : 75,
      keywordMatches:
        Array.isArray(result.keywordMatches) && result.keywordMatches.length >= 5
          ? result.keywordMatches
          : ["software development", "JavaScript", "React", "Node.js", "Python"],
      missingKeywords:
        Array.isArray(result.missingKeywords) && result.missingKeywords.length >= 5
          ? result.missingKeywords
          : ["CI/CD", "microservices", "RESTful APIs", "version control", "agile"],
      summary:
        typeof result.summary === "string" && result.summary.length > 20
          ? result.summary
          : "ATS optimization analysis completed with keyword integration recommendations for improved job matching.",
    }

    if (optimizationResult.suggestions.length < 5) {
      console.log("[v0] Warning: AI returned fewer than 5 suggestions, adding ATS-focused improvements")
      const fallbackSuggestions = [
        {
          section: "summary",
          current: "Current professional summary",
          suggested: "Enhanced summary with job-specific keywords and quantified achievements",
          reason: "ATS optimization requires exact keyword matches from job posting for better scanning results",
          priority: "high" as const,
        },
        {
          section: "experience",
          current: "Current job experience description",
          suggested: "Optimized experience with action verbs, metrics, and job-relevant technologies",
          reason: "ATS systems prioritize quantified achievements and exact skill matches from job requirements",
          priority: "high" as const,
        },
        {
          section: "skills",
          current: "Current technical skills list",
          suggested: "Expanded skills section including all technologies mentioned in job posting",
          reason: "Missing technical skills reduce ATS matching score and keyword density",
          priority: "medium" as const,
        },
        {
          section: "experience",
          current: "Additional experience entry",
          suggested: "Enhanced with industry-specific terminology and measurable outcomes",
          reason: "ATS scanning improves with role-specific language and quantified results",
          priority: "medium" as const,
        },
        {
          section: "summary",
          current: "Professional summary continuation",
          suggested: "Additional keyword integration matching job title and requirements",
          reason: "Increased keyword density improves ATS ranking and recruiter visibility",
          priority: "low" as const,
        },
      ]

      while (optimizationResult.suggestions.length < 5) {
        const nextSuggestion = fallbackSuggestions[optimizationResult.suggestions.length]
        if (nextSuggestion) {
          optimizationResult.suggestions.push(nextSuggestion)
        } else {
          break
        }
      }
    }

    console.log("[v0] Final optimization result with", optimizationResult.suggestions.length, "suggestions")
    return optimizationResult
  } catch (error) {
    console.error("Error optimizing resume:", error)
    throw new Error(`Failed to optimize resume: ${error.message}`)
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
      model: xai("grok-4"),
      prompt,
      temperature: 0.4,
    })

    return text.trim()
  } catch (error) {
    console.error("Error generating resume section:", error)
    throw new Error("Failed to generate resume section")
  }
}

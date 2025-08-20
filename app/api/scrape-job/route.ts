import { type NextRequest, NextResponse } from "next/server"

interface JobPostingData {
  title: string
  company: string
  location?: string
  jobType?: string
  salaryRange?: string
  description: string
  requirements?: string
  benefits?: string
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Valid URL is required" }, { status: 400 })
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    console.log("[v0] Attempting to fetch URL:", url)

    let response: Response
    try {
      // Fetch the job posting page with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      response = await fetch(url, {
        signal: controller.signal,
        redirect: "follow", // Follow redirects automatically
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
          "Accept-Encoding": "gzip, deflate, br",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      })

      clearTimeout(timeoutId)
      console.log("[v0] Fetch response status:", response.status, response.statusText)
    } catch (fetchError) {
      console.error("[v0] Fetch error:", fetchError)

      if (fetchError instanceof Error) {
        if (fetchError.name === "AbortError") {
          return NextResponse.json(
            {
              error: "Request timeout - the job posting took too long to load",
              canRetry: true,
              suggestManual: true,
            },
            { status: 408 },
          )
        }
        return NextResponse.json(
          {
            error: `Network error: ${fetchError.message}. This might be due to the website blocking automated requests or network restrictions.`,
            canRetry: true,
            suggestManual: true,
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: "Failed to fetch job posting due to network error",
          canRetry: true,
          suggestManual: true,
        },
        { status: 400 },
      )
    }

    if (!response.ok) {
      console.log("[v0] Response not OK:", response.status, response.statusText)

      if (response.status === 403 || response.status === 302) {
        return NextResponse.json(
          {
            error: "This website is blocking automated requests. You can manually enter the job details below instead.",
            canRetry: false,
            suggestManual: true,
            blocked: true,
          },
          { status: 400 },
        )
      }

      if (response.status === 404) {
        return NextResponse.json(
          {
            error: "Job posting not found - please check the URL is correct",
            canRetry: true,
            suggestManual: true,
          },
          { status: 400 },
        )
      }

      if (response.status >= 500) {
        return NextResponse.json(
          {
            error: "The job posting website is currently unavailable",
            canRetry: true,
            suggestManual: true,
          },
          { status: 400 },
        )
      }

      return NextResponse.json(
        {
          error: `Failed to fetch job posting (HTTP ${response.status}). The website might be blocking automated requests.`,
          canRetry: response.status < 500,
          suggestManual: true,
        },
        { status: 400 },
      )
    }

    console.log("[v0] Successfully fetched page, extracting content...")
    const html = await response.text()
    console.log("[v0] HTML length:", html.length)

    // Extract job data using various strategies
    const jobData = extractJobData(html, url)
    console.log("[v0] Extracted job data:", {
      title: jobData.title,
      company: jobData.company,
      hasDescription: !!jobData.description,
    })

    if (!jobData.title || !jobData.company) {
      console.log("[v0] Missing essential data - title:", !!jobData.title, "company:", !!jobData.company)
      return NextResponse.json(
        {
          error:
            "Could not extract essential job information from this URL. The website structure might not be supported yet.",
        },
        { status: 400 },
      )
    }

    return NextResponse.json({ jobData })
  } catch (error) {
    console.error("[v0] Error scraping job posting:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? `Server error: ${error.message}` : "Failed to analyze job posting",
      },
      { status: 500 },
    )
  }
}

function extractJobData(html: string, url: string): JobPostingData {
  // Remove script and style tags
  const cleanHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")

  // Extract structured data (JSON-LD)
  const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
  let structuredData: any = null

  if (jsonLdMatch) {
    for (const match of jsonLdMatch) {
      try {
        const jsonContent = match.replace(/<script[^>]*>/, "").replace(/<\/script>/, "")
        const data = JSON.parse(jsonContent)
        if (
          data["@type"] === "JobPosting" ||
          (Array.isArray(data) && data.some((item) => item["@type"] === "JobPosting"))
        ) {
          structuredData = Array.isArray(data) ? data.find((item) => item["@type"] === "JobPosting") : data
          break
        }
      } catch (e) {
        // Continue to next JSON-LD block
      }
    }
  }

  // Initialize job data
  const jobData: JobPostingData = {
    title: "",
    company: "",
    description: "",
  }

  // Extract from structured data first (most reliable)
  if (structuredData) {
    jobData.title = structuredData.title || ""
    jobData.company = structuredData.hiringOrganization?.name || ""
    jobData.location = structuredData.jobLocation?.address?.addressLocality || ""
    jobData.description = structuredData.description || ""
    jobData.jobType = structuredData.employmentType || ""

    if (structuredData.baseSalary) {
      const salary = structuredData.baseSalary
      if (salary.value) {
        jobData.salaryRange = `${salary.currency || "$"}${salary.value.minValue || salary.value} - ${salary.value.maxValue || salary.value}`
      }
    }
  }

  // Fallback to HTML parsing if structured data is incomplete
  if (!jobData.title) {
    // Try various title selectors
    const titleSelectors = [
      'h1[data-automation="job-detail-title"]', // SEEK
      "h1.jobsearch-JobInfoHeader-title", // Indeed
      ".top-card-layout__title", // LinkedIn
      'h1[data-test="job-title"]', // Various sites
      "h1.job-title",
      ".job-details-jobs-unified-top-card__job-title",
      "h1",
    ]

    for (const selector of titleSelectors) {
      const match = cleanHtml.match(
        new RegExp(
          `<[^>]*class=["'][^"']*${selector.replace(".", "").replace("[", "\\[").replace("]", "\\]")}[^"']*["'][^>]*>([^<]+)`,
          "i",
        ),
      )
      if (match) {
        jobData.title = match[1].trim()
        break
      }
    }

    // Fallback to first h1
    if (!jobData.title) {
      const h1Match = cleanHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i)
      if (h1Match) {
        jobData.title = h1Match[1].trim()
      }
    }
  }

  if (!jobData.company) {
    // Try various company selectors
    const companyPatterns = [
      /company[^>]*>([^<]+)/i,
      /employer[^>]*>([^<]+)/i,
      /"hiringOrganization"[^}]*"name"[^"]*"([^"]+)"/i,
      /data-company="([^"]+)"/i,
    ]

    for (const pattern of companyPatterns) {
      const match = cleanHtml.match(pattern)
      if (match) {
        jobData.company = match[1].trim()
        break
      }
    }
  }

  // Extract description from meta tags or content
  if (!jobData.description) {
    const descriptionPatterns = [
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i,
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i,
      /job-description[^>]*>([\s\S]*?)<\/[^>]*>/i,
      /description[^>]*>([\s\S]*?)<\/[^>]*>/i,
    ]

    for (const pattern of descriptionPatterns) {
      const match = cleanHtml.match(pattern)
      if (match) {
        jobData.description = match[1]
          .replace(/<[^>]*>/g, "")
          .trim()
          .substring(0, 2000)
        break
      }
    }
  }

  // Extract location
  if (!jobData.location) {
    const locationPatterns = [/location[^>]*>([^<]+)/i, /"addressLocality"[^"]*"([^"]+)"/i, /data-location="([^"]+)"/i]

    for (const pattern of locationPatterns) {
      const match = cleanHtml.match(pattern)
      if (match) {
        jobData.location = match[1].trim()
        break
      }
    }
  }

  // Clean up extracted data
  jobData.title = jobData.title.replace(/\s+/g, " ").trim()
  jobData.company = jobData.company.replace(/\s+/g, " ").trim()
  jobData.description = jobData.description.replace(/\s+/g, " ").trim()

  // If we still don't have essential data, try more aggressive extraction
  if (!jobData.title || !jobData.company) {
    // Extract from page title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i)
    if (titleMatch && !jobData.title) {
      const pageTitle = titleMatch[1]
      // Try to extract job title from page title
      const titleParts = pageTitle.split(/[-|–]/)
      if (titleParts.length > 1) {
        jobData.title = titleParts[0].trim()
        if (!jobData.company && titleParts.length > 1) {
          jobData.company = titleParts[1].trim()
        }
      }
    }
  }

  return jobData
}

import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("[v0] Save-job API called")
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    console.log("[v0] Auth check - user:", user?.id, "error:", authError)

    if (authError || !user) {
      console.log("[v0] Authentication failed")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jobData = await request.json()
    console.log("[v0] Received job data:", jobData)

    // Validate required fields
    if (!jobData.url || !jobData.title || !jobData.company) {
      console.log("[v0] Missing required fields:", {
        url: !!jobData.url,
        title: !!jobData.title,
        company: !!jobData.company,
      })
      return NextResponse.json({ error: "Missing required job data" }, { status: 400 })
    }

    if (jobData.url !== "Manual Entry") {
      console.log("[v0] Checking for existing job with URL:", jobData.url)
      const { data: existingJob } = await supabase
        .from("job_postings")
        .select("id")
        .eq("user_id", user.id)
        .eq("url", jobData.url)
        .single()

      if (existingJob) {
        console.log("[v0] Found existing job:", existingJob.id)
        return NextResponse.json({ jobId: existingJob.id })
      }
    } else {
      // For manual entries, check by title and company to avoid exact duplicates
      console.log("[v0] Checking for existing manual job with title and company")
      const { data: existingJob } = await supabase
        .from("job_postings")
        .select("id")
        .eq("user_id", user.id)
        .eq("url", "Manual Entry")
        .eq("title", jobData.title)
        .eq("company", jobData.company)
        .single()

      if (existingJob) {
        console.log("[v0] Found existing manual job:", existingJob.id)
        return NextResponse.json({ jobId: existingJob.id })
      }
    }

    console.log("[v0] Inserting new job posting")
    // Insert new job posting
    const { data: newJob, error: insertError } = await supabase
      .from("job_postings")
      .insert({
        user_id: user.id,
        url: jobData.url,
        title: jobData.title,
        company: jobData.company,
        location: jobData.location || null,
        job_type: jobData.jobType || null,
        salary_range: jobData.salaryRange || null,
        description: jobData.description,
        requirements: jobData.requirements || null,
        benefits: jobData.benefits || null,
        scraped_data: {
          raw_data: jobData,
          scraped_at: new Date().toISOString(),
        },
      })
      .select("id")
      .single()

    if (insertError) {
      console.error("[v0] Insert error:", insertError)
      return NextResponse.json({ error: "Failed to save job posting" }, { status: 500 })
    }

    console.log("[v0] Successfully created job:", newJob.id)
    return NextResponse.json({ jobId: newJob.id })
  } catch (error) {
    console.error("[v0] API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

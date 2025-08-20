import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const jobData = await request.json()

    // Validate required fields
    if (!jobData.url || !jobData.title || !jobData.company) {
      return NextResponse.json({ error: "Missing required job data" }, { status: 400 })
    }

    // Check if job posting already exists for this user
    const { data: existingJob } = await supabase
      .from("job_postings")
      .select("id")
      .eq("user_id", user.id)
      .eq("url", jobData.url)
      .single()

    if (existingJob) {
      return NextResponse.json({ jobId: existingJob.id })
    }

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
      console.error("Error saving job posting:", insertError)
      return NextResponse.json({ error: "Failed to save job posting" }, { status: 500 })
    }

    return NextResponse.json({ jobId: newJob.id })
  } catch (error) {
    console.error("Error in save-job API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

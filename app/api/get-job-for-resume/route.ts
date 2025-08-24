import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const resumeId = searchParams.get("resumeId")

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Get user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: customization, error: customizationError } = await supabase
      .from("resume_customizations")
      .select(`
        job_posting_id,
        job_postings (
          id,
          title,
          company,
          location,
          description,
          job_type,
          salary_range
        )
      `)
      .eq("base_resume_id", resumeId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!customizationError && customization?.job_postings) {
      console.log("[v0] Found job data via resume customization")
      return NextResponse.json({ job: customization.job_postings })
    }

    const { data: recentJob, error: recentJobError } = await supabase
      .from("job_postings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (!recentJobError && recentJob) {
      console.log("[v0] Found job data via most recent job posting")
      return NextResponse.json({ job: recentJob })
    }

    const { data: resume } = await supabase.from("resumes").select("title").eq("id", resumeId).single()

    if (resume?.title) {
      // Extract potential company/position keywords from resume title
      const titleWords = resume.title.toLowerCase().split(/[\s\-_]+/)

      const { data: matchingJobs } = await supabase
        .from("job_postings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (matchingJobs && matchingJobs.length > 0) {
        // Try to find a job that matches keywords in the resume title
        const matchedJob = matchingJobs.find((job) => {
          const jobTitle = job.title?.toLowerCase() || ""
          const company = job.company?.toLowerCase() || ""
          return titleWords.some((word) => word.length > 2 && (jobTitle.includes(word) || company.includes(word)))
        })

        if (matchedJob) {
          console.log("[v0] Found job data via title matching")
          return NextResponse.json({ job: matchedJob })
        }

        // If no match found, return the most recent job as fallback
        console.log("[v0] Using most recent job as fallback")
        return NextResponse.json({ job: matchingJobs[0] })
      }
    }

    console.log("[v0] No job data found for resume")
    return NextResponse.json({ job: null })
  } catch (error) {
    console.error("Error fetching job data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

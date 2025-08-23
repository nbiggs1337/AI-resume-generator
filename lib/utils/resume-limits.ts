import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient } from "@supabase/supabase-js"

export interface ResumeLimit {
  canCreate: boolean
  currentCount: number
  limit: number | null
  accountType: "limited" | "full"
  message?: string
}

export async function checkResumeLimit(userId: string, supabaseClient?: SupabaseClient): Promise<ResumeLimit> {
  const supabase = supabaseClient || createClient()

  try {
    let accountType: "limited" | "full" = "full" // Default to full access
    let limit: number | null = null

    // Try to fetch account type, but gracefully handle missing columns
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("account_type, resume_limit")
      .eq("id", userId)
      .single()

    if (profileError) {
      console.log("[v0] Profile query error (likely missing columns):", profileError.message)
      // If columns don't exist, default to full access
      return {
        canCreate: true,
        currentCount: 0,
        limit: null,
        accountType: "full",
        message: "Account type not configured, unlimited access granted",
      }
    }

    if (profileData) {
      accountType = profileData.account_type as "limited" | "full"
      limit = profileData.resume_limit || 10
    }

    let resumes
    let resumeError

    // First try with deleted_at filter (for soft deletes)
    const { data: resumesWithDeleted, error: deletedError } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", userId)
      .is("deleted_at", null)

    if (deletedError && deletedError.message.includes("deleted_at")) {
      // Column doesn't exist, query without deleted_at filter
      console.log("[v0] deleted_at column doesn't exist, counting all resumes")
      const { data: allResumes, error: allError } = await supabase.from("resumes").select("id").eq("user_id", userId)

      resumes = allResumes
      resumeError = allError
    } else {
      resumes = resumesWithDeleted
      resumeError = deletedError
    }

    if (resumeError) {
      console.error("[v0] Resume count error:", resumeError)
      // Don't block user if we can't count resumes
      return {
        canCreate: true,
        currentCount: 0,
        limit: null,
        accountType: "full",
        message: "Could not verify resume count, access granted",
      }
    }

    const currentCount = resumes?.length || 0

    // Full access users have no limit
    if (accountType === "full") {
      return {
        canCreate: true,
        currentCount,
        limit: null,
        accountType,
      }
    }

    // Limited users check against their limit
    const canCreate = currentCount < limit

    return {
      canCreate,
      currentCount,
      limit,
      accountType,
      message: canCreate
        ? `${currentCount}/${limit} resumes used`
        : `Resume limit reached (${currentCount}/${limit}). Upgrade to create more resumes.`,
    }
  } catch (error) {
    console.error("[v0] Error checking resume limit:", error)
    return {
      canCreate: true,
      currentCount: 0,
      limit: null,
      accountType: "full",
      message: "Error checking resume limit, access granted",
    }
  }
}

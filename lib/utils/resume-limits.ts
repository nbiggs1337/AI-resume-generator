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
    let profile: any = null
    let accountType: "limited" | "full" = "limited"
    let limit = 1

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("account_type, resume_limit")
        .eq("id", userId)
        .single()

      if (data && !error) {
        profile = data
        accountType = data.account_type as "limited" | "full"
        limit = data.resume_limit || 10
      }
    } catch (columnError) {
      console.log("Account type columns not found, defaulting to full access")
      return {
        canCreate: true,
        currentCount: 0,
        limit: null,
        accountType: "full",
        message: "Account type not configured, unlimited access granted",
      }
    }

    // Get current resume count
    const { data: resumes, error: resumeError } = await supabase
      .from("resumes")
      .select("id")
      .eq("user_id", userId)
      .is("deleted_at", null)

    if (resumeError) {
      throw new Error("Could not fetch resume count")
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
    console.error("Error checking resume limit:", error)
    return {
      canCreate: true,
      currentCount: 0,
      limit: null,
      accountType: "full",
      message: "Error checking resume limit, access granted",
    }
  }
}

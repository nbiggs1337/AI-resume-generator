import { createClient } from "@/lib/supabase/client"

export interface ResumeLimit {
  canCreate: boolean
  currentCount: number
  limit: number | null
  accountType: "limited" | "full"
  message?: string
}

export async function checkResumeLimit(userId: string): Promise<ResumeLimit> {
  const supabase = createClient()

  try {
    // Get user's account type and limit
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("account_type, resume_limit")
      .eq("id", userId)
      .single()

    if (profileError || !profile) {
      throw new Error("Could not fetch user profile")
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
    const accountType = profile.account_type as "limited" | "full"
    const limit = profile.resume_limit

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
    const canCreate = currentCount < (limit || 10)

    return {
      canCreate,
      currentCount,
      limit: limit || 10,
      accountType,
      message: canCreate
        ? `${currentCount}/${limit} resumes used`
        : `Resume limit reached (${currentCount}/${limit}). Upgrade to create more resumes.`,
    }
  } catch (error) {
    console.error("Error checking resume limit:", error)
    return {
      canCreate: false,
      currentCount: 0,
      limit: 10,
      accountType: "limited",
      message: "Error checking resume limit",
    }
  }
}

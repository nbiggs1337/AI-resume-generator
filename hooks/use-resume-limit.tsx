"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { checkResumeLimit, type ResumeLimit } from "@/lib/utils/resume-limits"

export function useResumeLimit() {
  const [limitData, setLimitData] = useState<ResumeLimit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const refreshLimits = async () => {
    try {
      setLoading(true)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      const data = await checkResumeLimit(user.id, supabase)
      setLimitData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check resume limit")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshLimits()
  }, [])

  return {
    accountType: limitData?.accountType || "limited",
    resumeCount: limitData?.resumeCount || 0,
    resumeLimit: limitData?.resumeLimit || 10,
    canCreateMore: limitData?.canCreateMore || false,
    limitData,
    loading,
    error,
    refreshLimits, // Changed from refreshLimit to refreshLimits to match usage
  }
}

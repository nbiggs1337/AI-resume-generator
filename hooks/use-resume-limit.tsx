"use client"

import { useState, useEffect } from "react"
import { checkResumeLimit, type ResumeLimit } from "@/lib/utils/resume-limits"

export function useResumeLimit(userId?: string) {
  const [limitData, setLimitData] = useState<ResumeLimit | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshLimit = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const data = await checkResumeLimit(userId)
      setLimitData(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check resume limit")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshLimit()
  }, [userId])

  return {
    limitData,
    loading,
    error,
    refreshLimit,
  }
}

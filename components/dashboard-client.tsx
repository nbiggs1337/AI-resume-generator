"use client"

import { useState, useEffect } from "react"
import { PaywallModal } from "@/components/paywall/paywall-modal"
import { useRouter } from "next/navigation"

interface DashboardClientProps {
  isAtLimit: boolean
  currentCount: number
  limit: number
  accountType: string
}

export default function DashboardClient({ isAtLimit, currentCount, limit, accountType }: DashboardClientProps) {
  const [showPaywall, setShowPaywall] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isAtLimit) {
      setShowPaywall(true)
    }
  }, [isAtLimit])

  const handleClosePaywall = () => {
    setShowPaywall(false)
  }

  const handleUpgrade = () => {
    router.push("/upgrade")
  }

  return (
    <PaywallModal
      isOpen={showPaywall}
      onClose={handleClosePaywall}
      currentCount={currentCount}
      limit={limit}
      onUpgrade={handleUpgrade}
    />
  )
}

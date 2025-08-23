"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

export default function SignOutPage() {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await supabase.auth.signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Sign Out</CardTitle>
          <CardDescription>Are you sure you want to sign out of your account?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleSignOut} disabled={isSigningOut} className="w-full" variant="destructive">
            {isSigningOut ? "Signing out..." : "Sign Out"}
          </Button>
          <Button onClick={() => router.back()} variant="outline" className="w-full">
            Cancel
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Crown, Copy, CheckCircle, Infinity, Zap, Shield, Sparkles, Mail, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useResumeLimit } from "@/hooks/use-resume-limit"
import { copyToClipboard } from "@/utils/copy-to-clipboard"

export default function UpgradePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const [upgrading, setUpgrading] = useState(false)
  const [upgradeSuccess, setUpgradeSuccess] = useState(false)
  const { limitData, refreshLimit } = useResumeLimit(user?.id)

  const bitcoinAddress = "17DDpguvKa6RdXH8QZYVmAvTMtwxsWJtW6"

  const handleStripeUpgrade = async (sessionId: string, userId: string) => {
    try {
      setUpgrading(true)
      console.log("[v0] Processing Stripe upgrade for user:", userId)

      const supabase = createClient()

      const response = await fetch("/api/stripe/verify-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, userId }),
      })

      if (response.ok) {
        const { error } = await supabase
          .from("profiles")
          .update({
            account_type: "full",
            resume_limit: null,
            upgraded_at: new Date().toISOString(),
          })
          .eq("id", userId)

        if (!error) {
          console.log("[v0] Account upgraded successfully")
          setUpgradeSuccess(true)
          await refreshLimit()
        } else {
          console.error("[v0] Error upgrading account:", error)
        }
      }
    } catch (error) {
      console.error("[v0] Error processing upgrade:", error)
    } finally {
      setUpgrading(false)
    }
  }

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      setUser(user)
      setLoading(false)

      const success = searchParams.get("success")
      const sessionId = searchParams.get("session_id")
      const userId = searchParams.get("user_id")

      if (success === "true" && sessionId && userId === user.id) {
        console.log("[v0] Stripe payment success detected, upgrading account")
        handleStripeUpgrade(sessionId, userId)
      }
    }

    getUser()
  }, [router, searchParams])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading upgrade page...</p>
        </div>
      </div>
    )
  }

  if (upgrading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center glass-card p-8 max-w-md">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 glass">
            <Crown className="h-8 w-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">Processing Your Upgrade</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            Your payment was successful! We're upgrading your account to full access...
          </p>
        </div>
      </div>
    )
  }

  if (upgradeSuccess || limitData?.accountType === "full") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <Card className="glass-card border-primary/30 bg-primary/5">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 glass">
                  <Crown className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-foreground mb-4">
                  {upgradeSuccess ? "Upgrade Complete!" : "You're Already Upgraded!"}
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  {upgradeSuccess
                    ? "Thank you for your payment! Your account now has full access with unlimited resume creation."
                    : "Your account has full access with unlimited resume creation."}
                </p>
                <Button onClick={() => router.push("/dashboard")} className="bg-primary hover:bg-primary/90 shadow-lg">
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const progressPercentage = limitData ? (limitData.currentCount / (limitData.limit || 5)) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 glass-button border-0">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 glass">
              <Crown className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">Upgrade to Full Access</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock unlimited resume creation and premium features with a simple Bitcoin payment
            </p>
          </div>

          {limitData && (
            <Card className="glass-card border-white/20 mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Current Usage</CardTitle>
                <CardDescription>Your current plan and usage statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">Resumes Created</span>
                  <Badge variant="secondary" className="glass border-white/20">
                    {limitData.currentCount}/{limitData.limit} used
                  </Badge>
                </div>
                <Progress value={progressPercentage} className="h-3 glass" />
                <p className="text-sm text-muted-foreground">
                  You've used {limitData.currentCount} out of {limitData.limit} free resumes
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="glass-card border-accent/30 bg-accent/5">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif flex items-center gap-2">
                    <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-accent">₿</span>
                    </div>
                    Bitcoin Payment Instructions
                  </CardTitle>
                  <CardDescription className="text-base">
                    Send any amount of Bitcoin to unlock full access instantly
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="glass-card p-4 bg-white/60">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-foreground">Bitcoin Address:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(bitcoinAddress)}
                        className="glass-button h-8 px-2"
                      >
                        {copied ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        <span className="ml-1 text-xs">{copied ? "Copied!" : "Copy"}</span>
                      </Button>
                    </div>
                    <code className="text-sm font-mono break-all text-muted-foreground bg-muted/50 p-2 rounded block">
                      {bitcoinAddress}
                    </code>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">How to Pay:</h3>
                    <div className="space-y-3">
                      {[
                        "Copy the Bitcoin address above",
                        "Send any amount of Bitcoin to this address",
                        "Wait for blockchain confirmation (usually 10-60 minutes)",
                        "Your account will be automatically upgraded",
                      ].map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-xs font-bold text-primary">{index + 1}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass-card p-4 bg-accent/10 border-accent/20">
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium text-foreground mb-2">Important Notes:</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Any amount of Bitcoin will unlock full access</li>
                          <li>• Payments are processed automatically</li>
                          <li>• No account required - just send Bitcoin</li>
                          <li>• Upgrade is permanent and immediate after confirmation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Need Help?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    If you have any issues with your payment or upgrade, please contact our admin team.
                  </p>
                  <Button
                    variant="outline"
                    className="glass-button border-white/30 bg-transparent"
                    onClick={() => router.push("/support")}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-2xl font-serif">What You'll Get</CardTitle>
                  <CardDescription>Compare your current plan with full access</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="glass-card p-4 bg-muted/20 border-muted/30">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-muted/40 rounded-xl flex items-center justify-center">
                        <span className="text-sm font-bold text-muted-foreground">F</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Free Plan</h3>
                        <p className="text-sm text-muted-foreground">Your current plan</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        {limitData?.limit || 5} resume limit
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        Basic templates
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-muted rounded-full"></div>
                        PDF export
                      </li>
                    </ul>
                  </div>

                  <div className="glass-card p-4 bg-primary/5 border-primary/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
                      UPGRADE
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-primary/20 rounded-xl flex items-center justify-center">
                        <Crown className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Full Access</h3>
                        <p className="text-sm text-muted-foreground">Everything you need</p>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2 text-foreground font-medium">
                        <Infinity className="w-4 h-4 text-primary" />
                        Unlimited resumes
                      </li>
                      <li className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        Premium templates
                      </li>
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-primary" />
                        AI optimization
                      </li>
                      <li className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        Priority support
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/20">
                <CardHeader>
                  <CardTitle className="text-lg font-serif">Frequently Asked Questions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-1">How much Bitcoin do I need to send?</h4>
                    <p className="text-sm text-muted-foreground">
                      Any amount will unlock full access. Even the smallest Bitcoin transaction will upgrade your
                      account.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">How long does it take?</h4>
                    <p className="text-sm text-muted-foreground">
                      Your account is upgraded automatically after the Bitcoin transaction is confirmed on the
                      blockchain, usually within 10-60 minutes.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Is this a one-time payment?</h4>
                    <p className="text-sm text-muted-foreground">
                      Yes! Once you upgrade, you have full access forever. No recurring fees or subscriptions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

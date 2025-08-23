"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Crown, Zap, Infinity, Copy, CheckCircle, CreditCard, Loader2 } from "lucide-react"

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  currentCount: number
  limit: number
  onUpgrade?: () => void
}

export function PaywallModal({ isOpen, onClose, currentCount, limit, onUpgrade }: PaywallModalProps) {
  const [copied, setCopied] = useState(false)
  const [stripeLoading, setStripeLoading] = useState(false)
  const bitcoinAddress = "17DDpguvKa6RdXH8QZYVmAvTMtwxsWJtW6"
  const progressPercentage = (currentCount / limit) * 100

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  const handleStripeCheckout = async () => {
    try {
      setStripeLoading(true)
      console.log("[v0] Starting Stripe checkout process")

      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to create checkout session")
      }

      const { url } = await response.json()
      console.log("[v0] Redirecting to Stripe checkout:", url)

      // Redirect to Stripe checkout
      window.location.href = url
    } catch (error) {
      console.error("[v0] Stripe checkout error:", error)
      alert("Failed to start checkout process. Please try again.")
    } finally {
      setStripeLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/30 max-w-7xl w-[95vw] max-h-[85vh] overflow-y-auto p-0 bg-white/95 backdrop-blur-xl shadow-2xl">
        <div className="relative">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-white/30">
            <div className="flex items-center gap-6 max-w-6xl mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Crown className="h-8 w-8 text-red-600" />
              </div>
              <div className="flex-1">
                <DialogHeader>
                  <DialogTitle className="text-3xl font-serif font-bold text-gray-900 mb-2 text-left">
                    Unlock Unlimited Resumes
                  </DialogTitle>
                  <DialogDescription className="text-lg text-gray-700 text-left">
                    You've reached your free resume limit. Upgrade to create unlimited professional resumes.
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="flex-shrink-0">
                <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200 px-4 py-2 text-lg">
                  {currentCount}/{limit} resumes
                </Badge>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-white/30 bg-white/80">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-6">
                <span className="text-lg font-semibold text-gray-900 flex-shrink-0">Current Usage:</span>
                <div className="flex-1">
                  <Progress value={progressPercentage} className="h-3 bg-gray-200" />
                </div>
                <p className="text-sm text-gray-600 flex-shrink-0">
                  {currentCount} of {limit} free resumes used
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white/80">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Free Plan */}
                <Card className="bg-white/90 border-gray-200 shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-serif text-gray-900">Free Plan</CardTitle>
                    <CardDescription className="text-gray-600">What you have now</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-700">{limit} resume limit</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-700">Basic templates</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-700">PDF export</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Premium Plan */}
                <Card className="bg-white/90 border-red-200 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-600 text-white px-3 py-1 text-sm font-semibold">
                    UPGRADE
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-serif flex items-center gap-2 text-gray-900">
                      <Zap className="h-5 w-5 text-red-600" />
                      Full Access
                    </CardTitle>
                    <CardDescription className="text-gray-600">Everything you need</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Infinity className="w-4 h-4 text-red-600" />
                      <span className="font-semibold text-gray-900">Unlimited resumes</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span className="text-gray-700">Premium templates</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span className="text-gray-700">AI optimization</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span className="text-gray-700">Priority support</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-serif font-bold text-gray-900 mb-1">Choose Your Payment Method</h3>
                  <p className="text-gray-600">Select the payment option that works best for you</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Stripe Payment */}
                  <Card className="bg-blue-50 border-blue-200 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-serif flex items-center gap-2 text-gray-900">
                        <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center">
                          <CreditCard className="h-3 w-3 text-blue-800" />
                        </div>
                        Credit Card Payment
                      </CardTitle>
                      <CardDescription className="text-gray-700">Quick and secure checkout with Stripe</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-white border border-blue-200 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-1">$25</div>
                        <div className="text-sm text-gray-600">One-time payment</div>
                      </div>
                      <Button
                        onClick={handleStripeCheckout}
                        disabled={stripeLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2"
                      >
                        {stripeLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay with Card
                          </>
                        )}
                      </Button>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>• Instant activation</p>
                        <p>• Secure payment processing</p>
                        <p>• All major cards accepted</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bitcoin Payment */}
                  <Card className="bg-orange-50 border-orange-200 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg font-serif flex items-center gap-2 text-gray-900">
                        <div className="w-6 h-6 bg-orange-200 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-800">₿</span>
                        </div>
                        Bitcoin Payment
                      </CardTitle>
                      <CardDescription className="text-gray-700">Send Bitcoin to unlock full access</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="bg-white border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-900">Bitcoin Address:</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(bitcoinAddress)}
                            className="bg-white border-gray-300 hover:bg-gray-50 h-7"
                          >
                            {copied ? <CheckCircle className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                          </Button>
                        </div>
                        <code className="text-xs font-mono break-all text-gray-800 bg-gray-100 p-2 rounded block">
                          {bitcoinAddress}
                        </code>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>• Send any amount of Bitcoin</p>
                        <p>• Automatic upgrade after confirmation</p>
                        <p>• Usually takes 10-60 minutes</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-white/30 bg-white/90">
            <div className="max-w-6xl mx-auto flex gap-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-white border-gray-300 hover:bg-gray-50 text-gray-700 py-2"
              >
                Maybe Later
              </Button>
              <Button
                onClick={() => {
                  onUpgrade?.()
                  onClose()
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg py-2"
              >
                <Crown className="h-4 w-4 mr-2" />
                View All Options
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

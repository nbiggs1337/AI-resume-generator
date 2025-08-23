"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Crown, Zap, Infinity, Copy, CheckCircle } from "lucide-react"

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  currentCount: number
  limit: number
  onUpgrade?: () => void
}

export function PaywallModal({ isOpen, onClose, currentCount, limit, onUpgrade }: PaywallModalProps) {
  const [copied, setCopied] = useState(false)
  const bitcoinAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card border-white/20 max-w-2xl p-0 overflow-hidden">
        <div className="relative">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 glass">
              <Crown className="h-8 w-8 text-primary" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-3xl font-serif font-bold text-foreground mb-2">
                Unlock Unlimited Resumes
              </DialogTitle>
              <DialogDescription className="text-lg text-muted-foreground">
                You've reached your free resume limit. Upgrade to create unlimited professional resumes.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Usage indicator */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-foreground">Current Usage</span>
              <Badge variant="secondary" className="glass border-white/20">
                {currentCount}/{limit} resumes
              </Badge>
            </div>
            <Progress value={progressPercentage} className="h-3 glass" />
            <p className="text-xs text-muted-foreground mt-2">
              You've created {currentCount} out of {limit} free resumes
            </p>
          </div>

          {/* Features comparison */}
          <div className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free Plan */}
              <Card className="glass-card border-white/20 relative">
                <CardHeader>
                  <CardTitle className="text-lg font-serif">Free Plan</CardTitle>
                  <CardDescription>What you have now</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-muted rounded-full"></div>
                    <span>{limit} resume limit</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-muted rounded-full"></div>
                    <span>Basic templates</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-muted rounded-full"></div>
                    <span>PDF export</span>
                  </div>
                </CardContent>
              </Card>

              {/* Premium Plan */}
              <Card className="glass-card border-primary/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium">
                  UPGRADE
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Full Access
                  </CardTitle>
                  <CardDescription>Everything you need</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Infinity className="w-4 h-4 text-primary" />
                    <span className="font-medium">Unlimited resumes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Premium templates</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>AI optimization</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span>Priority support</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bitcoin payment section */}
            <Card className="glass-card border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-accent">₿</span>
                  </div>
                  Bitcoin Payment Required
                </CardTitle>
                <CardDescription>Send Bitcoin to unlock full access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="glass-card p-4 bg-white/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Bitcoin Address:</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bitcoinAddress)}
                      className="glass-button h-8 px-2"
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                  <code className="text-xs font-mono break-all text-muted-foreground">{bitcoinAddress}</code>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Send any amount of Bitcoin to the address above</p>
                  <p>• Your account will be upgraded automatically after confirmation</p>
                  <p>• Contact admin if you need assistance</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action buttons */}
          <div className="p-6 border-t border-white/20 flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1 glass-button bg-transparent border-white/30">
              Maybe Later
            </Button>
            <Button
              onClick={() => {
                onUpgrade?.()
                onClose()
              }}
              className="flex-1 bg-primary hover:bg-primary/90 shadow-lg depth-2"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

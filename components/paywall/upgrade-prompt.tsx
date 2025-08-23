"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Crown, X, Sparkles, Zap } from "lucide-react"

interface UpgradePromptProps {
  currentCount: number
  limit: number
  onUpgrade?: () => void
  onDismiss?: () => void
  variant?: "subtle" | "prominent"
}

export function UpgradePrompt({ currentCount, limit, onUpgrade, onDismiss, variant = "subtle" }: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  if (variant === "prominent") {
    return (
      <Card className="glass-card border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16"></div>
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center glass">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-serif">Ready for More?</CardTitle>
                <CardDescription className="text-base">
                  You've created {currentCount} resumes. Unlock unlimited potential!
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="glass-button h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-3 bg-white/60">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Unlimited Resumes</span>
              </div>
              <p className="text-xs text-muted-foreground">Create as many as you need</p>
            </div>
            <div className="glass-card p-3 bg-white/60">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Premium Features</span>
              </div>
              <p className="text-xs text-muted-foreground">Advanced templates & AI</p>
            </div>
          </div>
          <Button onClick={onUpgrade} className="w-full bg-primary hover:bg-primary/90 shadow-lg depth-2">
            <Crown className="h-4 w-4 mr-2" />
            Upgrade to Full Access
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-accent/30 bg-accent/5">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center glass">
            <Crown className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-foreground">Almost at your limit!</h3>
              <Badge variant="secondary" className="glass border-white/20 text-xs">
                {currentCount}/{limit}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Upgrade now to create unlimited resumes and unlock premium features.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleDismiss} className="glass-button">
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={onUpgrade} className="bg-primary hover:bg-primary/90 shadow-lg">
              Upgrade
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, AlertTriangle } from "lucide-react"

interface UsageIndicatorProps {
  currentCount: number
  limit: number | null
  accountType: "limited" | "full"
  onUpgrade?: () => void
}

export function UsageIndicator({ currentCount, limit, accountType, onUpgrade }: UsageIndicatorProps) {
  if (accountType === "full") {
    return (
      <Card className="glass-card border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center glass">
              <Crown className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-foreground">Full Access</h3>
                <Badge variant="secondary" className="glass border-white/20 text-xs">
                  UNLIMITED
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{currentCount} resumes created • No limits</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const progressPercentage = limit ? (currentCount / limit) * 100 : 0
  const isNearLimit = limit && currentCount >= limit * 0.8
  const isAtLimit = limit && currentCount >= limit

  return (
    <Card className={`glass-card border-white/20 ${isAtLimit ? "border-destructive/30 bg-destructive/5" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-serif">Resume Usage</CardTitle>
          <Badge
            variant={isAtLimit ? "destructive" : isNearLimit ? "secondary" : "outline"}
            className="glass border-white/20"
          >
            {currentCount}/{limit} used
          </Badge>
        </div>
        <CardDescription>
          {isAtLimit
            ? "You've reached your free resume limit"
            : isNearLimit
              ? "You're approaching your limit"
              : "Track your resume creation progress"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress
            value={progressPercentage}
            className={`h-2 glass ${isAtLimit ? "bg-destructive/20" : isNearLimit ? "bg-accent/20" : ""}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{currentCount} created</span>
            <span>{limit ? limit - currentCount : 0} remaining</span>
          </div>
        </div>

        {(isNearLimit || isAtLimit) && (
          <div className="flex items-start gap-3 p-3 glass-card bg-accent/5 border-accent/20">
            <AlertTriangle className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <div className="space-y-2 flex-1">
              <p className="text-sm text-foreground font-medium">
                {isAtLimit ? "Upgrade to continue creating resumes" : "Consider upgrading soon"}
              </p>
              <Button size="sm" onClick={onUpgrade} className="bg-primary hover:bg-primary/90 shadow-lg text-xs h-8">
                <Crown className="h-3 w-3 mr-1" />
                Upgrade Now
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

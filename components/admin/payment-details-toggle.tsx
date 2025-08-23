"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronDown, ChevronUp, CreditCard, Bitcoin, Info } from "lucide-react"

interface PaymentDetailsToggleProps {
  user: {
    id: string
    account_type: string
    payment_method: string | null
    stripe_customer_id: string | null
    payment_reference: string | null
    upgraded_at: string | null
  }
}

export function PaymentDetailsToggle({ user }: PaymentDetailsToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (user.account_type !== "full") {
    return <div className="text-xs text-muted-foreground">Free account</div>
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {user.payment_method === "stripe" ? (
          <>
            <CreditCard className="h-3 w-3 text-blue-600" />
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Stripe
            </Badge>
          </>
        ) : user.payment_method === "bitcoin" ? (
          <>
            <Bitcoin className="h-3 w-3 text-orange-600" />
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              Bitcoin
            </Badge>
          </>
        ) : (
          <>
            <Info className="h-3 w-3 text-gray-600" />
            <Badge variant="outline" className="text-xs glass border-white/30">
              {user.payment_method || "Unknown"}
            </Badge>
          </>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-6 w-6 p-0 hover:bg-white/20"
        >
          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {user.upgraded_at && (
        <div className="text-xs text-muted-foreground">Upgraded: {new Date(user.upgraded_at).toLocaleDateString()}</div>
      )}

      {isExpanded && (
        <Card className="glass-card border-white/20 mt-2">
          <CardContent className="p-3 space-y-2">
            <div className="text-xs font-medium text-foreground">Transaction Details</div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-mono">{user.payment_method || "Not set"}</span>
              </div>

              {user.stripe_customer_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Stripe Customer:</span>
                  <span className="font-mono">{user.stripe_customer_id}</span>
                </div>
              )}

              {user.payment_reference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Reference:</span>
                  <span className="font-mono">{user.payment_reference}</span>
                </div>
              )}

              {user.upgraded_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Upgrade Date:</span>
                  <span>{new Date(user.upgraded_at).toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-mono text-xs">{user.id.substring(0, 8)}...</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

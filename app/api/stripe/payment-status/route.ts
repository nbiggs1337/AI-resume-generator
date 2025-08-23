import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile with payment info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("account_type, payment_method, upgraded_at, stripe_customer_id")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    return NextResponse.json({
      accountType: profile.account_type,
      paymentMethod: profile.payment_method,
      upgradedAt: profile.upgraded_at,
      hasStripeCustomer: !!profile.stripe_customer_id,
    })
  } catch (error) {
    console.error("[v0] Payment status error:", error)
    return NextResponse.json({ error: "Failed to get payment status" }, { status: 500 })
  }
}

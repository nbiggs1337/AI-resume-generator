import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      console.log("[v0] Stripe success: No session ID provided")
      return NextResponse.redirect(new URL("/upgrade?error=no_session", request.url))
    }

    console.log("[v0] Stripe success: Processing session", sessionId)

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      console.log("[v0] Stripe success: Payment not completed")
      return NextResponse.redirect(new URL("/upgrade?error=payment_failed", request.url))
    }

    const supabaseUserId = session.metadata?.supabase_user_id

    if (!supabaseUserId) {
      console.log("[v0] Stripe success: No user ID in session metadata")
      return NextResponse.redirect(new URL("/upgrade?error=invalid_session", request.url))
    }

    console.log("[v0] Stripe success: Upgrading user account", supabaseUserId)

    // Update user account to full access
    const supabase = createClient()
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        account_type: "full",
        resume_limit: null,
        payment_method: "stripe",
        upgraded_at: new Date().toISOString(),
      })
      .eq("id", supabaseUserId)

    if (updateError) {
      console.error("[v0] Stripe success: Failed to upgrade user account", updateError)
      return NextResponse.redirect(new URL("/upgrade?error=upgrade_failed", request.url))
    }

    console.log("[v0] Stripe success: User account upgraded successfully")

    // Redirect to dashboard with success message
    return NextResponse.redirect(new URL("/dashboard?upgraded=true", request.url))
  } catch (error) {
    console.error("[v0] Stripe success error:", error)
    return NextResponse.redirect(new URL("/upgrade?error=processing_failed", request.url))
  }
}

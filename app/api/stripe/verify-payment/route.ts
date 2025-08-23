import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Stripe payment verification started")

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 })
    }

    const { stripe } = await import("@/lib/stripe/server")
    const { sessionId, userId } = await request.json()

    if (!sessionId || !userId) {
      return NextResponse.json({ error: "Missing session ID or user ID" }, { status: 400 })
    }

    // Verify the session with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 })
    }

    if (session.metadata?.supabase_user_id !== userId) {
      return NextResponse.json({ error: "User ID mismatch" }, { status: 400 })
    }

    console.log("[v0] Payment verified successfully for user:", userId)

    return NextResponse.json({
      success: true,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total,
    })
  } catch (error) {
    console.error("[v0] Payment verification error:", error)
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Stripe checkout session creation started")

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("[v0] STRIPE_SECRET_KEY not found in environment")
      return NextResponse.json({ error: "Stripe configuration error" }, { status: 500 })
    }

    const { stripe } = await import("@/lib/stripe/server")
    console.log("[v0] Stripe module imported successfully")

    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.log("[v0] Stripe checkout: User not authenticated")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Stripe checkout: User authenticated", user.id)

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError || !profile) {
      console.log("[v0] Stripe checkout: Could not fetch user profile")
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Check if user already has full access
    if (profile.account_type === "full") {
      console.log("[v0] Stripe checkout: User already has full access")
      return NextResponse.json({ error: "User already has full access" }, { status: 400 })
    }

    console.log("[v0] Stripe checkout: Creating checkout session for user", user.id)

    // Create or retrieve Stripe customer
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      console.log("[v0] Stripe checkout: Creating new Stripe customer")
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      })
      customerId = customer.id

      // Update profile with Stripe customer ID
      await supabase.from("profiles").update({ stripe_customer_id: customerId }).eq("id", user.id)

      console.log("[v0] Stripe checkout: Created Stripe customer", customerId)
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Resume Builder - Full Access Upgrade",
              description: "Unlock unlimited resume creation and premium features",
            },
            unit_amount: 2500, // $25.00 in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.nextUrl.origin}/upgrade?success=true&session_id={CHECKOUT_SESSION_ID}&user_id=${user.id}`,
      cancel_url: `${request.nextUrl.origin}/upgrade?canceled=true`,
      metadata: {
        supabase_user_id: user.id,
      },
    })

    console.log("[v0] Stripe checkout: Session created", session.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error("[v0] Stripe checkout error:", error)
    if (error instanceof Error) {
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error stack:", error.stack)
    }
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}

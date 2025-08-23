import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe/server"
import { createClient } from "@/lib/supabase/server"
import type Stripe from "stripe"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      console.log("[v0] Stripe webhook: No signature provided")
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error("[v0] Stripe webhook: No webhook secret configured")
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error("[v0] Stripe webhook signature verification failed:", err)
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    console.log("[v0] Stripe webhook received:", event.type, event.id)

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case "payment_intent.succeeded":
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent)
        break

      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case "customer.created":
        console.log("[v0] Stripe webhook: Customer created", event.data.object.id)
        break

      default:
        console.log("[v0] Stripe webhook: Unhandled event type", event.type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[v0] Stripe webhook error:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log("[v0] Stripe webhook: Processing checkout session completed", session.id)

    const supabaseUserId = session.metadata?.supabase_user_id

    if (!supabaseUserId) {
      console.error("[v0] Stripe webhook: No user ID in session metadata")
      return
    }

    if (session.payment_status !== "paid") {
      console.log("[v0] Stripe webhook: Payment not completed for session", session.id)
      return
    }

    console.log("[v0] Stripe webhook: Upgrading user account", supabaseUserId)

    const supabase = createClient()

    // Update user account to full access
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
      console.error("[v0] Stripe webhook: Failed to upgrade user account", updateError)
      return
    }

    console.log("[v0] Stripe webhook: User account upgraded successfully via webhook")
  } catch (error) {
    console.error("[v0] Stripe webhook: Error handling checkout session completed", error)
  }
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log("[v0] Stripe webhook: Payment intent succeeded", paymentIntent.id)

    // Additional processing if needed
    // This is mainly for logging and monitoring
    const customerId = paymentIntent.customer as string
    if (customerId) {
      console.log("[v0] Stripe webhook: Payment succeeded for customer", customerId)
    }
  } catch (error) {
    console.error("[v0] Stripe webhook: Error handling payment intent succeeded", error)
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log("[v0] Stripe webhook: Payment intent failed", paymentIntent.id)

    // Log the failure for monitoring
    const customerId = paymentIntent.customer as string
    const lastPaymentError = paymentIntent.last_payment_error

    console.error("[v0] Stripe webhook: Payment failed for customer", customerId, {
      error: lastPaymentError?.message,
      code: lastPaymentError?.code,
      type: lastPaymentError?.type,
    })

    // Could potentially send notification to user or admin here
  } catch (error) {
    console.error("[v0] Stripe webhook: Error handling payment intent failed", error)
  }
}

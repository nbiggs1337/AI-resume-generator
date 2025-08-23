import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  console.error("[v0] STRIPE_SECRET_KEY environment variable is not set")
  throw new Error("STRIPE_SECRET_KEY environment variable is required")
}

console.log("[v0] Stripe server initializing with key:", process.env.STRIPE_SECRET_KEY ? "✓ Present" : "✗ Missing")

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-12-18.acacia",
  typescript: true,
})

console.log("[v0] Stripe server initialized successfully")

export { stripe }

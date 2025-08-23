import { createClient } from "@/lib/supabase/server"

export async function upgradeUserAccount(userId: string, paymentMethod: "stripe" | "bitcoin" = "stripe") {
  try {
    console.log("[v0] Upgrading user account:", userId, "via", paymentMethod)

    const supabase = createClient()

    const { error } = await supabase
      .from("profiles")
      .update({
        account_type: "full",
        resume_limit: null,
        payment_method: paymentMethod,
        upgraded_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) {
      console.error("[v0] Failed to upgrade user account:", error)
      throw error
    }

    console.log("[v0] User account upgraded successfully:", userId)
    return true
  } catch (error) {
    console.error("[v0] Error upgrading user account:", error)
    throw error
  }
}

export async function logPaymentEvent(
  eventType: string,
  userId?: string,
  paymentId?: string,
  details?: Record<string, any>,
) {
  try {
    console.log("[v0] Payment event:", {
      type: eventType,
      userId,
      paymentId,
      details,
      timestamp: new Date().toISOString(),
    })

    // Could store payment events in database for audit trail
    // const supabase = createClient()
    // await supabase.from("payment_events").insert({
    //   event_type: eventType,
    //   user_id: userId,
    //   payment_id: paymentId,
    //   details,
    //   created_at: new Date().toISOString(),
    // })
  } catch (error) {
    console.error("[v0] Error logging payment event:", error)
  }
}

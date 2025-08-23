import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("is_admin, is_banned")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    redirect("/auth/login")
  }

  if (profile.is_banned) {
    redirect("/auth/banned")
  }

  if (!profile.is_admin) {
    redirect("/dashboard")
  }

  return { user, profile }
}

export async function checkAdminStatus(userId: string) {
  const supabase = await createClient()

  const { data: profile } = await supabase.from("profiles").select("is_admin, is_banned").eq("id", userId).single()

  return {
    isAdmin: profile?.is_admin || false,
    isBanned: profile?.is_banned || false,
  }
}

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import DashboardClient from "@/components/dashboard-client"
import { Brain, Settings, LogOut, HelpCircle } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Get user's resumes
  const { data: resumes } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  // Get user's job postings
  const { data: jobPostings } = await supabase
    .from("job_postings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent customizations
  const { data: customizations } = await supabase
    .from("resume_customizations")
    .select(`
      *,
      resumes(title),
      job_postings(title, company)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  // Calculate stats
  const totalResumes = resumes?.length || 0
  const totalJobPostings = jobPostings?.length || 0
  const totalCustomizations = customizations?.length || 0
  const recentCustomizations =
    customizations?.filter((c) => new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0

  const isAtLimit = profile?.account_type === "limited" && totalResumes >= (profile?.resume_limit || 10)

  const hasResumes = totalResumes > 0
  const hasJobPostings = totalJobPostings > 0
  const hasCustomizations = totalCustomizations > 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100">
      <header className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-serif font-bold text-foreground">ResumeAI</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {profile?.full_name || user.email}</span>
            <Link href="/support">
              <Button variant="ghost" size="sm" className="glass-button border-0">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" size="sm" className="glass-button border-0">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit" className="glass-button border-0">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <DashboardClient
        isAtLimit={isAtLimit}
        currentCount={totalResumes}
        limit={profile?.resume_limit || 10}
        accountType={profile?.account_type || "limited"}
        resumes={resumes || []}
        jobPostings={jobPostings || []}
        customizations={customizations || []}
        totalResumes={totalResumes}
        totalJobPostings={totalJobPostings}
        totalCustomizations={totalCustomizations}
        recentCustomizations={recentCustomizations}
        profile={profile}
        user={user}
        hasResumes={hasResumes}
        hasJobPostings={hasJobPostings}
        hasCustomizations={hasCustomizations}
      />
    </div>
  )
}

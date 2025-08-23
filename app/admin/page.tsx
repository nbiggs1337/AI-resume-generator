import { requireAdmin } from "@/lib/auth/admin"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, FileText, UserCheck, UserX, Activity, MessageSquare } from "lucide-react"

export default async function AdminDashboard() {
  await requireAdmin()

  const supabase = await createClient()

  // Fetch statistics
  const [
    { count: totalUsers },
    { count: totalResumes },
    { count: activeUsers },
    { count: bannedUsers },
    { count: totalSupportRequests },
    { count: openSupportRequests },
    { data: recentUsers },
    { data: recentResumes },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("resumes").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", false),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", true),
    supabase.from("support_requests").select("*", { count: "exact", head: true }),
    supabase.from("support_requests").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase
      .from("profiles")
      .select("id, full_name, email, created_at, is_admin, is_banned")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("resumes")
      .select("id, title, created_at, profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100">
      <header className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-serif font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage users and resumes</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" className="glass-button border-white/30 bg-transparent">
              <Link href="/dashboard">Back to App</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 glass border-r border-white/20">
          <nav className="p-4 space-y-2">
            <div className="px-3 py-2">
              <h2 className="text-lg font-serif font-semibold text-foreground">Navigation</h2>
            </div>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground shadow-lg"
            >
              <Activity className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-primary/10 transition-all duration-200 glass-hover"
            >
              <Users className="h-4 w-4" />
              User Management
            </Link>
            <Link
              href="/admin/resumes"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-primary/10 transition-all duration-200 glass-hover"
            >
              <FileText className="h-4 w-4" />
              Resume Management
            </Link>
            <Link
              href="/admin/requests"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-foreground hover:bg-primary/10 transition-all duration-200 glass-hover"
            >
              <MessageSquare className="h-4 w-4" />
              Support Requests
              {openSupportRequests && openSupportRequests > 0 && (
                <Badge variant="destructive" className="ml-auto text-xs">
                  {openSupportRequests}
                </Badge>
              )}
            </Link>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="glass-card border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total Users</CardTitle>
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center glass">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Registered accounts</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Total Resumes</CardTitle>
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center glass">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{totalResumes || 0}</div>
                <p className="text-xs text-muted-foreground">Created resumes</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Active Users</CardTitle>
                <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center glass">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Non-banned users</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Banned Users</CardTitle>
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center glass">
                  <UserX className="h-5 w-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">{bannedUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Suspended accounts</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Support Requests</CardTitle>
                <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center glass">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{totalSupportRequests || 0}</div>
                <p className="text-xs text-muted-foreground">{openSupportRequests || 0} open requests</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-foreground">Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 glass rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{user.full_name || "No name"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.is_admin && (
                          <Badge variant="secondary" className="glass border-white/20">
                            Admin
                          </Badge>
                        )}
                        {user.is_banned && <Badge variant="destructive">Banned</Badge>}
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full glass-button border-white/30 bg-transparent">
                    <Link href="/admin/users">View All Users</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="text-xl font-serif text-foreground">Recent Resumes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentResumes?.map((resume) => (
                    <div key={resume.id} className="flex items-center justify-between p-3 glass rounded-lg">
                      <div>
                        <p className="font-medium text-foreground">{resume.title}</p>
                        <p className="text-sm text-muted-foreground">
                          by {resume.profiles?.full_name || resume.profiles?.email || "Unknown"}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(resume.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full glass-button border-white/30 bg-transparent">
                    <Link href="/admin/resumes">View All Resumes</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}

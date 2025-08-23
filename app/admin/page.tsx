import { requireAdmin } from "@/lib/auth/admin"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Users, FileText, UserCheck, UserX, Activity } from "lucide-react"

export default async function AdminDashboard() {
  await requireAdmin()

  const supabase = await createClient()

  // Fetch statistics
  const [
    { count: totalUsers },
    { count: totalResumes },
    { count: activeUsers },
    { count: bannedUsers },
    { data: recentUsers },
    { data: recentResumes },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("resumes").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", false),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_banned", true),
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage users and resumes</p>
          </div>
          <div className="flex items-center gap-4">
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to App</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-sidebar-border bg-sidebar">
          <nav className="p-4 space-y-2">
            <div className="px-3 py-2">
              <h2 className="text-lg font-semibold text-sidebar-foreground">Navigation</h2>
            </div>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2 rounded-md bg-sidebar-accent text-sidebar-accent-foreground"
            >
              <Activity className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
            >
              <Users className="h-4 w-4" />
              User Management
            </Link>
            <Link
              href="/admin/resumes"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
            >
              <FileText className="h-4 w-4" />
              Resume Management
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{totalUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Registered accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Total Resumes</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{totalResumes || 0}</div>
                <p className="text-xs text-muted-foreground">Created resumes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Active Users</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-card-foreground">{activeUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Non-banned users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-card-foreground">Banned Users</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{bannedUsers || 0}</div>
                <p className="text-xs text-muted-foreground">Suspended accounts</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentUsers?.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-card-foreground">{user.full_name || "No name"}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.is_admin && <Badge variant="secondary">Admin</Badge>}
                        {user.is_banned && <Badge variant="destructive">Banned</Badge>}
                        <p className="text-xs text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full bg-transparent">
                    <Link href="/admin/users">View All Users</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Resumes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-card-foreground">Recent Resumes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentResumes?.map((resume) => (
                    <div key={resume.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-card-foreground">{resume.title}</p>
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
                  <Button asChild variant="outline" className="w-full bg-transparent">
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

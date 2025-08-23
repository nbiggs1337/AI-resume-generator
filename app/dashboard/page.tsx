import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import DashboardClient from "@/components/dashboard-client"
import {
  Plus,
  FileText,
  Brain,
  Settings,
  LogOut,
  BarChart3,
  Briefcase,
  Sparkles,
  Download,
  Eye,
  Edit,
  HelpCircle,
} from "lucide-react"

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100">
      <DashboardClient
        isAtLimit={isAtLimit}
        currentCount={totalResumes}
        limit={profile?.resume_limit || 10}
        accountType={profile?.account_type || "limited"}
      />

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

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-3">Your Resume Dashboard</h2>
          <p className="text-xl text-muted-foreground">
            Create, customize, and manage your professional resumes with AI-powered optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-white/20 bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary text-sm font-medium">Total Resumes</p>
                  <p className="text-3xl font-bold text-foreground">{totalResumes}</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center glass">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20 bg-gradient-to-br from-green-500/10 to-green-400/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Job Postings</p>
                  <p className="text-3xl font-bold text-foreground">{totalJobPostings}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center glass">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20 bg-gradient-to-br from-purple-500/10 to-purple-400/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">AI Customizations</p>
                  <p className="text-3xl font-bold text-foreground">{totalCustomizations}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center glass">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-white/20 bg-gradient-to-br from-orange-500/10 to-orange-400/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">This Week</p>
                  <p className="text-3xl font-bold text-foreground">{recentCustomizations}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center glass">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="resumes" className="space-y-6">
          <TabsList className="glass border-white/20 bg-white/40 p-1">
            <TabsTrigger
              value="resumes"
              className="glass-button data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-red-600"
            >
              Resumes
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="glass-button data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-red-600"
            >
              Job Postings
            </TabsTrigger>
            <TabsTrigger
              value="customizations"
              className="glass-button data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-red-600"
            >
              AI Customizations
            </TabsTrigger>
            <TabsTrigger
              value="actions"
              className="glass-button data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:border-red-600"
            >
              Quick Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-serif font-bold text-foreground">Your Resumes</h3>
              <Link href="/builder">
                <Button className="bg-primary hover:bg-primary/90 shadow-lg depth-2">
                  <Plus className="h-4 w-4 mr-2" />
                  New Resume
                </Button>
              </Link>
            </div>

            {resumes && resumes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className="glass-card border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center glass">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-serif">{resume.title}</CardTitle>
                            <CardDescription>
                              Updated {new Date(resume.updated_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {resume.is_customized && (
                            <Badge variant="secondary" className="text-xs glass border-white/20">
                              AI Customized
                            </Badge>
                          )}
                          {resume.is_default && (
                            <Badge variant="outline" className="text-xs glass border-white/30">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap justify-start">
                        <Link href={`/resume/${resume.id}`}>
                          <Button variant="outline" size="sm" className="glass-button border-white/30 bg-transparent">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/builder?edit=${resume.id}`}>
                          <Button variant="outline" size="sm" className="glass-button border-white/30 bg-transparent">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm" className="glass-button border-white/30 bg-transparent">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card border-white/20 text-center py-16">
                <CardContent>
                  <div className="w-20 h-20 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl font-serif mb-3">No resumes yet</CardTitle>
                  <CardDescription className="mb-8 text-lg">
                    Create your first resume to get started with AI-powered job matching
                  </CardDescription>
                  <Link href="/builder">
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Resume
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-serif font-bold text-foreground">Analyzed Job Postings</h3>
              <Link href="/job-analyzer">
                <Button className="bg-green-600 hover:bg-green-700 shadow-lg depth-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Analyze New Job
                </Button>
              </Link>
            </div>

            {jobPostings && jobPostings.length > 0 ? (
              <div className="space-y-4">
                {jobPostings.map((job) => (
                  <Card key={job.id} className="glass-card border-white/20 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1 text-lg">{job.title}</h4>
                          <p className="text-primary font-medium mb-2">{job.company}</p>
                          <p className="text-sm text-muted-foreground mb-3">{job.location}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs glass border-white/30">
                              {new Date(job.created_at).toLocaleDateString()}
                            </Badge>
                            {job.salary_range && (
                              <Badge variant="secondary" className="text-xs glass border-white/20">
                                {job.salary_range}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/job-analyzer/${job.id}`}>
                            <Button variant="outline" size="sm" className="glass-button border-white/30 bg-transparent">
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/customize-resume?jobId=${job.id}`}>
                            <Button variant="outline" size="sm" className="glass-button border-white/30 bg-transparent">
                              Customize Resume
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card border-white/20 text-center py-16">
                <CardContent>
                  <div className="w-20 h-20 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass">
                    <Briefcase className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl font-serif mb-3">No job postings analyzed</CardTitle>
                  <CardDescription className="mb-8 text-lg">
                    Start by analyzing job postings to get AI-powered resume customizations
                  </CardDescription>
                  <Link href="/job-analyzer">
                    <Button className="bg-green-600 hover:bg-green-700 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Analyze Your First Job
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="customizations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-serif font-bold text-foreground">AI Customizations</h3>
              <Badge variant="secondary" className="text-sm glass border-white/20">
                {totalCustomizations} total
              </Badge>
            </div>

            {customizations && customizations.length > 0 ? (
              <div className="space-y-4">
                {customizations.map((customization) => (
                  <Card
                    key={customization.id}
                    className="glass-card border-white/20 hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            <h4 className="font-semibold text-foreground text-lg">
                              {customization.resumes?.title} → {customization.job_postings?.title}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Customized for {customization.job_postings?.company}
                          </p>
                          <div className="flex gap-2">
                            <Badge
                              variant={customization.status === "applied" ? "default" : "secondary"}
                              className="text-xs glass border-white/20"
                            >
                              {customization.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs glass border-white/30">
                              {new Date(customization.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/customize/${customization.base_resume_id}/${customization.job_posting_id}`}>
                            <Button variant="outline" size="sm" className="glass-button border-white/30 bg-transparent">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card border-white/20 text-center py-16">
                <CardContent>
                  <div className="w-20 h-20 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass">
                    <Sparkles className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl font-serif mb-3">No AI customizations yet</CardTitle>
                  <CardDescription className="mb-8 text-lg">
                    Analyze job postings and customize your resumes with AI to get started
                  </CardDescription>
                  <Link href="/job-analyzer">
                    <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start AI Customization
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <h3 className="text-3xl font-serif font-bold text-foreground">Quick Actions</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/builder">
                <Card className="glass-card border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-dashed border-2 border-primary/30 hover:border-primary/60">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 glass">
                      <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-serif">Create New Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      Start building a new professional resume from scratch
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/job-analyzer">
                <Card className="glass-card border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 glass">
                      <Brain className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-xl font-serif">Analyze Job Posting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      Paste a job URL to get AI-customized resume recommendations
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/profile">
                <Card className="glass-card border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4 glass">
                      <Settings className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-xl font-serif">Profile Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      Update your personal information and preferences
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

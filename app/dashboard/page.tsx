import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-serif font-bold text-slate-900">ResumeAI</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {profile?.full_name || user.email}</span>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <form action="/auth/signout" method="post">
              <Button variant="ghost" size="sm" type="submit">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-serif font-bold text-slate-900 mb-2">Your Resume Dashboard</h2>
          <p className="text-slate-600">
            Create, customize, and manage your professional resumes with AI-powered optimization.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Total Resumes</p>
                  <p className="text-2xl font-bold text-blue-900">{totalResumes}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Job Postings</p>
                  <p className="text-2xl font-bold text-green-900">{totalJobPostings}</p>
                </div>
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">AI Customizations</p>
                  <p className="text-2xl font-bold text-purple-900">{totalCustomizations}</p>
                </div>
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">This Week</p>
                  <p className="text-2xl font-bold text-orange-900">{recentCustomizations}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="resumes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="resumes">Resumes</TabsTrigger>
            <TabsTrigger value="jobs">Job Postings</TabsTrigger>
            <TabsTrigger value="customizations">AI Customizations</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          </TabsList>

          {/* Resumes Tab */}
          <TabsContent value="resumes" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-slate-900">Your Resumes</h3>
              <Link href="/builder">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  New Resume
                </Button>
              </Link>
            </div>

            {resumes && resumes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <Card key={resume.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
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
                            <Badge variant="secondary" className="text-xs">
                              AI Customized
                            </Badge>
                          )}
                          {resume.is_default && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Link href={`/resume/${resume.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/builder?edit=${resume.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-slate-400" />
                  </div>
                  <CardTitle className="text-xl font-serif mb-2">No resumes yet</CardTitle>
                  <CardDescription className="mb-6">
                    Create your first resume to get started with AI-powered job matching
                  </CardDescription>
                  <Link href="/builder">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Resume
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Job Postings Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-slate-900">Analyzed Job Postings</h3>
              <Link href="/job-analyzer">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Analyze New Job
                </Button>
              </Link>
            </div>

            {jobPostings && jobPostings.length > 0 ? (
              <div className="space-y-4">
                {jobPostings.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900 mb-1">{job.title}</h4>
                          <p className="text-blue-600 font-medium mb-2">{job.company}</p>
                          <p className="text-sm text-slate-600 mb-3">{job.location}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {new Date(job.created_at).toLocaleDateString()}
                            </Badge>
                            {job.salary_range && (
                              <Badge variant="secondary" className="text-xs">
                                {job.salary_range}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/job-analyzer/${job.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/customize-resume?jobId=${job.id}`}>
                            <Button variant="outline" size="sm">
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
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="h-8 w-8 text-slate-400" />
                  </div>
                  <CardTitle className="text-xl font-serif mb-2">No job postings analyzed</CardTitle>
                  <CardDescription className="mb-6">
                    Start by analyzing job postings to get AI-powered resume customizations
                  </CardDescription>
                  <Link href="/job-analyzer">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Analyze Your First Job
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Customizations Tab */}
          <TabsContent value="customizations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-serif font-bold text-slate-900">AI Customizations</h3>
              <Badge variant="secondary" className="text-sm">
                {totalCustomizations} total
              </Badge>
            </div>

            {customizations && customizations.length > 0 ? (
              <div className="space-y-4">
                {customizations.map((customization) => (
                  <Card key={customization.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-purple-600" />
                            <h4 className="font-semibold text-slate-900">
                              {customization.resumes?.title} → {customization.job_postings?.title}
                            </h4>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">
                            Customized for {customization.job_postings?.company}
                          </p>
                          <div className="flex gap-2">
                            <Badge
                              variant={customization.status === "applied" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {customization.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {new Date(customization.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/customize/${customization.base_resume_id}/${customization.job_posting_id}`}>
                            <Button variant="outline" size="sm">
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
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-8 w-8 text-slate-400" />
                  </div>
                  <CardTitle className="text-xl font-serif mb-2">No AI customizations yet</CardTitle>
                  <CardDescription className="mb-6">
                    Analyze job postings and customize your resumes with AI to get started
                  </CardDescription>
                  <Link href="/job-analyzer">
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start AI Customization
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Quick Actions Tab */}
          <TabsContent value="actions" className="space-y-6">
            <h3 className="text-2xl font-serif font-bold text-slate-900">Quick Actions</h3>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/builder">
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer border-dashed border-2 border-blue-200 hover:border-blue-400">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Plus className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg font-serif">Create New Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      Start building a new professional resume from scratch
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/job-analyzer">
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Brain className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-lg font-serif">Analyze Job Posting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
                      Paste a job URL to get AI-customized resume recommendations
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/profile">
                <Card className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Settings className="h-6 w-6 text-slate-600" />
                    </div>
                    <CardTitle className="text-lg font-serif">Profile Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center">
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

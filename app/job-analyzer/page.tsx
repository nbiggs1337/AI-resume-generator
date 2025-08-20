import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { JobAnalyzerForm } from "@/components/job-analyzer-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Brain, ArrowLeft, Zap, Target, Search } from "lucide-react"

export default async function JobAnalyzerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's recent job postings
  const { data: recentJobs } = await supabase
    .from("job_postings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-serif font-bold text-foreground">Job Analyzer</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Search className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">Analyze Job Postings</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Paste any job posting URL and our AI will extract key requirements to help customize your resume perfectly
            for that role.
          </p>
        </div>

        {/* How it works */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <CardTitle className="text-lg font-serif">Paste Job URL</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Copy and paste the URL from any job posting site</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-accent" />
              </div>
              <CardTitle className="text-lg font-serif">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Our AI extracts key requirements and qualifications</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-serif">Get Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Receive tailored suggestions for your resume</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Job Analyzer Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-serif">Analyze a New Job Posting</CardTitle>
            <CardDescription>Enter the URL of a job posting you're interested in applying for</CardDescription>
          </CardHeader>
          <CardContent>
            <JobAnalyzerForm />
          </CardContent>
        </Card>

        {/* Recent Job Postings */}
        {recentJobs && recentJobs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif">Recently Analyzed Jobs</CardTitle>
              <CardDescription>Your recent job posting analyses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">{job.title}</h4>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Analyzed {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/job-analyzer/${job.id}`}>
                        <Button variant="outline" size="sm">
                          View Analysis
                        </Button>
                      </Link>
                      <Link href={`/customize-resume?jobId=${job.id}`}>
                        <Button size="sm">Customize Resume</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

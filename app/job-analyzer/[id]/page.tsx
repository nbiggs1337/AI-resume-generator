import { createClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, ExternalLink, Brain, Target, Zap } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function JobAnalysisPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get job posting
  const { data: job, error } = await supabase
    .from("job_postings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !job) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/job-analyzer">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Job Analyzer
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-serif font-bold text-foreground">Job Analysis</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Job Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl font-serif mb-2">{job.title}</CardTitle>
                <CardDescription className="text-lg">{job.company}</CardDescription>
                <div className="flex items-center gap-4 mt-4">
                  {job.location && <Badge variant="secondary">{job.location}</Badge>}
                  {job.job_type && <Badge variant="secondary">{job.job_type}</Badge>}
                  {job.salary_range && <Badge variant="secondary">{job.salary_range}</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <a href={job.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Original
                  </Button>
                </a>
                <Link href={`/customize-resume?jobId=${job.id}`}>
                  <Button size="sm">
                    <Target className="h-4 w-4 mr-2" />
                    Customize Resume
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Job Details */}
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-serif">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.description}</p>
            </CardContent>
          </Card>

          {job.requirements && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.requirements}</p>
              </CardContent>
            </Card>
          )}

          {job.benefits && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl font-serif">Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{job.benefits}</p>
              </CardContent>
            </Card>
          )}

          {/* AI Insights Placeholder */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-serif">AI Insights</CardTitle>
              </div>
              <CardDescription>Key insights and recommendations for this job posting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Key Skills Mentioned</h4>
                  <div className="flex flex-wrap gap-2">
                    {/* This would be populated by AI analysis */}
                    <Badge variant="outline">React</Badge>
                    <Badge variant="outline">TypeScript</Badge>
                    <Badge variant="outline">Node.js</Badge>
                    <Badge variant="outline">AWS</Badge>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Experience Level</h4>
                  <p className="text-muted-foreground">Mid-level (3-5 years experience)</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Resume Optimization Tips</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Highlight React and TypeScript experience prominently</li>
                    <li>• Include specific AWS services you've worked with</li>
                    <li>• Mention any team leadership or mentoring experience</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Link href={`/customize-resume?jobId=${job.id}`} className="flex-1">
            <Button className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Customize Resume for This Job
            </Button>
          </Link>
          <Link href="/job-analyzer">
            <Button variant="outline">Analyze Another Job</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

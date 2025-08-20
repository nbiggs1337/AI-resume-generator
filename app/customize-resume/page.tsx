"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Briefcase, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function CustomizeSelectPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [resumes, setResumes] = useState<any[]>([])
  const [jobPostings, setJobPostings] = useState<any[]>([])
  const [selectedJob, setSelectedJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()
  const jobId = searchParams.get("jobId")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Load resumes
      const { data: resumesData } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      // Load job postings
      const { data: jobsData } = await supabase
        .from("job_postings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      setResumes(resumesData || [])
      setJobPostings(jobsData || [])

      // If jobId is provided, find and set the selected job
      if (jobId && jobsData) {
        const job = jobsData.find((j) => j.id === jobId)
        setSelectedJob(job)
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-serif font-bold text-slate-900">AI Resume Customization</h1>
          </div>
          <p className="text-slate-600">
            Select a resume and job posting to create an AI-customized version tailored for the specific role.
          </p>
        </div>

        {selectedJob && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Briefcase className="h-5 w-5" />
                Selected Job Posting
              </CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-green-900">{selectedJob.title}</h3>
              <p className="text-green-700">{selectedJob.company}</p>
              <p className="text-sm text-green-600">{selectedJob.location}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Resumes Section */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">Select a Resume</h2>
            {resumes.length > 0 ? (
              <div className="space-y-4">
                {resumes.map((resume) => (
                  <Card key={resume.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{resume.title}</h3>
                            <p className="text-sm text-slate-600">
                              Updated {new Date(resume.updated_at).toLocaleDateString()}
                            </p>
                            <div className="flex gap-2 mt-2">
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
                        </div>
                        {selectedJob ? (
                          <Link href={`/customize/${resume.id}/${selectedJob.id}`}>
                            <Button className="bg-purple-600 hover:bg-purple-700">
                              <Sparkles className="h-4 w-4 mr-2" />
                              Customize
                            </Button>
                          </Link>
                        ) : (
                          <Button disabled className="bg-gray-400">
                            Select Job First
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No resumes found</p>
                  <Link href="/resume/builder">
                    <Button>Create Your First Resume</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Job Postings Section */}
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 mb-4">
              {selectedJob ? "Or Choose Different Job" : "Select a Job Posting"}
            </h2>
            {jobPostings.length > 0 ? (
              <div className="space-y-4">
                {jobPostings.map((job) => (
                  <Card
                    key={job.id}
                    className={`hover:shadow-md transition-shadow cursor-pointer ${
                      selectedJob?.id === job.id ? "ring-2 ring-green-500 bg-green-50" : ""
                    }`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">{job.title}</h3>
                            <p className="text-green-600 font-medium">{job.company}</p>
                            <p className="text-sm text-slate-600">{job.location}</p>
                            <div className="flex gap-2 mt-2">
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
                        </div>
                        {selectedJob?.id === job.id && <Badge className="bg-green-600">Selected</Badge>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-8">
                <CardContent>
                  <Briefcase className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600 mb-4">No job postings found</p>
                  <Link href="/job-analyzer">
                    <Button>Analyze Your First Job</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {!selectedJob && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <CardContent className="p-6 text-center">
              <Sparkles className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-900 mb-2">How AI Customization Works</h3>
              <p className="text-blue-700">
                Select a job posting and resume above. Our AI will analyze the job requirements and customize your
                resume to highlight the most relevant skills and experiences for that specific role.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

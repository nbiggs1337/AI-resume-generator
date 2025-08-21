"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Share, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { PDFPreview } from "@/components/pdf-preview"

function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

function isStaticRoute(str: string): boolean {
  const staticRoutes = ["builder", "customize"]
  return staticRoutes.includes(str)
}

export default function ResumeViewPage() {
  const params = useParams()
  const router = useRouter()
  const [resume, setResume] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const id = params.id as string

    if (isStaticRoute(id)) {
      console.log("[v0] Static route detected, should not be handled by dynamic route:", id)
      return
    }

    if (!isValidUUID(id)) {
      console.log("[v0] Non-UUID path detected:", id)
      setError("Invalid resume ID format")
      setLoading(false)
      // Don't redirect immediately, let the user see the error
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
      return
    }

    loadResume()
  }, [])

  const loadResume = async () => {
    try {
      const { data, error } = await supabase.from("resumes").select("*").eq("id", params.id).single()

      if (error) throw error
      setResume(data)
    } catch (error) {
      console.error("Error loading resume:", error)
      setError("Resume not found")
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-slate-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  if (!resume) {
    return <div className="min-h-screen flex items-center justify-center">Resume not found</div>
  }

  const content = {
    personal_info: resume.additional_sections?.personal_info || {},
    summary: resume.additional_sections?.summary || "",
    experience: resume.work_experience || [],
    education: resume.education || [],
    skills: resume.skills || { technical: [], soft: [] },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{resume.title}</h1>
              <p className="text-slate-600 mt-2">
                Created {new Date(resume.created_at).toLocaleDateString()}
                {resume.is_customized && (
                  <Badge variant="secondary" className="ml-2">
                    AI Customized
                  </Badge>
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main PDF Preview - Takes up most of the space */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Resume Preview</h2>
              <PDFPreview resumeId={resume.id} resumeTitle={resume.title} />
            </div>
          </div>

          {/* Sidebar with Resume Details */}
          <div className="xl:col-span-1 space-y-4">
            {/* Personal Information */}
            {content.personal_info && Object.keys(content.personal_info).length > 0 && (
              <Card className="text-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Personal Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="font-semibold text-sm">{content.personal_info?.full_name || "Name not provided"}</p>
                    <p className="text-xs text-slate-600">{content.personal_info?.email || ""}</p>
                    <p className="text-xs text-slate-600">{content.personal_info?.phone || ""}</p>
                    <p className="text-xs text-slate-600">{content.personal_info?.location || ""}</p>
                    {content.personal_info?.linkedin && (
                      <p className="text-xs text-blue-600">{content.personal_info.linkedin}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary */}
            {content.summary && (
              <Card className="text-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-slate-700 leading-relaxed line-clamp-4">{content.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Skills */}
            {content.skills && (content.skills.technical?.length > 0 || content.skills.soft?.length > 0) && (
              <Card className="text-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Skills</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {content.skills.technical && content.skills.technical.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 mb-1">Technical</h4>
                      <div className="flex flex-wrap gap-1">
                        {content.skills.technical.slice(0, 6).map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                            {skill}
                          </Badge>
                        ))}
                        {content.skills.technical.length > 6 && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            +{content.skills.technical.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  {content.skills.soft && content.skills.soft.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-xs text-slate-900 mb-1">Soft Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {content.skills.soft.slice(0, 4).map((skill: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                            {skill}
                          </Badge>
                        ))}
                        {content.skills.soft.length > 4 && (
                          <Badge variant="outline" className="text-xs px-2 py-0">
                            +{content.skills.soft.length - 4} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Experience Summary */}
            {content.experience && content.experience.length > 0 && (
              <Card className="text-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Experience ({content.experience.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {content.experience.slice(0, 3).map((exp: any, index: number) => (
                    <div key={index} className="border-l-2 border-blue-200 pl-2">
                      <h3 className="font-semibold text-xs text-slate-900">{exp.title}</h3>
                      <p className="text-xs text-blue-600">{exp.company}</p>
                      <p className="text-xs text-slate-500">
                        {exp.start_date} - {exp.end_date}
                      </p>
                    </div>
                  ))}
                  {content.experience.length > 3 && (
                    <p className="text-xs text-slate-500 italic">+{content.experience.length - 3} more positions</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Education Summary */}
            {content.education && content.education.length > 0 && (
              <Card className="text-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Education</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {content.education.map((edu: any, index: number) => (
                    <div key={index}>
                      <h3 className="font-semibold text-xs text-slate-900">{edu.degree}</h3>
                      <p className="text-xs text-blue-600">{edu.school}</p>
                      <p className="text-xs text-slate-500">{edu.graduation_date}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

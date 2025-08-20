"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, Circle, Loader2, ArrowLeft, Sparkles, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { OptimizationResult } from "@/lib/ai/resume-optimizer"

const isValidUUID = (str: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default function CustomizeResumePage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [optimizing, setOptimizing] = useState(false)
  const [applying, setApplying] = useState(false)
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null)
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set())
  const [resume, setResume] = useState<any>(null)
  const [jobPosting, setJobPosting] = useState<any>(null)
  const [customizationId, setCustomizationId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    console.log("[v0] Customize page params:", { resumeId: params.resumeId, jobId: params.jobId })

    if (!params.resumeId || !params.jobId) {
      setError("Missing resume ID or job ID")
      setLoading(false)
      return
    }

    if (params.resumeId === "undefined" || params.jobId === "undefined") {
      setError("Invalid resume ID or job ID (undefined)")
      setLoading(false)
      return
    }

    if (!isValidUUID(params.resumeId as string) || !isValidUUID(params.jobId as string)) {
      setError("Invalid resume ID or job ID format")
      setLoading(false)
      return
    }

    loadData()
  }, [params.resumeId, params.jobId])

  const loadData = async () => {
    try {
      console.log("[v0] Loading data for resumeId:", params.resumeId, "jobId:", params.jobId)

      const [resumeResponse, jobResponse] = await Promise.all([
        supabase.from("resumes").select("*").eq("id", params.resumeId).single(),
        supabase.from("job_postings").select("*").eq("id", params.jobId).single(),
      ])

      console.log("[v0] Resume response:", resumeResponse)
      console.log("[v0] Job response:", jobResponse)

      if (resumeResponse.error) {
        console.error("[v0] Resume fetch error:", resumeResponse.error)
        setError(`Resume not found: ${resumeResponse.error.message}`)
        setLoading(false)
        return
      }

      if (jobResponse.error) {
        console.error("[v0] Job fetch error:", jobResponse.error)
        setError(`Job posting not found: ${jobResponse.error.message}`)
        setLoading(false)
        return
      }

      if (resumeResponse.data) setResume(resumeResponse.data)
      if (jobResponse.data) setJobPosting(jobResponse.data)

      const { data: existingCustomization } = await supabase
        .from("resume_customizations")
        .select("*")
        .eq("base_resume_id", params.resumeId)
        .eq("job_posting_id", params.jobId)
        .single()

      if (existingCustomization) {
        setOptimization(existingCustomization.customized_data)
        setCustomizationId(existingCustomization.id)
      }
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      setError("Failed to load resume or job posting data")
    } finally {
      setLoading(false)
    }
  }

  const handleOptimize = async () => {
    if (!params.resumeId || !params.jobId || params.resumeId === "undefined" || params.jobId === "undefined") {
      console.error("[v0] Cannot optimize with invalid IDs:", { resumeId: params.resumeId, jobId: params.jobId })
      setError("Cannot optimize: Invalid resume or job ID")
      return
    }

    setOptimizing(true)
    try {
      console.log("[v0] Starting optimization with:", { resumeId: params.resumeId, jobId: params.jobId })

      const response = await fetch("/api/optimize-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId: params.resumeId,
          jobPostingId: params.jobId,
        }),
      })

      const data = await response.json()
      console.log("[v0] Optimization response:", data)

      if (data.success) {
        setOptimization(data.optimization)
        setCustomizationId(data.customizationId)
      } else {
        setError(`Optimization failed: ${data.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("[v0] Error optimizing resume:", error)
      setError("Failed to optimize resume")
    } finally {
      setOptimizing(false)
    }
  }

  const toggleSuggestion = (index: number) => {
    const newSelected = new Set(selectedSuggestions)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedSuggestions(newSelected)
  }

  const handleApplySuggestions = async () => {
    if (selectedSuggestions.size === 0 || !customizationId) return

    setApplying(true)
    try {
      const appliedSuggestions = optimization?.suggestions.filter((_, index) => selectedSuggestions.has(index))

      const response = await fetch("/api/apply-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customizationId: customizationId,
          appliedSuggestions,
        }),
      })

      const data = await response.json()
      if (data.success) {
        router.push(`/dashboard?success=Resume customized successfully`)
      } else {
        console.error("Failed to apply suggestions:", data.error)
      }
    } catch (error) {
      console.error("Error applying suggestions:", error)
    } finally {
      setApplying(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="max-w-md mx-auto mt-20">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Unable to Load Customization</h2>
              <p className="text-slate-600 mb-6">{error}</p>
              <div className="space-y-2">
                <Button onClick={() => router.push("/dashboard")} className="w-full">
                  Go to Dashboard
                </Button>
                <Button onClick={() => router.push("/customize-resume")} variant="outline" className="w-full">
                  Select Different Resume
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">AI Resume Customization</h1>
              <p className="text-slate-600 mt-2">
                Optimize your resume for: <span className="font-semibold">{jobPosting?.title}</span> at{" "}
                {jobPosting?.company}
              </p>
            </div>

            {!optimization && (
              <Button onClick={handleOptimize} disabled={optimizing} className="bg-blue-600 hover:bg-blue-700">
                {optimizing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Optimize with AI
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {optimization && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Optimization Score</CardTitle>
                  <CardDescription>How well your resume matches this job</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">{optimization.overallScore}%</div>
                    <p className="text-sm text-slate-600 mb-4">{optimization.summary}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Keyword Matches</h4>
                      <div className="flex flex-wrap gap-1">
                        {optimization.keywordMatches.map((keyword, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm mb-2">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-1">
                        {optimization.missingKeywords.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>AI Suggestions</CardTitle>
                  <CardDescription>Select the suggestions you want to apply to your resume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {optimization.suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedSuggestions.has(index)
                            ? "border-blue-500 bg-blue-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                        onClick={() => toggleSuggestion(index)}
                      >
                        <div className="flex items-start gap-3">
                          {selectedSuggestions.has(index) ? (
                            <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                          ) : (
                            <Circle className="h-5 w-5 text-slate-400 mt-0.5" />
                          )}

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {suggestion.section}
                              </Badge>
                              <Badge
                                variant={
                                  suggestion.priority === "high"
                                    ? "destructive"
                                    : suggestion.priority === "medium"
                                      ? "default"
                                      : "secondary"
                                }
                                className="text-xs"
                              >
                                {suggestion.priority} priority
                              </Badge>
                            </div>

                            <p className="text-sm text-slate-600 mb-3">{suggestion.reason}</p>

                            <Tabs defaultValue="current" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="current">Current</TabsTrigger>
                                <TabsTrigger value="suggested">Suggested</TabsTrigger>
                              </TabsList>
                              <TabsContent value="current" className="mt-3">
                                <div className="bg-slate-100 p-3 rounded text-sm">{suggestion.current}</div>
                              </TabsContent>
                              <TabsContent value="suggested" className="mt-3">
                                <div className="bg-green-50 p-3 rounded text-sm">{suggestion.suggested}</div>
                              </TabsContent>
                            </Tabs>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedSuggestions.size > 0 && (
                    <div className="mt-6 pt-6 border-t">
                      <Button
                        onClick={handleApplySuggestions}
                        disabled={applying}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {applying ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Applying Suggestions...
                          </>
                        ) : (
                          `Apply ${selectedSuggestions.size} Selected Suggestions`
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

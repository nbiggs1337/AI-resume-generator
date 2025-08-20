"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ExternalLink, CheckCircle, AlertCircle, Edit3, Globe } from "lucide-react"
import { useRouter } from "next/navigation"

interface JobPostingData {
  title: string
  company: string
  location?: string
  jobType?: string
  salaryRange?: string
  description: string
  requirements?: string
  benefits?: string
}

export function JobAnalyzerForm() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [jobData, setJobData] = useState<JobPostingData | null>(null)
  const [step, setStep] = useState<"input" | "analyzing" | "results" | "manual">("input")
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualJobText, setManualJobText] = useState("")
  const router = useRouter()

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setIsLoading(true)
    setError(null)
    setStep("analyzing")

    try {
      const response = await fetch("/api/scrape-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: url.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.suggestManual) {
          setError(data.error)
          setShowManualInput(true)
          setStep("manual")
        } else {
          throw new Error(data.error || "Failed to analyze job posting")
        }
        return
      }

      setJobData(data.jobData)
      setStep("results")
    } catch (error) {
      console.error("Error analyzing job:", error)
      setError(error instanceof Error ? error.message : "Failed to analyze job posting")
      setStep("input")
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualJobText.trim()) {
      setError("Please paste the job posting content")
      return
    }

    setIsLoading(true)
    setError(null)
    setStep("analyzing")

    try {
      const response = await fetch("/api/parse-job-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ jobText: manualJobText.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse job posting")
      }

      setJobData(data.jobData)
      setStep("results")
    } catch (error) {
      console.error("Error parsing job:", error)
      setError(error instanceof Error ? error.message : "Failed to parse job posting")
      setStep("manual")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndCustomize = async () => {
    if (!jobData) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/save-job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url || "Manual Entry",
          ...jobData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save job posting")
      }

      router.push(`/customize-resume?jobId=${data.jobId}`)
    } catch (error) {
      console.error("Error saving job:", error)
      setError(error instanceof Error ? error.message : "Failed to save job posting")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === "analyzing") {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <CardTitle className="text-xl font-serif mb-2">Analyzing Job Posting</CardTitle>
          <CardDescription>
            Our AI is extracting key information from the job posting. This may take a few moments...
          </CardDescription>
        </CardContent>
      </Card>
    )
  }

  if (step === "manual") {
    return (
      <div className="space-y-6">
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg font-serif text-amber-800">Manual Entry Required</CardTitle>
            </div>
            <CardDescription className="text-amber-700">{error}</CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-serif">Paste Job Posting</CardTitle>
            </div>
            <CardDescription>
              Copy and paste the entire job posting content below. Our AI will automatically extract the key details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <Label htmlFor="jobText">Job Posting Content</Label>
                <Textarea
                  id="jobText"
                  value={manualJobText}
                  onChange={(e) => setManualJobText(e.target.value)}
                  placeholder="Paste the complete job posting here including title, company, description, requirements, benefits, etc. Our AI will automatically extract and organize the information."
                  className="min-h-[300px]"
                  required
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Include as much detail as possible for better AI analysis and resume customization.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading || !manualJobText.trim()} className="flex-1">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing with AI...
                    </>
                  ) : (
                    "Parse with AI"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("input")
                    setShowManualInput(false)
                    setError(null)
                  }}
                >
                  Try URL Again
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (step === "results" && jobData) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg font-serif text-green-800">Analysis Complete!</CardTitle>
            </div>
            <CardDescription className="text-green-700">
              We've successfully extracted key information from the job posting.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-serif">Job Details</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ExternalLink className="h-4 w-4" />
              <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                View Original Posting
              </a>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Job Title</Label>
                <p className="text-lg font-semibold">{jobData.title}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Company</Label>
                <p className="text-lg font-semibold">{jobData.company}</p>
              </div>
              {jobData.location && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                  <p>{jobData.location}</p>
                </div>
              )}
              {jobData.jobType && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Job Type</Label>
                  <p>{jobData.jobType}</p>
                </div>
              )}
              {jobData.salaryRange && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Salary Range</Label>
                  <p>{jobData.salaryRange}</p>
                </div>
              )}
            </div>

            <div>
              <Label className="text-sm font-medium text-muted-foreground">Job Description</Label>
              <Textarea value={jobData.description} readOnly className="mt-1 min-h-[100px] resize-none bg-muted" />
            </div>

            {jobData.requirements && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Requirements</Label>
                <Textarea value={jobData.requirements} readOnly className="mt-1 min-h-[100px] resize-none bg-muted" />
              </div>
            )}

            {jobData.benefits && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Benefits</Label>
                <Textarea value={jobData.benefits} readOnly className="mt-1 min-h-[80px] resize-none bg-muted" />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button onClick={handleSaveAndCustomize} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save & Customize Resume"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setStep("input")
              setJobData(null)
              setUrl("")
            }}
          >
            Analyze Another Job
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleAnalyze} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="jobUrl">Job Posting URL</Label>
        <Input
          id="jobUrl"
          type="url"
          placeholder="https://example.com/job-posting"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="h-11"
        />
        <p className="text-sm text-muted-foreground">
          Supported sites: LinkedIn, Indeed, Glassdoor, AngelList, and most job boards
        </p>
      </div>

      {error && !showManualInput && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || !url.trim()} className="flex-1 h-11">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Globe className="h-4 w-4 mr-2" />
              Analyze Job Posting
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setStep("manual")
            setShowManualInput(true)
            setError("You can manually enter job details if the URL doesn't work.")
          }}
          className="h-11"
        >
          <Edit3 className="h-4 w-4 mr-2" />
          Manual Entry
        </Button>
      </div>
    </form>
  )
}

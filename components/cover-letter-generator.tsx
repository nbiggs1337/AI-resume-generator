"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, FileText, Copy, Check, AlertCircle, ExternalLink } from "lucide-react"
import { toast } from "sonner"

interface CoverLetterGeneratorProps {
  resumeId: string
}

export function CoverLetterGenerator({ resumeId }: CoverLetterGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [isCopied, setIsCopied] = useState(false)
  const [jobData, setJobData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadJobDataAndGenerate = async () => {
      try {
        console.log("[v0] Loading job data for resume:", resumeId)
        const response = await fetch(`/api/get-job-for-resume?resumeId=${resumeId}`)
        console.log("[v0] Job data response status:", response.status)

        if (response.ok) {
          const data = await response.json()
          console.log("[v0] Job data received:", data)

          if (data.job) {
            console.log("[v0] Setting job data:", data.job)
            setJobData(data.job)
            console.log("[v0] Starting automatic cover letter generation")
            await generateCoverLetter(data.job)
          } else {
            console.log("[v0] No job data found in response")
          }
        } else {
          console.log("[v0] Job data request failed with status:", response.status)
        }
      } catch (error) {
        console.error("[v0] Error loading job data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadJobDataAndGenerate()
  }, [resumeId])

  const generateCoverLetter = async (job?: any) => {
    const jobToUse = job || jobData
    console.log("[v0] Generating cover letter with job:", jobToUse)

    if (!jobToUse) {
      console.log("[v0] No job data available for cover letter generation")
      toast.error("No job information available")
      return
    }

    setIsGenerating(true)
    try {
      console.log("[v0] Sending cover letter generation request")
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId,
          companyName: jobToUse.company,
          positionTitle: jobToUse.title,
          jobDescription: jobToUse.description,
        }),
      })

      console.log("[v0] Cover letter response status:", response.status)
      const data = await response.json()
      console.log("[v0] Cover letter response data:", data)

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate cover letter")
      }

      setCoverLetter(data.coverLetter)
      console.log("[v0] Cover letter generated successfully")
      toast.success("Cover letter generated successfully!")
    } catch (error) {
      console.error("[v0] Error generating cover letter:", error)
      toast.error("Failed to generate cover letter. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetter)
      setIsCopied(true)
      toast.success("Cover letter copied to clipboard!")
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Loading job information...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileText className="h-5 w-5" />
            AI Cover Letter Generator
          </CardTitle>
          <CardDescription className="text-slate-600">
            {jobData
              ? `Generated for ${jobData.title} at ${jobData.company}`
              : "Generate a personalized cover letter that matches your resume and job requirements"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobData ? (
            <>
              <div className="p-3 bg-slate-50 rounded-lg border">
                <h4 className="font-medium text-slate-900 mb-1">{jobData.title}</h4>
                <p className="text-sm text-slate-600">{jobData.company}</p>
                {jobData.location && <p className="text-sm text-slate-500">{jobData.location}</p>}
              </div>

              <Button
                onClick={() => generateCoverLetter()}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Cover Letter...
                  </>
                ) : (
                  "Regenerate Cover Letter"
                )}
              </Button>
            </>
          ) : (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-amber-900 mb-2">No Job Information Found</h4>
                  <p className="text-sm text-amber-800 mb-3">
                    To generate a personalized cover letter, you need to analyze a job posting first. This helps our AI
                    create content that matches the specific job requirements.
                  </p>
                  <Button
                    onClick={() => window.open("/job-analyzer", "_blank")}
                    variant="outline"
                    size="sm"
                    className="border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Analyze a Job Posting
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {coverLetter && (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-slate-900">Generated Cover Letter</CardTitle>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="border-slate-200 hover:bg-slate-50 bg-transparent"
              >
                {isCopied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="min-h-[400px] border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
              placeholder="Your generated cover letter will appear here..."
            />
            <p className="mt-2 text-sm text-slate-500">
              You can edit the cover letter above before copying or using it.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

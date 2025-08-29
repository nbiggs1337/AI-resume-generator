"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Plus, Trash2, CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { checkResumeLimit } from "@/lib/utils/resume-limits"

let unpdf: any = null

const initializeUnpdf = async () => {
  if (!unpdf) {
    unpdf = await import("unpdf")
    console.log("[v0] unpdf initialized for serverless PDF parsing")
  }
  return unpdf
}

const sanitizeFormData = (data: any) => {
  const sanitizeString = (value: any): string => {
    return value === null || value === undefined ? "" : String(value)
  }

  const sanitizeObject = (obj: any): any => {
    if (obj === null || obj === undefined) return {}
    const result: any = {}
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        result[key] = sanitizeObject(obj[key])
      } else if (Array.isArray(obj[key])) {
        result[key] = obj[key].map((item: any) =>
          typeof item === "object" ? sanitizeObject(item) : sanitizeString(item),
        )
      } else {
        result[key] = sanitizeString(obj[key])
      }
    }
    return result
  }

  return sanitizeObject(data)
}

const sortExperienceByDate = (experience: any[]) => {
  return [...experience].sort((a, b) => {
    const aIsCurrent = a.end_date && a.end_date.toLowerCase().includes("current")
    const bIsCurrent = b.end_date && b.end_date.toLowerCase().includes("current")

    if (aIsCurrent && bIsCurrent) return 0 // Both current, maintain order
    if (aIsCurrent) return -1 // a is current, put it first
    if (bIsCurrent) return 1 // b is current, put it first

    // Handle empty dates by putting them at the end
    if (!a.end_date && !b.end_date) return 0
    if (!a.end_date) return 1
    if (!b.end_date) return -1

    // Parse dates for comparison - handle year-only dates by treating them as end of year
    const parseDate = (dateStr: string) => {
      if (!dateStr) return new Date(0)

      const trimmed = dateStr.trim().toLowerCase()

      // Handle current/present variations
      if (trimmed.includes("current") || trimmed.includes("present") || trimmed.includes("now")) {
        return new Date() // Current date
      }

      // Year only (2025)
      if (/^\d{4}$/.test(trimmed)) {
        return new Date(Number.parseInt(trimmed) + 1, 0, 1) // January 1st of next year
      }

      // MM/YY format (11/23)
      if (/^\d{1,2}\/\d{2}$/.test(trimmed)) {
        const [month, year] = trimmed.split("/")
        const fullYear = 2000 + Number.parseInt(year)
        return new Date(fullYear, Number.parseInt(month) - 1, 1)
      }

      // MM/DD/YY format (11/15/23)
      if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(trimmed)) {
        const [month, day, year] = trimmed.split("/")
        const fullYear = 2000 + Number.parseInt(year)
        return new Date(fullYear, Number.parseInt(month) - 1, Number.parseInt(day))
      }

      // MM/DD/YYYY format (11/15/2023)
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
        const [month, day, year] = trimmed.split("/")
        return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      }

      // YYYY-MM format (2025-12)
      if (/^\d{4}-\d{1,2}$/.test(trimmed)) {
        return new Date(trimmed + "-01")
      }

      // Month Year formats (January 2023, Jan 2023, Jan. 2023)
      const monthYearMatch = trimmed.match(
        /^(january|february|march|april|may|june|july|august|september|october|november|december|jan\.?|feb\.?|mar\.?|apr\.?|may\.?|jun\.?|jul\.?|aug\.?|sep\.?|oct\.?|nov\.?|dec\.?)\s+(\d{4})$/i,
      )
      if (monthYearMatch) {
        const monthStr = monthYearMatch[1].replace(".", "")
        const year = Number.parseInt(monthYearMatch[2])
        const monthMap: { [key: string]: number } = {
          january: 0,
          jan: 0,
          february: 1,
          feb: 1,
          march: 2,
          mar: 2,
          april: 3,
          apr: 3,
          may: 4,
          june: 5,
          jun: 5,
          july: 6,
          jul: 6,
          august: 7,
          aug: 7,
          september: 8,
          sep: 8,
          october: 9,
          oct: 9,
          november: 10,
          nov: 10,
          december: 11,
          dec: 11,
        }
        const month = monthMap[monthStr.toLowerCase()]
        if (month !== undefined) {
          return new Date(year, month, 1)
        }
      }

      // Try to parse as-is for other formats
      return new Date(dateStr)
    }

    const dateA = parseDate(a.end_date)
    const dateB = parseDate(b.end_date)

    // Sort by most recent first
    return dateB.getTime() - dateA.getTime()
  })
}

const sortEducationByDate = (education: any[]) => {
  return [...education].sort((a, b) => {
    // Handle empty dates by putting them at the end
    if (!a.graduation_date && !b.graduation_date) return 0
    if (!a.graduation_date) return 1
    if (!b.graduation_date) return -1

    // Parse dates for comparison (handle various formats)
    const dateA = new Date(a.graduation_date + (a.graduation_date.includes("-") ? "" : "-01"))
    const dateB = new Date(b.graduation_date + (b.graduation_date.includes("-") ? "" : "-01"))

    // Sort by most recent first
    return dateB.getTime() - dateA.getTime()
  })
}

export default function ResumeBuilderPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get("edit")

  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [resumeData, setResumeData] = useState({
    title: "",
    personal_info: {
      full_name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    },
    summary: "",
    experience: [
      {
        title: "",
        company: "",
        location: "",
        start_date: "",
        end_date: "",
        description: "",
      },
    ],
    education: [
      {
        degree: "",
        school: "",
        location: "",
        graduation_date: "",
        gpa: "",
      },
    ],
    certifications: [
      {
        name: "",
        issuer: "",
        date: "",
        credential_id: "",
      },
    ],
    skills: {
      technical: [],
      soft: [],
    },
  })

  useEffect(() => {
    console.log("[v0] Resume builder page loading, editId:", editId)
    const initializePage = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        console.log("[v0] Session check complete:", !!session)

        if (editId) {
          console.log("[v0] Loading existing resume:", editId)
          await loadResume()
        }
      } catch (error) {
        console.error("[v0] Error initializing page:", error)
      } finally {
        console.log("[v0] Setting loading to false")
        setIsLoading(false)
      }
    }

    initializePage()
  }, [editId])

  const loadResume = async () => {
    try {
      console.log("[v0] Fetching resume data for ID:", editId)
      const { data, error } = await supabase.from("resumes").select("*").eq("id", editId).single()

      if (error) throw error
      console.log("[v0] Resume data loaded successfully")

      setResumeData({
        title: data.title || "",
        personal_info: data.additional_sections?.personal_info || {
          full_name: "",
          email: "",
          phone: "",
          location: "",
          linkedin: "",
          website: "",
        },
        summary: data.additional_sections?.summary || "",
        experience: data.work_experience || [
          {
            title: "",
            company: "",
            location: "",
            start_date: "",
            end_date: "",
            description: "",
          },
        ],
        education: data.education || [
          {
            degree: "",
            school: "",
            location: "",
            graduation_date: "",
            gpa: "",
          },
        ],
        certifications: data.certifications || [
          {
            name: "",
            issuer: "",
            date: "",
            credential_id: "",
          },
        ],
        skills: data.skills || {
          technical: [],
          soft: [],
        },
      })
    } catch (error) {
      console.error("[v0] Error loading resume:", error)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveSuccess(false)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("You must be logged in to save a resume")
      }

      if (!editId) {
        const limitCheck = await checkResumeLimit(user.id)
        if (!limitCheck.canCreate) {
          alert(limitCheck.message || "Resume limit reached. Please upgrade your account.")
          setSaving(false)
          return
        }
      }

      const sortedExperience = sortExperienceByDate(resumeData.experience)
      const sortedEducation = sortEducationByDate(resumeData.education)

      const resumeRecord = {
        title: resumeData.title,
        work_experience: sortedExperience,
        education: sortedEducation,
        certifications: resumeData.certifications,
        skills: resumeData.skills,
        additional_sections: {
          personal_info: resumeData.personal_info,
          summary: resumeData.summary,
        },
        updated_at: new Date().toISOString(),
      }

      if (editId) {
        const { error } = await supabase.from("resumes").update(resumeRecord).eq("id", editId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("resumes").insert({
          ...resumeRecord,
          user_id: user.id,
        })

        if (error) throw error
      }

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error("Error saving resume:", error)
    } finally {
      setSaving(false)
    }
  }

  const addExperience = () => {
    setResumeData({
      ...resumeData,
      experience: [
        ...resumeData.experience,
        {
          title: "",
          company: "",
          location: "",
          start_date: "",
          end_date: "",
          description: "",
        },
      ],
    })
  }

  const removeExperience = (index: number) => {
    setResumeData({
      ...resumeData,
      experience: resumeData.experience.filter((_, i) => i !== index),
    })
  }

  const updateExperience = (index: number, field: string, value: string) => {
    const updated = [...resumeData.experience]
    updated[index] = { ...updated[index], [field]: value }
    setResumeData({ ...resumeData, experience: updated })
  }

  const addEducation = () => {
    setResumeData({
      ...resumeData,
      education: [
        ...resumeData.education,
        {
          degree: "",
          school: "",
          location: "",
          graduation_date: "",
          gpa: "",
        },
      ],
    })
  }

  const removeEducation = (index: number) => {
    setResumeData({
      ...resumeData,
      education: resumeData.education.filter((_, i) => i !== index),
    })
  }

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...resumeData.education]
    updated[index] = { ...updated[index], [field]: value }
    setResumeData({ ...resumeData, education: updated })
  }

  const addCertification = () => {
    setResumeData({
      ...resumeData,
      certifications: [
        ...resumeData.certifications,
        {
          name: "",
          issuer: "",
          date: "",
          credential_id: "",
        },
      ],
    })
  }

  const removeCertification = (index: number) => {
    setResumeData({
      ...resumeData,
      certifications: resumeData.certifications.filter((_, i) => i !== index),
    })
  }

  const updateCertification = (index: number, field: string, value: string) => {
    const updated = [...resumeData.certifications]
    updated[index] = { ...updated[index], [field]: value }
    setResumeData({ ...resumeData, certifications: updated })
  }

  const addSkill = (type: "technical" | "soft", skill: string) => {
    if (!skill.trim()) return

    setResumeData({
      ...resumeData,
      skills: {
        ...resumeData.skills,
        [type]: [...resumeData.skills[type], skill.trim()],
      },
    })
  }

  const removeSkill = (type: "technical" | "soft", index: number) => {
    setResumeData({
      ...resumeData,
      skills: {
        ...resumeData.skills,
        [type]: resumeData.skills[type].filter((_, i) => i !== index),
      },
    })
  }

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || file.type !== "application/pdf") {
      alert("Please select a valid PDF file")
      return
    }

    setUploading(true)
    setUploadSuccess(false)

    try {
      console.log("[v0] Starting serverless PDF parsing with unpdf...")

      const unpdfLib = await initializeUnpdf()

      // Convert file to array buffer
      const arrayBuffer = await file.arrayBuffer()

      const result = await unpdfLib.extractText(new Uint8Array(arrayBuffer), {
        mergePages: true,
      })

      let extractedText: string
      if (typeof result.text === "string") {
        extractedText = result.text
      } else if (Array.isArray(result.text)) {
        extractedText = result.text.join(" ")
      } else {
        throw new Error("Unexpected text format from PDF extraction")
      }

      console.log("[v0] Extracted text length:", extractedText.length)
      console.log("[v0] Sample text:", extractedText.substring(0, 200))

      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error(
          "Could not extract readable text from this PDF. This often happens with image-based PDFs or complex formatting.",
        )
      }

      // Clean up the extracted text
      const cleanedText = extractedText.replace(/\s+/g, " ").trim().substring(0, 8000) // Limit to 8000 chars

      // Send extracted text to server for AI parsing
      const response = await fetch("/api/parse-resume-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: cleanedText }),
      })

      if (!response.ok) {
        throw new Error("Failed to parse resume text")
      }

      const parsedData = await response.json()

      console.log("[v0] Raw parsed data:", JSON.stringify(parsedData, null, 2))

      const sanitizedParsedData = sanitizeFormData(parsedData)

      console.log("[v0] Sanitized parsed data:", JSON.stringify(sanitizedParsedData, null, 2))

      const experienceData = sanitizedParsedData.work_experience || sanitizedParsedData.experience || []
      const educationData = sanitizedParsedData.education || []
      const skillsData = sanitizedParsedData.skills || { technical: [], soft: [] }
      const certificationsData = sanitizedParsedData.certifications || []

      console.log("[v0] Experience data found:", experienceData)
      console.log("[v0] Education data found:", educationData)
      console.log("[v0] Skills data found:", skillsData)
      console.log("[v0] Certifications data found:", certificationsData)

      // Merge parsed data with existing resume data
      setResumeData((prevData) => ({
        ...prevData,
        title: sanitizedParsedData.title || prevData.title,
        personal_info: {
          ...prevData.personal_info,
          ...sanitizedParsedData.personal_info,
        },
        summary: sanitizedParsedData.summary || prevData.summary,
        experience: experienceData.length > 0 ? experienceData : prevData.experience,
        education: educationData.length > 0 ? educationData : prevData.education,
        certifications: certificationsData.length > 0 ? certificationsData : prevData.certifications,
        skills: {
          technical: skillsData.technical?.length > 0 ? skillsData.technical : prevData.skills.technical,
          soft: skillsData.soft?.length > 0 ? skillsData.soft : prevData.skills.soft,
        },
      }))

      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
    } catch (error) {
      console.error("[v0] Error parsing PDF:", error)
      alert(
        `Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}. Please try again or enter information manually.`,
      )
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ""
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading resume builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-6 glass-button border-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-serif font-bold text-foreground mb-2">
                {editId ? "Edit Resume" : "Create New Resume"}
              </h1>
              <p className="text-xl text-muted-foreground">Build your professional resume step by step</p>
            </div>

            <div className="flex items-center gap-4">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm glass-card px-3 py-2">
                  <CheckCircle className="h-4 w-4" />
                  Saved successfully!
                </div>
              )}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary hover:bg-primary/90 shadow-lg depth-2"
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="glass border-white/20 bg-white/40 p-1 grid w-full grid-cols-5">
                <TabsTrigger
                  value="basic"
                  className="glass-button data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  Basic Info
                </TabsTrigger>
                <TabsTrigger
                  value="experience"
                  className="glass-button data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  Experience
                </TabsTrigger>
                <TabsTrigger
                  value="education"
                  className="glass-button data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  Education
                </TabsTrigger>
                <TabsTrigger
                  value="certifications"
                  className="glass-button data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  Certifications
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="glass-button data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
                >
                  Skills
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card className="glass-card border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif">Import from PDF</CardTitle>
                    <CardDescription>
                      Upload your existing resume PDF and let AI extract the information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={handlePdfUpload}
                          disabled={uploading}
                          className="cursor-pointer glass border-white/30 bg-white/60"
                        />
                      </div>
                      {uploading && (
                        <div className="flex items-center gap-2 text-primary text-sm glass-card px-3 py-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                          Parsing PDF...
                        </div>
                      )}
                      {uploadSuccess && (
                        <div className="flex items-center gap-2 text-green-600 text-sm glass-card px-3 py-2">
                          <CheckCircle className="h-4 w-4" />
                          PDF parsed successfully!
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Upload a PDF resume and AI will automatically extract and populate your information below.
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif">Resume Title</CardTitle>
                    <CardDescription>Give your resume a descriptive name</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="e.g., Software Engineer Resume"
                      value={resumeData.title}
                      onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                      className="glass border-white/30 bg-white/60"
                    />
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif">Personal Information</CardTitle>
                    <CardDescription>Your contact details and basic information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          value={resumeData.personal_info.full_name}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personal_info: { ...resumeData.personal_info, full_name: e.target.value },
                            })
                          }
                          className="glass border-white/30 bg-white/60"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={resumeData.personal_info.email}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personal_info: { ...resumeData.personal_info, email: e.target.value },
                            })
                          }
                          className="glass border-white/30 bg-white/60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={resumeData.personal_info.phone}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personal_info: { ...resumeData.personal_info, phone: e.target.value },
                            })
                          }
                          className="glass border-white/30 bg-white/60"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={resumeData.personal_info.location}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personal_info: { ...resumeData.personal_info, location: e.target.value },
                            })
                          }
                          className="glass border-white/30 bg-white/60"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="linkedin">LinkedIn (optional)</Label>
                        <Input
                          id="linkedin"
                          value={resumeData.personal_info.linkedin}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personal_info: { ...resumeData.personal_info, linkedin: e.target.value },
                            })
                          }
                          className="glass border-white/30 bg-white/60"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website">Website (optional)</Label>
                        <Input
                          id="website"
                          value={resumeData.personal_info.website}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personal_info: { ...resumeData.personal_info, website: e.target.value },
                            })
                          }
                          className="glass border-white/30 bg-white/60"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-white/20">
                  <CardHeader>
                    <CardTitle className="text-xl font-serif">Professional Summary</CardTitle>
                    <CardDescription>A brief overview of your professional background</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write a compelling summary of your professional experience and key achievements..."
                      rows={4}
                      value={resumeData.summary}
                      onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                      className="glass border-white/30 bg-white/60"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Work Experience</h3>
                    <p className="text-sm text-muted-foreground">Add your professional experience</p>
                  </div>
                  <Button onClick={addExperience} variant="outline" className="glass-button bg-transparent shrink-0">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>

                {resumeData.experience.map((exp, index) => (
                  <Card key={index} className="glass-card border-white/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Experience {index + 1}</CardTitle>
                        {resumeData.experience.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeExperience(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Job Title</Label>
                          <Input
                            value={exp.title}
                            onChange={(e) => updateExperience(index, "title", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                        <div>
                          <Label>Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(index, "company", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={exp.location}
                            onChange={(e) => updateExperience(index, "location", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            value={exp.start_date}
                            onChange={(e) => updateExperience(index, "start_date", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            value={exp.end_date}
                            onChange={(e) => updateExperience(index, "end_date", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          value={exp.description}
                          onChange={(e) => updateExperience(index, "description", e.target.value)}
                          className="glass border-white/30 bg-white/60"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="education">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Education</h3>
                    <p className="text-sm text-muted-foreground">Add your educational background</p>
                  </div>
                  <Button onClick={addEducation} variant="outline" className="glass-button bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>

                {resumeData.education.map((edu, index) => (
                  <Card key={index} className="glass-card border-white/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Education {index + 1}</CardTitle>
                        {resumeData.education.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeEducation(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Degree</Label>
                          <Input
                            placeholder="e.g., Bachelor of Science in Computer Science"
                            value={edu.degree}
                            onChange={(e) => updateEducation(index, "degree", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                        <div>
                          <Label>School/University</Label>
                          <Input
                            placeholder="e.g., University of California"
                            value={edu.school}
                            onChange={(e) => updateEducation(index, "school", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Location</Label>
                          <Input
                            placeholder="e.g., Los Angeles, CA"
                            value={edu.location}
                            onChange={(e) => updateEducation(index, "location", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                        <div>
                          <Label>Graduation Date</Label>
                          <Input
                            placeholder="e.g., May 2023"
                            value={edu.graduation_date}
                            onChange={(e) => updateEducation(index, "graduation_date", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                        <div>
                          <Label>GPA (optional)</Label>
                          <Input
                            placeholder="e.g., 3.8"
                            value={edu.gpa}
                            onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="certifications">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold">Certifications</h3>
                    <p className="text-sm text-muted-foreground">Add your professional certifications and licenses</p>
                  </div>
                  <Button onClick={addCertification} variant="outline" className="glass-button bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                </div>

                {resumeData.certifications.map((cert, index) => (
                  <Card key={index} className="glass-card border-white/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Certification {index + 1}</CardTitle>
                        {resumeData.certifications.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCertification(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Certification Name</Label>
                          <Input
                            placeholder="e.g., AWS Certified Solutions Architect"
                            value={cert.name}
                            onChange={(e) => updateCertification(index, "name", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                        <div>
                          <Label>Issuing Organization</Label>
                          <Input
                            placeholder="e.g., Amazon Web Services"
                            value={cert.issuer}
                            onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Date Obtained</Label>
                          <Input
                            placeholder="e.g., March 2023"
                            value={cert.date}
                            onChange={(e) => updateCertification(index, "date", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                        <div>
                          <Label>Credential ID (optional)</Label>
                          <Input
                            placeholder="e.g., ABC123DEF456"
                            value={cert.credential_id}
                            onChange={(e) => updateCertification(index, "credential_id", e.target.value)}
                            className="glass border-white/30 bg-white/60"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="skills">
                <div className="space-y-6">
                  <Card className="glass-card border-white/20">
                    <CardHeader>
                      <CardTitle className="text-xl font-serif">Technical Skills</CardTitle>
                      <CardDescription>Programming languages, frameworks, tools, etc.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a technical skill (e.g., JavaScript, React, Python)"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              const input = e.target as HTMLInputElement
                              addSkill("technical", input.value)
                              input.value = ""
                            }
                          }}
                          className="glass border-white/30 bg-white/60"
                        />
                        <Button
                          type="button"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).parentElement?.querySelector(
                              "input",
                            ) as HTMLInputElement
                            if (input) {
                              addSkill("technical", input.value)
                              input.value = ""
                            }
                          }}
                          className="glass-button"
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.technical.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 glass-card"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill("technical", index)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-card border-white/20">
                    <CardHeader>
                      <CardTitle className="text-xl font-serif">Soft Skills</CardTitle>
                      <CardDescription>Communication, leadership, problem-solving, etc.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a soft skill (e.g., Leadership, Communication)"
                          onKeyPress={(e) => {
                            if (e.key === "Enter") {
                              const input = e.target as HTMLInputElement
                              addSkill("soft", input.value)
                              input.value = ""
                            }
                          }}
                          className="glass border-white/30 bg-white/60"
                        />
                        <Button
                          type="button"
                          onClick={(e) => {
                            const input = (e.target as HTMLElement).parentElement?.querySelector(
                              "input",
                            ) as HTMLInputElement
                            if (input) {
                              addSkill("soft", input.value)
                              input.value = ""
                            }
                          }}
                          className="glass-button"
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.soft.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2 glass-card"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill("soft", index)}
                              className="text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="glass-card border-white/20 sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Preview</CardTitle>
                <CardDescription>See how your resume looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="glass border-white/30 p-6 rounded-xl text-xs space-y-4 bg-white/80">
                  <div className="text-center border-b border-white/30 pb-3">
                    <h3 className="font-bold text-base text-foreground">
                      {resumeData.personal_info.full_name || "Your Name"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {resumeData.personal_info.email} | {resumeData.personal_info.phone}
                    </p>
                    <p className="text-sm text-muted-foreground">{resumeData.personal_info.location}</p>
                  </div>

                  {resumeData.summary && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-foreground">SUMMARY</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{resumeData.summary}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-foreground">EXPERIENCE</h4>
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="mb-3 glass-card p-3">
                        <p className="font-medium text-sm text-foreground">{exp.title}</p>
                        <p className="text-sm text-primary font-medium">{exp.company}</p>
                        <p className="text-xs text-muted-foreground">
                          {exp.start_date} - {exp.end_date}
                        </p>
                      </div>
                    ))}
                  </div>

                  {resumeData.education.some((edu) => edu.degree || edu.school) && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-foreground">EDUCATION</h4>
                      {resumeData.education.map((edu, index) => (
                        <div key={index} className="mb-3 glass-card p-3">
                          <p className="font-medium text-sm text-foreground">{edu.degree}</p>
                          <p className="text-sm text-muted-foreground">{edu.school}</p>
                          <p className="text-xs text-muted-foreground">
                            {edu.graduation_date} {edu.gpa && `| GPA: ${edu.gpa}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
                    <div>
                      <h4 className="font-semibold text-sm mb-2 text-foreground">SKILLS</h4>
                      <div className="glass-card p-3">
                        {resumeData.skills.technical.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-foreground">Technical:</p>
                            <p className="text-sm text-muted-foreground">{resumeData.skills.technical.join(", ")}</p>
                          </div>
                        )}
                        {resumeData.skills.soft.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-foreground">Soft Skills:</p>
                            <p className="text-sm text-muted-foreground">{resumeData.skills.soft.join(", ")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

const supabase = createClient()

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

      const resumeRecord = {
        title: resumeData.title,
        work_experience: resumeData.experience,
        education: resumeData.education,
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

      console.log("[v0] Experience data found:", experienceData)
      console.log("[v0] Education data found:", educationData)
      console.log("[v0] Skills data found:", skillsData)

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading resume builder...</p>
        </div>
      </div>
    )
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
              <h1 className="text-3xl font-bold text-slate-900">{editId ? "Edit Resume" : "Create New Resume"}</h1>
              <p className="text-slate-600 mt-2">Build your professional resume step by step</p>
            </div>

            <div className="flex items-center gap-3">
              {saveSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="h-4 w-4" />
                  Saved successfully!
                </div>
              )}
              <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="experience">Experience</TabsTrigger>
                <TabsTrigger value="education">Education</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Import from PDF</CardTitle>
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
                          className="cursor-pointer"
                        />
                      </div>
                      {uploading && (
                        <div className="flex items-center gap-2 text-blue-600 text-sm">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          Parsing PDF...
                        </div>
                      )}
                      {uploadSuccess && (
                        <div className="flex items-center gap-2 text-green-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          PDF parsed successfully!
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Upload a PDF resume and AI will automatically extract and populate your information below.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Resume Title</CardTitle>
                    <CardDescription>Give your resume a descriptive name</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="e.g., Software Engineer Resume"
                      value={resumeData.title}
                      onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
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
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Professional Summary</CardTitle>
                    <CardDescription>A brief overview of your professional background</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Write a compelling summary of your professional experience and key achievements..."
                      rows={4}
                      value={resumeData.summary}
                      onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="experience" className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Work Experience</h3>
                    <p className="text-sm text-slate-600">Add your professional experience</p>
                  </div>
                  <Button onClick={addExperience} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Experience
                  </Button>
                </div>

                {resumeData.experience.map((exp, index) => (
                  <Card key={index}>
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
                          <Input value={exp.title} onChange={(e) => updateExperience(index, "title", e.target.value)} />
                        </div>
                        <div>
                          <Label>Company</Label>
                          <Input
                            value={exp.company}
                            onChange={(e) => updateExperience(index, "company", e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>Location</Label>
                          <Input
                            value={exp.location}
                            onChange={(e) => updateExperience(index, "location", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Start Date</Label>
                          <Input
                            value={exp.start_date}
                            onChange={(e) => updateExperience(index, "start_date", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>End Date</Label>
                          <Input
                            value={exp.end_date}
                            onChange={(e) => updateExperience(index, "end_date", e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          rows={3}
                          value={exp.description}
                          onChange={(e) => updateExperience(index, "description", e.target.value)}
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
                    <p className="text-sm text-slate-600">Add your educational background</p>
                  </div>
                  <Button onClick={addEducation} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Education
                  </Button>
                </div>

                {resumeData.education.map((edu, index) => (
                  <Card key={index}>
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
                          />
                        </div>
                        <div>
                          <Label>School/University</Label>
                          <Input
                            placeholder="e.g., University of California"
                            value={edu.school}
                            onChange={(e) => updateEducation(index, "school", e.target.value)}
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
                          />
                        </div>
                        <div>
                          <Label>Graduation Date</Label>
                          <Input
                            placeholder="e.g., May 2023"
                            value={edu.graduation_date}
                            onChange={(e) => updateEducation(index, "graduation_date", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>GPA (optional)</Label>
                          <Input
                            placeholder="e.g., 3.8"
                            value={edu.gpa}
                            onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="skills">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Technical Skills</CardTitle>
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
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.technical.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
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

                  <Card>
                    <CardHeader>
                      <CardTitle>Soft Skills</CardTitle>
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
                        >
                          Add
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.soft.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
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

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how your resume looks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-white p-4 border rounded-lg text-xs space-y-3">
                  <div className="text-center border-b pb-2">
                    <h3 className="font-bold text-sm">{resumeData.personal_info.full_name || "Your Name"}</h3>
                    <p className="text-xs text-slate-600">
                      {resumeData.personal_info.email} | {resumeData.personal_info.phone}
                    </p>
                    <p className="text-xs text-slate-600">{resumeData.personal_info.location}</p>
                  </div>

                  {resumeData.summary && (
                    <div>
                      <h4 className="font-semibold text-xs mb-1">SUMMARY</h4>
                      <p className="text-xs text-slate-700">{resumeData.summary}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-semibold text-xs mb-1">EXPERIENCE</h4>
                    {resumeData.experience.map((exp, index) => (
                      <div key={index} className="mb-2">
                        <p className="font-medium text-xs">{exp.title}</p>
                        <p className="text-xs text-slate-600">{exp.company}</p>
                        <p className="text-xs text-slate-500">
                          {exp.start_date} - {exp.end_date}
                        </p>
                      </div>
                    ))}
                  </div>

                  {resumeData.education.some((edu) => edu.degree || edu.school) && (
                    <div>
                      <h4 className="font-semibold text-xs mb-1">EDUCATION</h4>
                      {resumeData.education.map((edu, index) => (
                        <div key={index} className="mb-2">
                          <p className="font-medium text-xs">{edu.degree}</p>
                          <p className="text-xs text-slate-600">{edu.school}</p>
                          <p className="text-xs text-slate-500">
                            {edu.graduation_date} {edu.gpa && `| GPA: ${edu.gpa}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {(resumeData.skills.technical.length > 0 || resumeData.skills.soft.length > 0) && (
                    <div>
                      <h4 className="font-semibold text-xs mb-1">SKILLS</h4>
                      {resumeData.skills.technical.length > 0 && (
                        <div className="mb-1">
                          <p className="text-xs font-medium text-slate-700">Technical:</p>
                          <p className="text-xs text-slate-600">{resumeData.skills.technical.join(", ")}</p>
                        </div>
                      )}
                      {resumeData.skills.soft.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-slate-700">Soft Skills:</p>
                          <p className="text-xs text-slate-600">{resumeData.skills.soft.join(", ")}</p>
                        </div>
                      )}
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

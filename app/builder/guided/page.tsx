"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  Lightbulb,
  Save,
  Sparkles,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { checkResumeLimit } from "@/lib/utils/resume-limits"

const STEPS = [
  { id: "welcome", title: "Welcome", icon: Sparkles },
  { id: "personal", title: "Personal Info", icon: User },
  { id: "summary", title: "Summary", icon: FileText },
  { id: "experience", title: "Experience", icon: Briefcase },
  { id: "education", title: "Education", icon: GraduationCap },
  { id: "certifications", title: "Certifications", icon: Award },
  { id: "complete", title: "Complete", icon: CheckCircle },
]

const TIPS = {
  welcome: [
    "This guided process will take about 10-15 minutes",
    "You can save your progress at any time",
    "We'll help you create a professional resume step by step",
  ],
  personal: [
    "Use a professional email address",
    "Include your city and state, not full address",
    "LinkedIn profile can increase your visibility",
  ],
  summary: ["Keep it to 2-3 sentences", "Focus on your key achievements and skills", "Tailor it to your target role"],
  experience: [
    "Start with your most recent position",
    "Use action verbs to describe your achievements",
    "Include quantifiable results when possible",
  ],
  education: [
    "List your highest degree first",
    "Include GPA only if it's 3.5 or higher",
    "Add relevant coursework for recent graduates",
  ],
  certifications: [
    "Include industry-relevant certifications",
    "Add expiration dates if applicable",
    "Professional licenses belong here too",
  ],
}

export default function GuidedResumeBuilder() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
  })

  useEffect(() => {
    const initializePage = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          router.push("/auth/login")
          return
        }
      } catch (error) {
        console.error("Error initializing page:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializePage()
  }, [router])

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("You must be logged in to save a resume")

      const limitCheck = await checkResumeLimit(user.id)
      if (!limitCheck.canCreate) {
        alert(limitCheck.message || "Resume limit reached. Please upgrade your account.")
        setSaving(false)
        return
      }

      const resumeRecord = {
        title: resumeData.title || "My Resume",
        work_experience: resumeData.experience,
        education: resumeData.education,
        certifications: resumeData.certifications,
        additional_sections: {
          personal_info: resumeData.personal_info,
          summary: resumeData.summary,
        },
        user_id: user.id,
      }

      const { error } = await supabase.from("resumes").insert(resumeRecord)
      if (error) throw error

      router.push("/dashboard")
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
        { title: "", company: "", location: "", start_date: "", end_date: "", description: "" },
      ],
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
      education: [...resumeData.education, { degree: "", school: "", location: "", graduation_date: "", gpa: "" }],
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
      certifications: [...resumeData.certifications, { name: "", issuer: "", date: "", credential_id: "" }],
    })
  }

  const updateCertification = (index: number, field: string, value: string) => {
    const updated = [...resumeData.certifications]
    updated[index] = { ...updated[index], [field]: value }
    setResumeData({ ...resumeData, certifications: updated })
  }

  const progress = ((currentStep + 1) / STEPS.length) * 100

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center glass-card p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading guided builder...</p>
        </div>
      </div>
    )
  }

  const currentStepData = STEPS[currentStep]
  const StepIcon = currentStepData.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100">
      {/* Header with Progress */}
      <div className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => router.back()} className="glass-button border-0">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="text-center">
              <h1 className="text-xl font-serif font-bold text-foreground">Resume Builder</h1>
              <p className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {STEPS.length}
              </p>
            </div>
            <div className="w-16"></div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <Progress value={progress} className="h-2 glass" />
            <div className="flex justify-between mt-2">
              {STEPS.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isCompleted = index < currentStep

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCompleted
                          ? "bg-primary text-white"
                          : isActive
                            ? "bg-primary/20 text-primary glass"
                            : "bg-muted text-muted-foreground glass"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-xs mt-1 transition-colors duration-300 ${
                        isActive ? "text-primary font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="glass-card border-white/20 min-h-[600px]">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 glass">
                  <StepIcon className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-3xl font-serif">{currentStepData.title}</CardTitle>
                <CardDescription className="text-lg">
                  {currentStep === 0 && "Let's create your professional resume together"}
                  {currentStep === 1 && "Tell us about yourself"}
                  {currentStep === 2 && "Write a compelling professional summary"}
                  {currentStep === 3 && "Add your work experience"}
                  {currentStep === 4 && "Include your educational background"}
                  {currentStep === 5 && "Add your certifications and licenses"}
                  {currentStep === 6 && "Your resume is ready!"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Welcome Step */}
                {currentStep === 0 && (
                  <div className="text-center space-y-6">
                    <div className="glass-card p-6 bg-primary/5">
                      <h3 className="text-xl font-serif font-semibold mb-4">What we'll cover:</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {STEPS.slice(1, -1).map((step, index) => {
                          const Icon = step.icon
                          return (
                            <div key={step.id} className="flex items-center gap-3 p-3 glass rounded-lg">
                              <Icon className="h-5 w-5 text-primary" />
                              <span className="font-medium">{step.title}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <Input
                      placeholder="Give your resume a name (e.g., Software Engineer Resume)"
                      value={resumeData.title}
                      onChange={(e) => setResumeData({ ...resumeData, title: e.target.value })}
                      className="glass border-white/30 bg-white/60 text-center text-lg"
                    />
                  </div>
                )}

                {/* Personal Info Step */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName" className="text-base font-medium">
                          Full Name *
                        </Label>
                        <Input
                          id="fullName"
                          value={resumeData.personal_info.full_name}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personal_info: { ...resumeData.personal_info, full_name: e.target.value },
                            })
                          }
                          className="glass border-white/30 bg-white/60 mt-2"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-base font-medium">
                          Email Address *
                        </Label>
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
                          className="glass border-white/30 bg-white/60 mt-2"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone" className="text-base font-medium">
                          Phone Number *
                        </Label>
                        <Input
                          id="phone"
                          value={resumeData.personal_info.phone}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personal_info: { ...resumeData.personal_info, phone: e.target.value },
                            })
                          }
                          className="glass border-white/30 bg-white/60 mt-2"
                          placeholder="(555) 123-4567"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-base font-medium">
                          Location *
                        </Label>
                        <Input
                          id="location"
                          value={resumeData.personal_info.location}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personal_info: { ...resumeData.personal_info, location: e.target.value },
                            })
                          }
                          className="glass border-white/30 bg-white/60 mt-2"
                          placeholder="New York, NY"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="linkedin" className="text-base font-medium">
                          LinkedIn Profile
                        </Label>
                        <Input
                          id="linkedin"
                          value={resumeData.personal_info.linkedin}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personal_info: { ...resumeData.personal_info, linkedin: e.target.value },
                            })
                          }
                          className="glass border-white/30 bg-white/60 mt-2"
                          placeholder="linkedin.com/in/johndoe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="website" className="text-base font-medium">
                          Website/Portfolio
                        </Label>
                        <Input
                          id="website"
                          value={resumeData.personal_info.website}
                          onChange={(e) =>
                            setResumeData({
                              ...resumeData,
                              personal_info: { ...resumeData.personal_info, website: e.target.value },
                            })
                          }
                          className="glass border-white/30 bg-white/60 mt-2"
                          placeholder="johndoe.com"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Step */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="summary" className="text-base font-medium">
                        Professional Summary
                      </Label>
                      <Textarea
                        id="summary"
                        rows={6}
                        value={resumeData.summary}
                        onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
                        className="glass border-white/30 bg-white/60 mt-2"
                        placeholder="Write a compelling 2-3 sentence summary highlighting your key achievements, skills, and career goals..."
                      />
                      <p className="text-sm text-muted-foreground mt-2">{resumeData.summary.length}/300 characters</p>
                    </div>
                  </div>
                )}

                {/* Experience Step */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, index) => (
                      <Card key={index} className="glass-card border-white/20">
                        <CardHeader>
                          <CardTitle className="text-lg">Position {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Job Title *</Label>
                              <Input
                                value={exp.title}
                                onChange={(e) => updateExperience(index, "title", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="Software Engineer"
                              />
                            </div>
                            <div>
                              <Label>Company *</Label>
                              <Input
                                value={exp.company}
                                onChange={(e) => updateExperience(index, "company", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="Tech Corp"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Location</Label>
                              <Input
                                value={exp.location}
                                onChange={(e) => updateExperience(index, "location", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="San Francisco, CA"
                              />
                            </div>
                            <div>
                              <Label>Start Date *</Label>
                              <Input
                                value={exp.start_date}
                                onChange={(e) => updateExperience(index, "start_date", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="Jan 2022"
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input
                                value={exp.end_date}
                                onChange={(e) => updateExperience(index, "end_date", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="Present"
                              />
                            </div>
                          </div>

                          <div>
                            <Label>Description</Label>
                            <Textarea
                              rows={3}
                              value={exp.description}
                              onChange={(e) => updateExperience(index, "description", e.target.value)}
                              className="glass border-white/30 bg-white/60 mt-1"
                              placeholder="Describe your key responsibilities and achievements..."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button onClick={addExperience} variant="outline" className="glass-button w-full bg-transparent">
                      Add Another Position
                    </Button>
                  </div>
                )}

                {/* Education Step */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    {resumeData.education.map((edu, index) => (
                      <Card key={index} className="glass-card border-white/20">
                        <CardHeader>
                          <CardTitle className="text-lg">Education {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Degree *</Label>
                              <Input
                                value={edu.degree}
                                onChange={(e) => updateEducation(index, "degree", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="Bachelor of Science in Computer Science"
                              />
                            </div>
                            <div>
                              <Label>School/University *</Label>
                              <Input
                                value={edu.school}
                                onChange={(e) => updateEducation(index, "school", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="University of California"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Location</Label>
                              <Input
                                value={edu.location}
                                onChange={(e) => updateEducation(index, "location", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="Los Angeles, CA"
                              />
                            </div>
                            <div>
                              <Label>Graduation Date</Label>
                              <Input
                                value={edu.graduation_date}
                                onChange={(e) => updateEducation(index, "graduation_date", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="May 2023"
                              />
                            </div>
                            <div>
                              <Label>GPA (optional)</Label>
                              <Input
                                value={edu.gpa}
                                onChange={(e) => updateEducation(index, "gpa", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="3.8"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button onClick={addEducation} variant="outline" className="glass-button w-full bg-transparent">
                      Add Another Degree
                    </Button>
                  </div>
                )}

                {/* Certifications Step */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    {resumeData.certifications.map((cert, index) => (
                      <Card key={index} className="glass-card border-white/20">
                        <CardHeader>
                          <CardTitle className="text-lg">Certification {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Certification Name</Label>
                              <Input
                                value={cert.name}
                                onChange={(e) => updateCertification(index, "name", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="AWS Certified Solutions Architect"
                              />
                            </div>
                            <div>
                              <Label>Issuing Organization</Label>
                              <Input
                                value={cert.issuer}
                                onChange={(e) => updateCertification(index, "issuer", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="Amazon Web Services"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Date Obtained</Label>
                              <Input
                                value={cert.date}
                                onChange={(e) => updateCertification(index, "date", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="March 2023"
                              />
                            </div>
                            <div>
                              <Label>Credential ID (optional)</Label>
                              <Input
                                value={cert.credential_id}
                                onChange={(e) => updateCertification(index, "credential_id", e.target.value)}
                                className="glass border-white/30 bg-white/60 mt-1"
                                placeholder="ABC123DEF456"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    <Button onClick={addCertification} variant="outline" className="glass-button w-full bg-transparent">
                      Add Another Certification
                    </Button>
                  </div>
                )}

                {/* Complete Step */}
                {currentStep === 6 && (
                  <div className="text-center space-y-6">
                    <div className="glass-card p-8 bg-primary/5">
                      <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-serif font-bold mb-4">Congratulations!</h3>
                      <p className="text-lg text-muted-foreground mb-6">
                        Your resume is ready. You can now save it and start applying to jobs.
                      </p>
                      <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 shadow-lg depth-2 text-lg px-8 py-3"
                      >
                        {saving ? (
                          "Saving..."
                        ) : (
                          <>
                            <Save className="h-5 w-5 mr-2" />
                            Save My Resume
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                variant="outline"
                className="glass-button bg-transparent"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < STEPS.length - 1 && (
                <Button onClick={handleNext} className="bg-primary hover:bg-primary/90 shadow-lg">
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Tips Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-card border-white/20 sticky top-32">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  <CardTitle className="text-lg">Helpful Tips</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {TIPS[STEPS[currentStep]?.id as keyof typeof TIPS]?.map((tip, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 glass rounded-lg">
                      <Badge variant="secondary" className="text-xs px-2 py-1 glass border-white/20">
                        {index + 1}
                      </Badge>
                      <p className="text-sm text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

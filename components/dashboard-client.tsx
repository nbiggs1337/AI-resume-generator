"use client"

import { useState, useEffect } from "react"
import { PaywallModal } from "@/components/paywall/paywall-modal"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import PDFDownloadButton from "@/components/pdf-download-button"
import {
  Plus,
  FileText,
  Brain,
  Settings,
  BarChart3,
  Briefcase,
  Sparkles,
  Eye,
  Edit,
  CheckCircle,
  Circle,
} from "lucide-react"

interface DashboardClientProps {
  isAtLimit: boolean
  currentCount: number
  limit: number
  accountType: string
  resumes: any[]
  jobPostings: any[]
  customizations: any[]
  totalResumes: number
  totalJobPostings: number
  totalCustomizations: number
  recentCustomizations: number
  profile: any
  user: any
  hasResumes: boolean
  hasJobPostings: boolean
  hasCustomizations: boolean
}

export default function DashboardClient({
  isAtLimit,
  currentCount,
  limit,
  accountType,
  resumes,
  jobPostings,
  customizations,
  totalResumes,
  totalJobPostings,
  totalCustomizations,
  recentCustomizations,
  profile,
  user,
  hasResumes,
  hasJobPostings,
  hasCustomizations,
}: DashboardClientProps) {
  const [showPaywall, setShowPaywall] = useState(false)
  const [activeTab, setActiveTab] = useState("resumes")
  const router = useRouter()

  useEffect(() => {
    if (isAtLimit) {
      setShowPaywall(true)
    }
  }, [isAtLimit])

  const handleClosePaywall = () => {
    setShowPaywall(false)
  }

  const handleUpgrade = () => {
    router.push("/upgrade")
  }

  const handleCardClick = (tabValue: string) => {
    setActiveTab(tabValue)
  }

  return (
    <>
      <PaywallModal
        isOpen={showPaywall}
        onClose={handleClosePaywall}
        currentCount={currentCount}
        limit={limit}
        onUpgrade={handleUpgrade}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-4xl font-serif font-bold text-foreground mb-3">Your Resume Dashboard</h2>
          <p className="text-xl text-muted-foreground">
            Follow our simple 4-step process to create AI-optimized resumes that get you hired.
          </p>
        </div>

        <Card className="glass-card border-white/20 mb-8 bg-gradient-to-r from-primary/5 to-purple/5">
          <CardHeader>
            <CardTitle className="text-2xl font-serif flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Your AI Resume Workflow
            </CardTitle>
            <CardDescription className="text-base">
              Complete these steps to create job-winning resumes with AI optimization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {/* Step 1: Create Resume */}
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-white/50 border border-white/20">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    hasResumes ? "bg-green-500 text-white" : "bg-primary/20 text-primary"
                  }`}
                >
                  {hasResumes ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                </div>
                <h3 className="font-semibold mb-2">1. Create Resume</h3>
                <p className="text-sm text-muted-foreground mb-3">Build your base resume with our AI-powered builder</p>
                <Link href="/builder">
                  <Button size="sm" variant={hasResumes ? "outline" : "default"} className="w-full">
                    {hasResumes ? "Create Another" : "Start Here"}
                  </Button>
                </Link>
              </div>

              {/* Step 2: Analyze Job */}
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-white/50 border border-white/20">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    hasJobPostings
                      ? "bg-green-500 text-white"
                      : hasResumes
                        ? "bg-green-500/20 text-green-600"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {hasJobPostings ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                </div>
                <h3 className="font-semibold mb-2">2. Analyze Job</h3>
                <p className="text-sm text-muted-foreground mb-3">Paste job URLs to analyze requirements</p>
                <Link href="/job-analyzer">
                  <Button
                    size="sm"
                    variant={hasJobPostings ? "outline" : hasResumes ? "default" : "secondary"}
                    className="w-full"
                    disabled={!hasResumes}
                  >
                    {hasJobPostings ? "Analyze More" : "Analyze Jobs"}
                  </Button>
                </Link>
              </div>

              {/* Step 3: AI Customize */}
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-white/50 border border-white/20">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    hasCustomizations
                      ? "bg-green-500 text-white"
                      : hasJobPostings
                        ? "bg-purple-500/20 text-purple-600"
                        : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {hasCustomizations ? <CheckCircle className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                </div>
                <h3 className="font-semibold mb-2">3. AI Customize</h3>
                <p className="text-sm text-muted-foreground mb-3">Get AI suggestions to optimize your resume</p>
                <Link href="/customize-resume">
                  <Button
                    size="sm"
                    variant={hasCustomizations ? "outline" : hasJobPostings ? "default" : "secondary"}
                    className="w-full"
                    disabled={!hasJobPostings}
                  >
                    {hasCustomizations ? "Customize More" : "Start Customizing"}
                  </Button>
                </Link>
              </div>

              {/* Step 4: Download & Apply */}
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-white/50 border border-white/20">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                    hasCustomizations ? "bg-blue-500/20 text-blue-600" : "bg-gray-200 text-gray-400"
                  }`}
                >
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">4. Download & Apply</h3>
                <p className="text-sm text-muted-foreground mb-3">Download your optimized resume and apply</p>
                <Button
                  size="sm"
                  variant={hasCustomizations ? "default" : "secondary"}
                  className="w-full"
                  disabled={!hasCustomizations}
                  onClick={() => hasCustomizations && handleCardClick("resumes")}
                >
                  {hasCustomizations ? "View Resumes" : "Complete Steps Above"}
                </Button>
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>Progress:</span>
                <div className="flex gap-1">
                  {[hasResumes, hasJobPostings, hasCustomizations, hasCustomizations].map((completed, index) => (
                    <div key={index} className={`w-2 h-2 rounded-full ${completed ? "bg-green-500" : "bg-gray-300"}`} />
                  ))}
                </div>
                <span>
                  {[hasResumes, hasJobPostings, hasCustomizations, hasCustomizations].filter(Boolean).length}/4 Complete
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card
            className="glass-card border-white/20 bg-gradient-to-br from-primary/10 to-primary/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => handleCardClick("resumes")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary text-sm font-medium">Total Resumes</p>
                  <p className="text-3xl font-bold text-foreground">{totalResumes}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to view all</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center glass">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="glass-card border-white/20 bg-gradient-to-br from-green-500/10 to-green-400/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => handleCardClick("jobs")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Job Postings</p>
                  <p className="text-3xl font-bold text-foreground">{totalJobPostings}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to view all</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center glass">
                  <Briefcase className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="glass-card border-white/20 bg-gradient-to-br from-purple-500/10 to-purple-400/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => handleCardClick("customizations")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">AI Customizations</p>
                  <p className="text-3xl font-bold text-foreground">{totalCustomizations}</p>
                  <p className="text-xs text-muted-foreground mt-1">Click to view all</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center glass">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="glass-card border-white/20 bg-gradient-to-br from-orange-500/10 to-orange-400/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            onClick={() => handleCardClick("customizations")}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">This Week</p>
                  <p className="text-3xl font-bold text-foreground">{recentCustomizations}</p>
                  <p className="text-xs text-muted-foreground mt-1">Recent activity</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center glass">
                  <BarChart3 className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass border-white/20 bg-white/40 p-1">
            <TabsTrigger
              value="resumes"
              className="glass-button data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary"
            >
              <FileText className="h-4 w-4 mr-2" />
              Step 1: Resumes
            </TabsTrigger>
            <TabsTrigger
              value="jobs"
              className="glass-button data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:border-green-600"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Step 2: Jobs
            </TabsTrigger>
            <TabsTrigger
              value="customizations"
              className="glass-button data-[state=active]:bg-purple-600 data-[state=active]:text-white data-[state=active]:border-purple-600"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Step 3: AI Optimize
            </TabsTrigger>
            <TabsTrigger
              value="actions"
              className="glass-button data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Quick Actions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resumes" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-serif font-bold text-foreground">Step 1: Your Resumes</h3>
                <p className="text-muted-foreground mt-1">
                  Create your base resume to get started with AI optimization
                </p>
              </div>
              <Link href="/builder">
                <Button className="bg-primary hover:bg-primary/90 shadow-lg depth-2">
                  <Plus className="h-4 w-4 mr-2" />
                  New Resume
                </Button>
              </Link>
            </div>

            {resumes && resumes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resumes.map((resume) => (
                  <Card
                    key={resume.id}
                    className="glass-card border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center glass">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-serif">{resume.title}</CardTitle>
                            <CardDescription>
                              Updated {new Date(resume.updated_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          {resume.is_customized && (
                            <Badge variant="secondary" className="text-xs glass border-white/20">
                              AI Customized
                            </Badge>
                          )}
                          {resume.is_default && (
                            <Badge variant="outline" className="text-xs glass border-white/30">
                              Default
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap justify-start">
                        <Link href={`/resume/${resume.id}`}>
                          <Button variant="outline" size="sm" className="glass-button border-white/30 bg-transparent">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/builder?edit=${resume.id}`}>
                          <Button variant="outline" size="sm" className="glass-button border-white/30 bg-transparent">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <PDFDownloadButton resumeId={resume.id} resumeTitle={resume.title} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card border-white/20 text-center py-16">
                <CardContent>
                  <div className="w-20 h-20 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl font-serif mb-3">No resumes yet</CardTitle>
                  <CardDescription className="mb-8 text-lg">
                    Create your first resume to get started with AI-powered job matching
                  </CardDescription>
                  <Link href="/builder">
                    <Button className="bg-primary hover:bg-primary/90 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Resume
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-serif font-bold text-foreground">Step 2: Analyzed Job Postings</h3>
                <p className="text-muted-foreground mt-1">
                  Paste job URLs to analyze requirements and get AI customization suggestions
                </p>
              </div>
              <Link href="/job-analyzer">
                <Button className="bg-green-600 hover:bg-green-700 shadow-lg depth-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Analyze New Job
                </Button>
              </Link>
            </div>

            {jobPostings && jobPostings.length > 0 ? (
              <div className="space-y-4">
                {jobPostings.map((job) => (
                  <Card key={job.id} className="glass-card border-white/20 hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1 text-lg">{job.title}</h4>
                          <p className="text-primary font-medium mb-2">{job.company}</p>
                          <p className="text-sm text-muted-foreground mb-3">{job.location}</p>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs glass border-white/30">
                              {new Date(job.created_at).toLocaleDateString()}
                            </Badge>
                            {job.salary_range && (
                              <Badge variant="secondary" className="text-xs glass border-white/20">
                                {job.salary_range}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/job-analyzer/${job.id}`}>
                            <Button variant="outline" size="sm" className="glass-button border-white/30 bg-transparent">
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/customize-resume?jobId=${job.id}`}>
                            <Button variant="outline" size="sm" className="glass-button border-white/30 bg-transparent">
                              Customize Resume
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card border-white/20 text-center py-16">
                <CardContent>
                  <div className="w-20 h-20 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass">
                    <Briefcase className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl font-serif mb-3">No job postings analyzed</CardTitle>
                  <CardDescription className="mb-8 text-lg">
                    Start by analyzing job postings to get AI-powered resume customizations
                  </CardDescription>
                  <Link href="/job-analyzer">
                    <Button className="bg-green-600 hover:bg-green-700 shadow-lg">
                      <Plus className="h-4 w-4 mr-2" />
                      Analyze Your First Job
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="customizations" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-3xl font-serif font-bold text-foreground">Step 3: AI Customizations</h3>
                <p className="text-muted-foreground mt-1">
                  Review and apply AI suggestions to optimize your resumes for specific jobs
                </p>
              </div>
              <Badge variant="secondary" className="text-sm glass border-white/20">
                {totalCustomizations} total
              </Badge>
            </div>

            {customizations && customizations.length > 0 ? (
              <div className="space-y-4">
                {customizations.map((customization) => (
                  <Card
                    key={customization.id}
                    className="glass-card border-white/20 hover:shadow-xl transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-5 w-5 text-purple-600" />
                            <h4 className="font-semibold text-foreground text-lg">
                              {customization.resumes?.title} → {customization.job_postings?.title}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Customized for {customization.job_postings?.company}
                          </p>
                          <div className="flex gap-2">
                            <Badge
                              variant={customization.status === "applied" ? "default" : "secondary"}
                              className="text-xs glass border-white/20"
                            >
                              {customization.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs glass border-white/30">
                              {new Date(customization.created_at).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/customize/${customization.base_resume_id}/${customization.job_posting_id}`}>
                            <Button variant="outline" size="sm" className="glass-button border-white/30 bg-transparent">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="glass-card border-white/20 text-center py-16">
                <CardContent>
                  <div className="w-20 h-20 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-6 glass">
                    <Sparkles className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-2xl font-serif mb-3">No AI customizations yet</CardTitle>
                  <CardDescription className="mb-8 text-lg">
                    Analyze job postings and customize your resumes with AI to get started
                  </CardDescription>
                  <Link href="/job-analyzer">
                    <Button className="bg-purple-600 hover:bg-purple-700 shadow-lg">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Start AI Customization
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <div>
              <h3 className="text-3xl font-serif font-bold text-foreground">Quick Actions</h3>
              <p className="text-muted-foreground mt-1">Jump to any step in the workflow or manage your account</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href="/builder">
                <Card className="glass-card border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-dashed border-2 border-primary/30 hover:border-primary/60">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4 glass">
                      <Plus className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-serif">Create New Resume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      Start building a new professional resume from scratch
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/job-analyzer">
                <Card className="glass-card border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 glass">
                      <Brain className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle className="text-xl font-serif">Analyze Job Posting</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      Paste a job URL to get AI-customized resume recommendations
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/profile">
                <Card className="glass-card border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 bg-muted/20 rounded-2xl flex items-center justify-center mx-auto mb-4 glass">
                      <Settings className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-xl font-serif">Profile Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-center text-base">
                      Update your personal information and preferences
                    </CardDescription>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}

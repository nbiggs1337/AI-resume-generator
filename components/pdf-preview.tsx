"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Eye, FileText, Loader2, Crown } from "lucide-react"
import jsPDF from "jspdf"
import { TEMPLATE_CATEGORIES, type TemplateType } from "@/lib/pdf/resume-templates"
import { useResumeLimit } from "@/hooks/use-resume-limit"

interface PDFPreviewProps {
  resumeId: string
  resumeTitle: string
}

export function PDFPreview({ resumeId, resumeTitle }: PDFPreviewProps) {
  const [template, setTemplate] = useState<TemplateType>("harvard")
  const [generating, setGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { limitData } = useResumeLimit()
  const hasPremiumAccess = limitData?.accountType === "full"

  const generatePDFWithJsPDF = (resumeData: any, templateType: TemplateType) => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    let yPosition = 20
    let margin = 20 // Changed from const to let

    console.log("[v0] Full resume data structure:", JSON.stringify(resumeData, null, 2))

    // Helper functions for better formatting
    const addSection = (title: string, x: number, y: number, width: number = pageWidth - 2 * margin) => {
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text(title.toUpperCase(), x, y)
      doc.setLineWidth(0.5)
      doc.line(x, y + 2, x + width, y + 2)
      return y + 10
    }

    const addText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10, fontStyle = "normal") => {
      doc.setFontSize(fontSize)
      doc.setFont("helvetica", fontStyle as any)
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, x, y)
      return y + lines.length * (fontSize * 0.4) + 2
    }

    const addBulletPoint = (text: string, x: number, y: number, maxWidth: number) => {
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")
      doc.text("•", x, y)
      const lines = doc.splitTextToSize(text, maxWidth - 10)
      doc.text(lines, x + 5, y)
      return y + lines.length * 3.6 + 1
    }

    // Template-specific layouts
    switch (templateType) {
      case "harvard":
        // Harvard: Traditional academic style with clean typography
        doc.setFontSize(20)
        doc.setFont("times", "bold")
        doc.text(resumeData.personal_info?.full_name || "Name", pageWidth / 2, yPosition, { align: "center" })
        yPosition += 8

        doc.setFontSize(10)
        doc.setFont("times", "normal")
        const contactLine = [
          resumeData.personal_info?.email,
          resumeData.personal_info?.phone,
          resumeData.personal_info?.location,
        ]
          .filter(Boolean)
          .join(" • ")
        doc.text(contactLine, pageWidth / 2, yPosition, { align: "center" })
        yPosition += 15

        // Add horizontal line
        doc.setLineWidth(0.5)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 10
        break

      case "executive":
        // Executive: Professional with blue header and clean sections
        doc.setFillColor(25, 55, 109)
        doc.rect(0, 0, pageWidth, 50, "F")

        doc.setTextColor(255, 255, 255)
        doc.setFontSize(24)
        doc.setFont("helvetica", "bold")
        doc.text(resumeData.personal_info?.full_name || "Name", margin, 25)

        doc.setFontSize(12)
        doc.setFont("helvetica", "normal")
        doc.text("SENIOR PROFESSIONAL", margin, 38)

        // Contact info in white
        doc.setFontSize(9)
        const execContact = [
          resumeData.personal_info?.email,
          resumeData.personal_info?.phone,
          resumeData.personal_info?.location,
        ]
          .filter(Boolean)
          .join(" | ")
        doc.text(execContact, margin, 45)

        doc.setTextColor(0, 0, 0)
        yPosition = 65
        break

      case "creative":
        // Creative: Modern with left sidebar and accent colors
        const sidebarWidth = 65
        doc.setFillColor(52, 73, 94)
        doc.rect(0, 0, sidebarWidth, pageHeight, "F")

        // Name in sidebar
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        const nameParts = (resumeData.personal_info?.full_name || "First Last").split(" ")
        doc.text(nameParts[0] || "First", 8, 30)
        doc.text(nameParts[1] || "Last", 8, 45)

        // Contact in sidebar
        doc.setFontSize(8)
        doc.setFont("helvetica", "normal")
        let sidebarY = 65
        if (resumeData.personal_info?.email) {
          doc.text("EMAIL", 8, sidebarY)
          doc.text(resumeData.personal_info.email, 8, sidebarY + 5)
          sidebarY += 15
        }
        if (resumeData.personal_info?.phone) {
          doc.text("PHONE", 8, sidebarY)
          doc.text(resumeData.personal_info.phone, 8, sidebarY + 5)
          sidebarY += 15
        }
        if (resumeData.personal_info?.location) {
          doc.text("LOCATION", 8, sidebarY)
          doc.text(resumeData.personal_info.location, 8, sidebarY + 5)
        }

        doc.setTextColor(0, 0, 0)
        yPosition = margin
        margin = sidebarWidth + 15 // Adjust margin for main content
        break

      case "academic":
        // Academic: Formal with centered header and traditional formatting
        doc.setFontSize(18)
        doc.setFont("times", "bold")
        doc.text(resumeData.personal_info?.full_name || "Name", pageWidth / 2, yPosition, { align: "center" })
        yPosition += 6

        doc.setFontSize(10)
        doc.setFont("times", "normal")
        if (resumeData.personal_info?.email) {
          doc.text(resumeData.personal_info.email, pageWidth / 2, yPosition, { align: "center" })
          yPosition += 5
        }

        const academicContact = [resumeData.personal_info?.phone, resumeData.personal_info?.location]
          .filter(Boolean)
          .join(" • ")
        if (academicContact) {
          doc.text(academicContact, pageWidth / 2, yPosition, { align: "center" })
        }
        yPosition += 15

        // Double line separator
        doc.setLineWidth(1)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        doc.setLineWidth(0.5)
        doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2)
        yPosition += 12
        break

      case "tech":
        // Tech: Modern with accent colors and clean typography
        doc.setFontSize(22)
        doc.setFont("helvetica", "bold")
        doc.setTextColor(0, 150, 136)
        doc.text(resumeData.personal_info?.full_name || "Name", margin, yPosition)
        yPosition += 8

        doc.setTextColor(100, 100, 100)
        doc.setFontSize(14)
        doc.setFont("helvetica", "normal")
        doc.text("Full Stack Developer", margin, yPosition)
        yPosition += 12

        doc.setTextColor(0, 0, 0)
        doc.setFontSize(9)
        const techContact = [
          resumeData.personal_info?.email,
          resumeData.personal_info?.phone,
          resumeData.personal_info?.location,
        ]
          .filter(Boolean)
          .join(" | ")
        doc.text(techContact, margin, yPosition)
        yPosition += 15

        // Accent line
        doc.setDrawColor(0, 150, 136)
        doc.setLineWidth(2)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        doc.setDrawColor(0, 0, 0)
        yPosition += 12
        break

      case "classic":
        // Classic: Single-column professional style
        doc.setFontSize(20)
        doc.setFont("helvetica", "bold")
        doc.text(resumeData.personal_info?.full_name || "Name", margin, yPosition)
        yPosition += 8

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        const classicContactLine = [
          resumeData.personal_info?.email,
          resumeData.personal_info?.phone,
          resumeData.personal_info?.location,
        ]
          .filter(Boolean)
          .join(" • ")
        doc.text(classicContactLine, margin, yPosition)
        yPosition += 15

        // Add horizontal line
        doc.setLineWidth(0.5)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 10
        break

      case "modern":
        // Modern: Two-column professional style
        doc.setFontSize(20)
        doc.setFont("helvetica", "bold")
        doc.text(resumeData.personal_info?.full_name || "Name", margin, yPosition)
        yPosition += 8

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        const modernContactLine = [
          resumeData.personal_info?.email,
          resumeData.personal_info?.phone,
          resumeData.personal_info?.location,
        ]
          .filter(Boolean)
          .join(" • ")
        doc.text(modernContactLine, margin, yPosition)
        yPosition += 15

        // Add horizontal line
        doc.setLineWidth(0.5)
        doc.line(margin, yPosition, pageWidth - margin, yPosition)
        yPosition += 10
        break

      default:
        doc.setFontSize(16)
        doc.setFont("helvetica", "bold")
        doc.text(resumeData.personal_info?.full_name || "Name", margin, yPosition)
        yPosition += 15
    }

    // Add Professional Summary
    if (resumeData.summary) {
      yPosition = addSection("Professional Summary", templateType === "creative" ? margin : margin, yPosition)
      yPosition = addText(
        resumeData.summary,
        templateType === "creative" ? margin : margin,
        yPosition,
        templateType === "creative" ? pageWidth - margin : pageWidth - 2 * margin,
        10,
      )
      yPosition += 8
    }

    // Add Work Experience
    const workExperience = resumeData.work_experience || resumeData.experience || []
    console.log("[v0] Work experience data:", workExperience)
    console.log("[v0] Work experience length:", workExperience?.length)

    if (workExperience?.length > 0) {
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = margin
      }

      yPosition = addSection("Professional Experience", templateType === "creative" ? margin : margin, yPosition)

      workExperience.forEach((job: any, index: number) => {
        console.log("[v0] Processing job:", index, job)

        if (yPosition > pageHeight - 50) {
          doc.addPage()
          yPosition = margin
        }

        // Job title and company
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text(job.position || job.title || "Position", templateType === "creative" ? margin : margin, yPosition)

        // Dates on the right
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        const startDate = job.start_date || job.startDate || ""
        const endDate = job.end_date || job.endDate || "Present"
        const dateText = `${startDate} - ${endDate}`
        doc.text(dateText, templateType === "creative" ? pageWidth - 35 : pageWidth - margin, yPosition, {
          align: "right",
        })
        yPosition += 6

        // Company name
        doc.setFont("helvetica", "italic")
        doc.text(job.company || job.employer || "Company", templateType === "creative" ? margin : margin, yPosition)
        yPosition += 8

        // Job description as bullet points
        const description = job.description || job.responsibilities || ""
        if (description) {
          const bullets = description.split("\n").filter((line: string) => line.trim())
          bullets.forEach((bullet: string) => {
            yPosition = addBulletPoint(
              bullet.replace(/^[•\-*]\s*/, ""),
              templateType === "creative" ? margin : margin,
              yPosition,
              templateType === "creative" ? pageWidth - margin : pageWidth - 2 * margin,
            )
          })
        }
        yPosition += 5
      })
    } else {
      console.log("[v0] No work experience found in resume data")
    }

    if (resumeData.projects?.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = margin
      }

      yPosition = addSection("Projects", templateType === "creative" ? margin : margin, yPosition)

      resumeData.projects.forEach((project: any) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          yPosition = margin
        }

        // Project name
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text(project.name || "Project Name", templateType === "creative" ? margin : margin, yPosition)
        yPosition += 6

        // Project description
        if (project.description) {
          yPosition = addText(
            project.description,
            templateType === "creative" ? margin : margin,
            yPosition,
            templateType === "creative" ? pageWidth - margin : pageWidth - 2 * margin,
            9,
          )
        }

        // Technologies used
        if (project.technologies?.length > 0) {
          doc.setFontSize(9)
          doc.setFont("helvetica", "italic")
          doc.text(
            `Technologies: ${project.technologies.join(", ")}`,
            templateType === "creative" ? margin : margin,
            yPosition,
          )
          yPosition += 5
        }

        // Project URL
        if (project.url) {
          doc.setFontSize(9)
          doc.setFont("helvetica", "normal")
          doc.text(`URL: ${project.url}`, templateType === "creative" ? margin : margin, yPosition)
          yPosition += 5
        }

        yPosition += 3
      })
      yPosition += 5
    }

    if (resumeData.certifications?.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = margin
      }

      yPosition = addSection("Certifications", templateType === "creative" ? margin : margin, yPosition)

      resumeData.certifications.forEach((cert: any) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage()
          yPosition = margin
        }

        // Certification name
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text(cert.name || "Certification", templateType === "creative" ? margin : margin, yPosition)

        // Date on the right
        if (cert.date || cert.issue_date) {
          doc.setFont("helvetica", "normal")
          doc.setFontSize(10)
          doc.text(
            cert.date || cert.issue_date,
            templateType === "creative" ? pageWidth - 35 : pageWidth - margin,
            yPosition,
            { align: "right" },
          )
        }
        yPosition += 6

        // Issuer
        doc.setFont("helvetica", "italic")
        doc.text(cert.issuer || "Issuing Organization", templateType === "creative" ? margin : margin, yPosition)
        yPosition += 5

        // Credential ID if available
        if (cert.credential_id) {
          doc.setFontSize(9)
          doc.setFont("helvetica", "normal")
          doc.text(`ID: ${cert.credential_id}`, templateType === "creative" ? margin : margin, yPosition)
          yPosition += 5
        }

        yPosition += 3
      })
      yPosition += 5
    }

    if (resumeData.additional_sections && typeof resumeData.additional_sections === "object") {
      Object.entries(resumeData.additional_sections).forEach(([sectionName, sectionData]: [string, any]) => {
        if (!sectionData || sectionName === "metadata") return // Skip empty or metadata sections

        if (yPosition > pageHeight - 40) {
          doc.addPage()
          yPosition = margin
        }

        yPosition = addSection(
          sectionName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          templateType === "creative" ? margin : margin,
          yPosition,
        )

        if (typeof sectionData === "string") {
          yPosition = addText(
            sectionData,
            templateType === "creative" ? margin : margin,
            yPosition,
            templateType === "creative" ? pageWidth - margin : pageWidth - 2 * margin,
            10,
          )
        } else if (Array.isArray(sectionData)) {
          sectionData.forEach((item: any) => {
            if (typeof item === "string") {
              yPosition = addBulletPoint(
                item,
                templateType === "creative" ? margin : margin,
                yPosition,
                templateType === "creative" ? pageWidth - margin : pageWidth - 2 * margin,
              )
            } else if (typeof item === "object" && item.title) {
              doc.setFontSize(10)
              doc.setFont("helvetica", "bold")
              doc.text(item.title, templateType === "creative" ? margin : margin, yPosition)
              yPosition += 5
              if (item.description) {
                yPosition = addText(
                  item.description,
                  templateType === "creative" ? margin : margin,
                  yPosition,
                  templateType === "creative" ? pageWidth - margin : pageWidth - 2 * margin,
                  9,
                )
              }
            }
          })
        }
        yPosition += 5
      })
    }

    if (resumeData.skills) {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = margin
      }

      yPosition = addSection("Technical Skills", templateType === "creative" ? margin : margin, yPosition)

      if (Array.isArray(resumeData.skills)) {
        // Simple skills array
        const skillsText = resumeData.skills.join(" • ")
        yPosition = addText(
          skillsText,
          templateType === "creative" ? margin : margin,
          yPosition,
          templateType === "creative" ? pageWidth - margin : pageWidth - 2 * margin,
          10,
        )
      } else if (typeof resumeData.skills === "object") {
        // Skills object with technical/soft categories
        if (resumeData.skills.technical?.length > 0) {
          doc.setFontSize(10)
          doc.setFont("helvetica", "bold")
          doc.text("Technical Skills:", templateType === "creative" ? margin : margin, yPosition)
          yPosition += 5

          const techSkillsText = resumeData.skills.technical.join(" • ")
          yPosition = addText(
            techSkillsText,
            templateType === "creative" ? margin : margin,
            yPosition,
            templateType === "creative" ? pageWidth - margin : pageWidth - 2 * margin,
            9,
          )
          yPosition += 3
        }

        if (resumeData.skills.soft?.length > 0) {
          doc.setFontSize(10)
          doc.setFont("helvetica", "bold")
          doc.text("Soft Skills:", templateType === "creative" ? margin : margin, yPosition)
          yPosition += 5

          const softSkillsText = resumeData.skills.soft.join(" • ")
          yPosition = addText(
            softSkillsText,
            templateType === "creative" ? margin : margin,
            yPosition,
            templateType === "creative" ? pageWidth - margin : pageWidth - 2 * margin,
            9,
          )
        }
      }
      yPosition += 5
    }

    // Add Education
    if (resumeData.education?.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage()
        yPosition = margin
      }

      yPosition = addSection("Education", templateType === "creative" ? margin : margin, yPosition)

      resumeData.education.forEach((edu: any) => {
        doc.setFontSize(11)
        doc.setFont("helvetica", "bold")
        doc.text(edu.degree || "Degree", templateType === "creative" ? margin : margin, yPosition)

        if (edu.graduation_date) {
          doc.setFont("helvetica", "normal")
          doc.setFontSize(10)
          doc.text(edu.graduation_date, templateType === "creative" ? pageWidth - 35 : pageWidth - margin, yPosition, {
            align: "right",
          })
        }
        yPosition += 6

        doc.setFont("helvetica", "italic")
        doc.text(edu.school || "Institution", templateType === "creative" ? margin : margin, yPosition)
        yPosition += 10
      })
    }

    return doc
  }

  const handleGeneratePDF = async (action: "download" | "preview") => {
    setGenerating(true)
    try {
      console.log("[v0] Starting jsPDF generation with template:", template)

      // Fetch resume data from the server
      const response = await fetch(`/api/resumes/${resumeId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch resume data")
      }

      const resumeData = await response.json()
      console.log("[v0] Resume data fetched:", resumeData)

      const doc = generatePDFWithJsPDF(resumeData, template)

      if (action === "download") {
        doc.save(`${resumeTitle || "resume"}-${template}.pdf`)
      } else {
        // Create preview URL
        const pdfBlob = doc.output("blob")
        const url = URL.createObjectURL(pdfBlob)
        setPreviewUrl(url)
      }

      console.log("[v0] PDF generated successfully with template:", template)
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  const isTemplatePremium = (templateType: TemplateType) => {
    return TEMPLATE_CATEGORIES.premium.includes(templateType as any)
  }

  const canUseTemplate = (templateType: TemplateType) => {
    return !isTemplatePremium(templateType) || hasPremiumAccess
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Export
        </CardTitle>
        <CardDescription>Generate a professional PDF version of your resume</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Template Style</label>
          <Select value={template} onValueChange={(value) => setTemplate(value as TemplateType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* Free Templates */}
              <SelectItem value="harvard">
                <div className="flex items-center gap-2">
                  <span>Harvard (Traditional)</span>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">FREE</span>
                </div>
              </SelectItem>

              {/* Premium Templates */}
              <SelectItem value="executive" disabled={!canUseTemplate("executive")}>
                <div className="flex items-center gap-2">
                  <Crown className="h-3 w-3 text-amber-500" />
                  <span>Executive (Professional)</span>
                  {!hasPremiumAccess && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">PREMIUM</span>
                  )}
                </div>
              </SelectItem>

              <SelectItem value="creative" disabled={!canUseTemplate("creative")}>
                <div className="flex items-center gap-2">
                  <Crown className="h-3 w-3 text-amber-500" />
                  <span>Creative (Modern Design)</span>
                  {!hasPremiumAccess && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">PREMIUM</span>
                  )}
                </div>
              </SelectItem>

              <SelectItem value="academic" disabled={!canUseTemplate("academic")}>
                <div className="flex items-center gap-2">
                  <Crown className="h-3 w-3 text-amber-500" />
                  <span>Academic (Research Focused)</span>
                  {!hasPremiumAccess && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">PREMIUM</span>
                  )}
                </div>
              </SelectItem>

              <SelectItem value="tech" disabled={!canUseTemplate("tech")}>
                <div className="flex items-center gap-2">
                  <Crown className="h-3 w-3 text-amber-500" />
                  <span>Tech (Developer Focused)</span>
                  {!hasPremiumAccess && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">PREMIUM</span>
                  )}
                </div>
              </SelectItem>

              <SelectItem value="classic" disabled={!canUseTemplate("classic")}>
                <div className="flex items-center gap-2">
                  <Crown className="h-3 w-3 text-amber-500" />
                  <span>Classic (Single Column)</span>
                  {!hasPremiumAccess && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">PREMIUM</span>
                  )}
                </div>
              </SelectItem>

              <SelectItem value="modern" disabled={!canUseTemplate("modern")}>
                <div className="flex items-center gap-2">
                  <Crown className="h-3 w-3 text-amber-500" />
                  <span>Modern (Two Column)</span>
                  {!hasPremiumAccess && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">PREMIUM</span>
                  )}
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {isTemplatePremium(template) && !hasPremiumAccess && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 text-sm">
                <Crown className="h-4 w-4" />
                <span>This template requires premium access. Upgrade to unlock all professional templates.</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleGeneratePDF("preview")}
            disabled={generating || !canUseTemplate(template)}
            variant="outline"
            className="flex-1"
          >
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
            Preview
          </Button>

          <Button
            onClick={() => handleGeneratePDF("download")}
            disabled={generating || !canUseTemplate(template)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Download PDF
          </Button>
        </div>

        {previewUrl && (
          <div className="mt-4">
            <iframe src={previewUrl} className="w-full h-96 border rounded-lg" title="PDF Preview" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Eye, FileText, Loader2 } from "lucide-react"

interface PDFPreviewProps {
  resumeId: string
  resumeTitle: string
}

export function PDFPreview({ resumeId, resumeTitle }: PDFPreviewProps) {
  const [template, setTemplate] = useState("modern")
  const [generating, setGenerating] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleGeneratePDF = async (action: "download" | "preview") => {
    setGenerating(true)
    try {
      console.log("[v0] Starting client-side PDF generation")

      // Dynamic import of jsPDF to avoid SSR issues
      const { jsPDF } = await import("jspdf")

      // Fetch resume data from the server
      const response = await fetch(`/api/resumes/${resumeId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch resume data")
      }

      const resumeData = await response.json()
      console.log("[v0] Resume data fetched:", resumeData)

      // Create new PDF document with Harvard specifications
      const doc = new jsPDF()

      doc.setFont("helvetica") // Harvard-approved font

      let yPosition = 20
      const pageWidth = doc.internal.pageSize.width
      const margin = 20 // 1 inch margins as per Harvard specs
      const contentWidth = pageWidth - margin * 2

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 11) => {
        doc.setFontSize(fontSize)
        const lines = doc.splitTextToSize(text, maxWidth)
        doc.text(lines, x, y)
        return y + lines.length * (fontSize * 0.35) + 2 // Proper line spacing
      }

      // Helper function to add bullet points
      const addBulletPoint = (text: string, x: number, y: number, maxWidth: number, fontSize = 11) => {
        doc.setFontSize(fontSize)
        doc.text("•", x, y)
        const lines = doc.splitTextToSize(text, maxWidth - 10)
        doc.text(lines, x + 8, y)
        return y + lines.length * (fontSize * 0.35) + 2
      }

      doc.setFontSize(15)
      doc.setFont("helvetica", "bold")
      const name = resumeData.personal_info?.full_name || "Resume"
      const nameWidth = doc.getTextWidth(name)
      doc.text(name, (pageWidth - nameWidth) / 2, yPosition)
      yPosition += 8

      if (resumeData.personal_info) {
        const contact = resumeData.personal_info
        doc.setFontSize(11)
        doc.setFont("helvetica", "normal")

        const contactParts = []
        if (contact.location) contactParts.push(contact.location)
        if (contact.phone) contactParts.push(contact.phone)
        if (contact.email) contactParts.push(contact.email)

        const contactLine = contactParts.join(" | ")
        const contactWidth = doc.getTextWidth(contactLine)
        doc.text(contactLine, (pageWidth - contactWidth) / 2, yPosition)
        yPosition += 12
      }

      if (resumeData.summary) {
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("SUMMARY", margin, yPosition)
        yPosition += 6

        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)
        yPosition = addWrappedText(resumeData.summary, margin, yPosition, contentWidth, 11)
        yPosition += 8
      }

      if (resumeData.skills) {
        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("SKILLS", margin, yPosition)
        yPosition += 6

        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)

        // Technical skills with bullet point
        if (resumeData.skills.technical && resumeData.skills.technical.length > 0) {
          const techSkills = `Tools & Techs: ${resumeData.skills.technical.join(", ")}`
          yPosition = addBulletPoint(techSkills, margin, yPosition, contentWidth, 11)
        }

        // Soft skills with bullet point
        if (resumeData.skills.soft && resumeData.skills.soft.length > 0) {
          const softSkills = `Soft Skills: ${resumeData.skills.soft.join(", ")}`
          yPosition = addBulletPoint(softSkills, margin, yPosition, contentWidth, 11)
        }
        yPosition += 6
      }

      if (resumeData.experience && resumeData.experience.length > 0) {
        // Check if we need a new page
        if (yPosition > 220) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("PROFESSIONAL EXPERIENCE", margin, yPosition)
        yPosition += 6

        resumeData.experience.forEach((job: any) => {
          // Check if we need a new page
          if (yPosition > 240) {
            doc.addPage()
            yPosition = 20
          }

          // Company name and dates on same line
          doc.setFontSize(11)
          doc.setFont("helvetica", "bold")
          const companyName = job.company || "Company"
          doc.text(companyName, margin, yPosition)

          // Right-align dates
          const dates = `${job.start_date || ""} - ${job.end_date || "Present"}`
          const dateWidth = doc.getTextWidth(dates)
          doc.text(dates, pageWidth - margin - dateWidth, yPosition)
          yPosition += 4

          // Job title and location
          doc.setFont("helvetica", "normal")
          const jobTitle = job.title || "Position"
          doc.text(jobTitle, margin, yPosition)

          if (job.location) {
            const locationWidth = doc.getTextWidth(job.location)
            doc.text(job.location, pageWidth - margin - locationWidth, yPosition)
          }
          yPosition += 4

          // Job description with bullet points
          if (job.description) {
            const descriptions = job.description.split("\n").filter((desc: string) => desc.trim())
            descriptions.forEach((desc: string) => {
              yPosition = addBulletPoint(desc.trim(), margin, yPosition, contentWidth, 11)
            })
          }
          yPosition += 4
        })
      }

      if (resumeData.education && resumeData.education.length > 0) {
        if (yPosition > 200) {
          doc.addPage()
          yPosition = 20
        }

        doc.setFontSize(12)
        doc.setFont("helvetica", "bold")
        doc.text("EDUCATION", margin, yPosition)
        yPosition += 6

        resumeData.education.forEach((edu: any) => {
          doc.setFontSize(11)
          doc.setFont("helvetica", "bold")
          const schoolName = edu.school || "School"
          doc.text(schoolName, margin, yPosition)

          // Right-align graduation year
          if (edu.graduation_date) {
            const year = edu.graduation_date.split("-")[0] || edu.graduation_date
            const yearWidth = doc.getTextWidth(year)
            doc.text(year, pageWidth - margin - yearWidth, yPosition)
          }
          yPosition += 4

          doc.setFont("helvetica", "normal")
          if (edu.degree) {
            doc.text(edu.degree, margin, yPosition)
            yPosition += 4
          }

          // Add coursework or additional details if available
          if (edu.field_of_study && edu.field_of_study !== edu.degree) {
            yPosition = addBulletPoint(`Coursework: ${edu.field_of_study}`, margin, yPosition, contentWidth, 11)
          }
          yPosition += 4
        })
      }

      const pdfBlob = doc.output("blob")

      if (action === "download") {
        // Create download link
        const url = URL.createObjectURL(pdfBlob)
        const link = document.createElement("a")
        link.href = url
        link.download = `${resumeTitle || "resume"}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      } else {
        // Create preview URL
        const url = URL.createObjectURL(pdfBlob)
        setPreviewUrl(url)
      }

      console.log("[v0] PDF generated successfully")
    } catch (error) {
      console.error("[v0] Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setGenerating(false)
    }
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
          <Select value={template} onValueChange={setTemplate}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="modern">Modern (Two-column)</SelectItem>
              <SelectItem value="classic">Classic (Single-column)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => handleGeneratePDF("preview")}
            disabled={generating}
            variant="outline"
            className="flex-1"
          >
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Eye className="h-4 w-4 mr-2" />}
            Preview
          </Button>

          <Button
            onClick={() => handleGeneratePDF("download")}
            disabled={generating}
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

import { type NextRequest, NextResponse } from "next/server"
import jsPDF from "jspdf"
import { createClient } from "@/lib/supabase/server"

console.log("[v0] PDF API route loaded")

type TemplateType = "harvard" | "executive" | "creative" | "academic" | "tech" | "classic" | "modern"

const generatePDFWithJsPDF = (resumeData: any, templateType: TemplateType) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20
  const margin = 20

  const personalInfo = resumeData.additional_sections?.personal_info || {}
  const summary = resumeData.additional_sections?.summary || resumeData.summary || ""

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
      doc.setFontSize(20)
      doc.setFont("times", "bold")
      doc.text(personalInfo.full_name || "Name", pageWidth / 2, yPosition, { align: "center" })
      yPosition += 8

      doc.setFontSize(10)
      doc.setFont("times", "normal")
      const contactLine = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(" • ")
      doc.text(contactLine, pageWidth / 2, yPosition, { align: "center" })
      yPosition += 15

      doc.setLineWidth(0.5)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 10
      break

    case "executive":
      doc.setFillColor(25, 55, 109)
      doc.rect(0, 0, pageWidth, 50, "F")

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(24)
      doc.setFont("helvetica", "bold")
      doc.text(personalInfo.full_name || "Name", margin, 25)

      doc.setFontSize(12)
      doc.setFont("helvetica", "normal")
      doc.text("SENIOR PROFESSIONAL", margin, 38)

      doc.setFontSize(9)
      const execContact = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(" | ")
      doc.text(execContact, margin, 45)

      doc.setTextColor(0, 0, 0)
      yPosition = 65
      break

    default:
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.text(personalInfo.full_name || "Name", margin, yPosition)
      yPosition += 15
  }

  // Add Professional Summary
  if (summary) {
    yPosition = addSection("Professional Summary", margin, yPosition)
    yPosition = addText(summary, margin, yPosition, pageWidth - 2 * margin, 10)
    yPosition += 8
  }

  // Add Work Experience
  const workExperience = resumeData.work_experience || resumeData.experience || []
  if (workExperience?.length > 0) {
    if (yPosition > pageHeight - 60) {
      doc.addPage()
      yPosition = margin
    }

    yPosition = addSection("Professional Experience", margin, yPosition)

    workExperience.forEach((job: any) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage()
        yPosition = margin
      }

      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text(job.position || job.title || "Position", margin, yPosition)

      doc.setFont("helvetica", "normal")
      doc.setFontSize(10)
      const startDate = job.start_date || job.startDate || ""
      const endDate = job.end_date || job.endDate || "Present"
      const dateText = `${startDate} - ${endDate}`
      doc.text(dateText, pageWidth - margin, yPosition, { align: "right" })
      yPosition += 6

      doc.setFont("helvetica", "italic")
      doc.text(job.company || job.employer || "Company", margin, yPosition)
      yPosition += 8

      const description = job.description || job.responsibilities || ""
      if (description) {
        const bullets = description.split("\n").filter((line: string) => line.trim())
        bullets.forEach((bullet: string) => {
          yPosition = addBulletPoint(bullet.replace(/^[•\-*]\s*/, ""), margin, yPosition, pageWidth - 2 * margin)
        })
      }
      yPosition += 5
    })
  }

  // Add Education
  if (resumeData.education?.length > 0) {
    if (yPosition > pageHeight - 40) {
      doc.addPage()
      yPosition = margin
    }

    yPosition = addSection("Education", margin, yPosition)

    let educationArray = resumeData.education

    // Check if education is stored as a JSON string
    if (typeof educationArray === "string") {
      try {
        educationArray = JSON.parse(educationArray)
      } catch (e) {
        console.log("[v0] Failed to parse education JSON string, treating as single entry")
        educationArray = [{ degree: educationArray, school: "", graduation_date: "" }]
      }
    }

    // Ensure we have an array
    if (!Array.isArray(educationArray)) {
      educationArray = [educationArray]
    }

    educationArray.forEach((edu: any) => {
      let degree = edu.degree || "Degree"
      let school = edu.school || "Institution"
      let graduationDate = edu.graduation_date || ""

      // Handle cases where individual fields might contain JSON
      if (typeof degree === "string" && degree.startsWith("[{")) {
        try {
          const parsedEducation = JSON.parse(degree)
          if (Array.isArray(parsedEducation) && parsedEducation.length > 0) {
            degree = parsedEducation[0].degree || "Degree"
            school = parsedEducation[0].school || school
            graduationDate = parsedEducation[0].graduation_date || graduationDate
          }
        } catch (e) {
          // If parsing fails, clean up the string
          degree = degree.replace(/^\[\{.*?"degree":\s*"([^"]+)".*$/, "$1") || degree
        }
      }

      doc.setFontSize(11)
      doc.setFont("helvetica", "bold")
      doc.text(degree, margin, yPosition)

      if (graduationDate) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.text(graduationDate, pageWidth - margin, yPosition, { align: "right" })
      }
      yPosition += 6

      doc.setFont("helvetica", "italic")
      doc.text(school, margin, yPosition)
      yPosition += 10
    })
  }

  // Add Skills
  if (resumeData.skills) {
    if (yPosition > pageHeight - 40) {
      doc.addPage()
      yPosition = margin
    }

    yPosition = addSection("Technical Skills", margin, yPosition)

    if (Array.isArray(resumeData.skills)) {
      const skillsText = resumeData.skills.join(" • ")
      yPosition = addText(skillsText, margin, yPosition, pageWidth - 2 * margin, 10)
    } else if (typeof resumeData.skills === "object") {
      if (resumeData.skills.technical?.length > 0) {
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text("Technical Skills:", margin, yPosition)
        yPosition += 5

        const techSkillsText = resumeData.skills.technical.join(" • ")
        yPosition = addText(techSkillsText, margin, yPosition, pageWidth - 2 * margin, 9)
        yPosition += 3
      }

      if (resumeData.skills.soft?.length > 0) {
        doc.setFontSize(10)
        doc.setFont("helvetica", "bold")
        doc.text("Soft Skills:", margin, yPosition)
        yPosition += 5

        const softSkillsText = resumeData.skills.soft.join(" • ")
        yPosition = addText(softSkillsText, margin, yPosition, pageWidth - 2 * margin, 9)
      }
    }
  }

  return doc
}

export async function POST(request: NextRequest) {
  console.log("[v0] PDF API POST method called")

  try {
    console.log("[v0] Processing request...")
    const body = await request.json()
    console.log("[v0] Request body:", body)

    const { resumeId, template = "harvard" } = body

    if (!resumeId) {
      return NextResponse.json({ error: "Resume ID is required" }, { status: 400 })
    }

    // Fetch resume data from database
    const supabase = await createClient()
    const { data: resumeData, error } = await supabase.from("resumes").select("*").eq("id", resumeId).single()

    if (error || !resumeData) {
      console.error("[v0] Error fetching resume:", error)
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    console.log("[v0] Resume data keys:", Object.keys(resumeData))
    console.log("[v0] Resume data structure:", JSON.stringify(resumeData, null, 2))
    console.log("[v0] Personal info check:", resumeData.additional_sections?.personal_info)
    console.log("[v0] Full name check:", resumeData.additional_sections?.personal_info?.full_name)
    console.log("[v0] Email check:", resumeData.additional_sections?.personal_info?.email)

    console.log("[v0] Resume data fetched, generating PDF...")

    // Generate PDF using jsPDF
    const doc = generatePDFWithJsPDF(resumeData, template as TemplateType)
    const pdfBuffer = doc.output("arraybuffer")

    console.log("[v0] PDF generated successfully")

    // Return PDF as binary response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${resumeData.title || "resume"}-${template}.pdf"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] API Error:", error)
    console.error("[v0] Error stack:", error instanceof Error ? error.stack : "Unknown error")
    return NextResponse.json(
      {
        error: "PDF generation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  console.log("[v0] PDF API GET method called")
  return NextResponse.json({ message: "PDF API route is accessible" }, { status: 200 })
}

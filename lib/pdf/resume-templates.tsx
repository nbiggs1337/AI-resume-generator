import type React from "react"
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"

// Register fonts for better typography
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2",
      fontWeight: 700,
    },
  ],
})

// Harvard Template Styles (Traditional Academic)
const harvardStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 72,
    fontFamily: "Times-Roman",
    fontSize: 11,
    lineHeight: 1.2,
  },
  name: {
    fontSize: 16,
    fontWeight: 700,
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 10,
    color: "#000000",
    textAlign: "center",
    marginBottom: 16,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#000000",
    marginBottom: 6,
    textTransform: "uppercase",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 2,
  },
  jobHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#000000",
  },
  company: {
    fontSize: 11,
    fontStyle: "italic",
    color: "#000000",
  },
  dates: {
    fontSize: 10,
    color: "#000000",
  },
  description: {
    fontSize: 10,
    color: "#000000",
    lineHeight: 1.3,
    marginLeft: 12,
  },
})

// Executive Template Styles (Sophisticated Professional)
const executiveStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 50,
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    backgroundColor: "#1e293b",
    color: "#ffffff",
    padding: 20,
    marginBottom: 20,
    marginLeft: -50,
    marginRight: -50,
    marginTop: -50,
  },
  name: {
    fontSize: 28,
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    color: "#94a3b8",
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 10,
    color: "#cbd5e1",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 4,
  },
  experienceItem: {
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#e2e8f0",
  },
})

// Creative Template Styles (Modern Design)
const creativeStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.4,
  },
  sidebar: {
    backgroundColor: "#0f172a",
    color: "#ffffff",
    padding: 20,
    marginLeft: -30,
    marginTop: -30,
    marginBottom: -30,
    width: 180,
  },
  mainContent: {
    flex: 1,
    paddingLeft: 200,
    marginTop: -30,
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 16,
  },
  sidebarSection: {
    marginBottom: 20,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#3b82f6",
    marginBottom: 8,
    textTransform: "uppercase",
  },
  skillBar: {
    backgroundColor: "#1e293b",
    height: 4,
    marginBottom: 6,
    borderRadius: 2,
  },
  skillFill: {
    backgroundColor: "#3b82f6",
    height: 4,
    borderRadius: 2,
  },
})

// Academic Template Styles (Research Focused)
const academicStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 60,
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.4,
  },
  name: {
    fontSize: 20,
    fontWeight: 700,
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 6,
  },
  credentials: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    fontSize: 9,
    color: "#64748b",
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  publicationItem: {
    marginBottom: 8,
    paddingLeft: 8,
  },
  publicationTitle: {
    fontSize: 10,
    fontWeight: 600,
    color: "#1e293b",
    fontStyle: "italic",
  },
  publicationDetails: {
    fontSize: 9,
    color: "#64748b",
  },
})

// Tech Template Styles (Developer Focused)
const techStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fafafa",
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    backgroundColor: "#000000",
    color: "#ffffff",
    padding: 25,
    marginLeft: -40,
    marginRight: -40,
    marginTop: -40,
    marginBottom: 20,
  },
  name: {
    fontSize: 26,
    fontWeight: 700,
    color: "#ffffff",
    marginBottom: 6,
  },
  role: {
    fontSize: 14,
    color: "#10b981",
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: "row",
    gap: 15,
    fontSize: 10,
    color: "#d1d5db",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#000000",
    marginBottom: 10,
    backgroundColor: "#f3f4f6",
    padding: 8,
    marginLeft: -8,
    marginRight: -8,
  },
  techStack: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  techItem: {
    backgroundColor: "#000000",
    color: "#ffffff",
    padding: "4 8",
    fontSize: 8,
    borderRadius: 3,
  },
  projectItem: {
    backgroundColor: "#ffffff",
    padding: 12,
    marginBottom: 10,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
})

interface ResumeData {
  personal_info: {
    full_name: string
    email: string
    phone: string
    location: string
    linkedin?: string
    website?: string
  }
  summary: string
  experience: Array<{
    title: string
    company: string
    location: string
    start_date: string
    end_date: string
    description: string
  }>
  education: Array<{
    degree: string
    school: string
    location: string
    graduation_date: string
    gpa?: string
  }>
  skills: {
    technical: string[]
    soft: string[]
  }
  projects?: Array<{
    name: string
    description: string
    technologies: string[]
    url?: string
  }>
  certifications?: Array<{
    name: string
    issuer: string
    date: string
  }>
  work_experience?: Array<{
    title: string
    company: string
    location: string
    start_date: string
    end_date: string
    description: string
  }>
}

export const HarvardResumeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={harvardStyles.page}>
      {/* Header */}
      <View style={{ marginBottom: 20 }}>
        <Text style={harvardStyles.name}>{data.personal_info.full_name}</Text>
        <Text style={harvardStyles.contactInfo}>
          {data.personal_info.location} • {data.personal_info.phone} • {data.personal_info.email}
          {data.personal_info.linkedin && ` • ${data.personal_info.linkedin}`}
        </Text>
      </View>

      {/* Summary */}
      {data.summary && (
        <View style={harvardStyles.section}>
          <Text style={harvardStyles.sectionTitle}>Summary</Text>
          <Text style={harvardStyles.description}>{data.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View style={harvardStyles.section}>
          <Text style={harvardStyles.sectionTitle}>Experience</Text>
          {data.experience.map((exp, index) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <View style={harvardStyles.jobHeader}>
                <Text style={harvardStyles.jobTitle}>{exp.title}</Text>
                <Text style={harvardStyles.dates}>
                  {exp.start_date} - {exp.end_date}
                </Text>
              </View>
              <Text style={harvardStyles.company}>
                {exp.company}, {exp.location}
              </Text>
              <Text style={harvardStyles.description}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <View style={harvardStyles.section}>
          <Text style={harvardStyles.sectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <View style={harvardStyles.jobHeader}>
                <Text style={harvardStyles.jobTitle}>{edu.degree}</Text>
                <Text style={harvardStyles.dates}>{edu.graduation_date}</Text>
              </View>
              <Text style={harvardStyles.company}>
                {edu.school}, {edu.location}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills && (data.skills.technical?.length > 0 || data.skills.soft?.length > 0) && (
        <View style={harvardStyles.section}>
          <Text style={harvardStyles.sectionTitle}>Skills</Text>
          {data.skills.technical && data.skills.technical.length > 0 && (
            <Text style={harvardStyles.description}>Technical: {data.skills.technical.join(", ")}</Text>
          )}
          {data.skills.soft && data.skills.soft.length > 0 && (
            <Text style={[harvardStyles.description, { marginTop: 4 }]}>
              Soft Skills: {data.skills.soft.join(", ")}
            </Text>
          )}
        </View>
      )}
    </Page>
  </Document>
)

export const ExecutiveResumeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={executiveStyles.page}>
      {/* Header */}
      <View style={executiveStyles.header}>
        <Text style={executiveStyles.name}>{data.personal_info?.full_name || "Name"}</Text>
        <Text style={executiveStyles.title}>Senior Executive</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", fontSize: 10, color: "#cbd5e1" }}>
          <Text>{data.personal_info?.email || ""}</Text>
          <Text>{data.personal_info?.phone || ""}</Text>
          <Text>{data.personal_info?.location || ""}</Text>
        </View>
      </View>

      {/* Executive Summary */}
      {data.summary && (
        <View style={executiveStyles.section}>
          <Text style={executiveStyles.sectionTitle}>Executive Summary</Text>
          <Text style={{ fontSize: 11, lineHeight: 1.5, color: "#374151" }}>{data.summary}</Text>
        </View>
      )}

      {/* Professional Experience */}
      {(data.work_experience || data.experience) && (
        <View style={executiveStyles.section}>
          <Text style={executiveStyles.sectionTitle}>Professional Experience</Text>
          {(data.work_experience || data.experience || []).map((exp: any, index: number) => (
            <View
              key={index}
              style={{ marginBottom: 16, paddingLeft: 12, borderLeftWidth: 3, borderLeftColor: "#e2e8f0" }}
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{exp.title || ""}</Text>
                <Text style={{ fontSize: 10, color: "#64748b" }}>
                  {exp.start_date || ""} - {exp.end_date || ""}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: "#3b82f6", marginBottom: 6 }}>
                {exp.company || ""} | {exp.location || ""}
              </Text>
              <Text style={{ fontSize: 10, lineHeight: 1.4, color: "#374151" }}>{exp.description || ""}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Education & Skills */}
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1, marginRight: 15 }}>
          {data.education && data.education.length > 0 && (
            <View style={executiveStyles.section}>
              <Text style={executiveStyles.sectionTitle}>Education</Text>
              {data.education.map((edu: any, index: number) => (
                <View key={index} style={{ marginBottom: 8 }}>
                  <Text style={{ fontSize: 11, fontWeight: 600, color: "#1e293b" }}>{edu.degree || ""}</Text>
                  <Text style={{ fontSize: 10, color: "#64748b" }}>{edu.school || ""}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={{ flex: 1 }}>
          {data.skills && (
            <View style={executiveStyles.section}>
              <Text style={executiveStyles.sectionTitle}>Core Competencies</Text>
              {Array.isArray(data.skills) ? (
                <Text style={{ fontSize: 10, lineHeight: 1.4, color: "#374151" }}>{data.skills.join(" • ")}</Text>
              ) : (
                <View>
                  {data.skills.technical && data.skills.technical.length > 0 && (
                    <Text style={{ fontSize: 10, lineHeight: 1.4, color: "#374151" }}>
                      {data.skills.technical.join(" • ")}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Page>
  </Document>
)

export const CreativeResumeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <Document>
    <Page
      size="A4"
      style={{ flexDirection: "row", backgroundColor: "#ffffff", padding: 0, fontFamily: "Inter", fontSize: 10 }}
    >
      {/* Sidebar */}
      <View style={{ backgroundColor: "#0f172a", color: "#ffffff", padding: 20, width: 180 }}>
        <Text style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", marginBottom: 8 }}>
          {data.personal_info?.full_name || "Name"}
        </Text>
        <Text style={{ fontSize: 12, color: "#64748b", marginBottom: 16 }}>Creative Professional</Text>

        {/* Contact */}
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", marginBottom: 8, textTransform: "uppercase" }}
          >
            Contact
          </Text>
          <Text style={{ fontSize: 9, color: "#cbd5e1", marginBottom: 2 }}>{data.personal_info?.email || ""}</Text>
          <Text style={{ fontSize: 9, color: "#cbd5e1", marginBottom: 2 }}>{data.personal_info?.phone || ""}</Text>
          <Text style={{ fontSize: 9, color: "#cbd5e1" }}>{data.personal_info?.location || ""}</Text>
        </View>

        {/* Skills */}
        {data.skills && (data.skills.technical || data.skills.soft) && (
          <View style={{ marginBottom: 20 }}>
            <Text
              style={{ fontSize: 12, fontWeight: 600, color: "#3b82f6", marginBottom: 8, textTransform: "uppercase" }}
            >
              Skills
            </Text>
            {data.skills.technical &&
              data.skills.technical.slice(0, 6).map((skill: string, index: number) => (
                <Text key={index} style={{ fontSize: 9, color: "#cbd5e1", marginBottom: 4 }}>
                  {skill}
                </Text>
              ))}
          </View>
        )}
      </View>

      {/* Main Content */}
      <View style={{ flex: 1, padding: 30 }}>
        {/* Summary */}
        {data.summary && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>About Me</Text>
            <Text style={{ fontSize: 10, lineHeight: 1.5, color: "#374151" }}>{data.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {(data.work_experience || data.experience) && (
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>Experience</Text>
            {(data.work_experience || data.experience || []).map((exp: any, index: number) => (
              <View key={index} style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 12, fontWeight: 700, color: "#1e293b" }}>{exp.title || ""}</Text>
                <Text style={{ fontSize: 11, color: "#3b82f6", marginBottom: 4 }}>{exp.company || ""}</Text>
                <Text style={{ fontSize: 9, color: "#64748b", marginBottom: 6 }}>
                  {exp.start_date || ""} - {exp.end_date || ""}
                </Text>
                <Text style={{ fontSize: 10, lineHeight: 1.4, color: "#374151" }}>{exp.description || ""}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <View>
            <Text style={{ fontSize: 16, fontWeight: 700, color: "#1e293b", marginBottom: 12 }}>Education</Text>
            {data.education.map((edu: any, index: number) => (
              <View key={index} style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: 600, color: "#1e293b" }}>{edu.degree || ""}</Text>
                <Text style={{ fontSize: 10, color: "#64748b" }}>
                  {edu.school || ""} • {edu.graduation_date || ""}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Page>
  </Document>
)

export const AcademicResumeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={academicStyles.page}>
      {/* Header */}
      <View style={{ marginBottom: 24 }}>
        <Text style={academicStyles.name}>{data.personal_info.full_name}</Text>
        <Text style={academicStyles.credentials}>Ph.D. Candidate</Text>
        <View style={academicStyles.contactInfo}>
          <Text>{data.personal_info.email}</Text>
          <Text>{data.personal_info.phone}</Text>
          <Text>{data.personal_info.location}</Text>
        </View>
      </View>

      {/* Research Interests */}
      {data.summary && (
        <View style={academicStyles.section}>
          <Text style={academicStyles.sectionTitle}>Research Interests</Text>
          <Text style={{ fontSize: 10, lineHeight: 1.5, color: "#374151" }}>{data.summary}</Text>
        </View>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <View style={academicStyles.section}>
          <Text style={academicStyles.sectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 11, fontWeight: 600, color: "#1e293b" }}>{edu.degree}</Text>
              <Text style={{ fontSize: 10, color: "#64748b" }}>
                {edu.school}, {edu.location}
              </Text>
              {edu.gpa && <Text style={{ fontSize: 9, color: "#64748b" }}>GPA: {edu.gpa}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Academic Experience */}
      {data.experience && data.experience.length > 0 && (
        <View style={academicStyles.section}>
          <Text style={academicStyles.sectionTitle}>Academic Experience</Text>
          {data.experience.map((exp, index) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 2 }}>
                <Text style={{ fontSize: 11, fontWeight: 600, color: "#1e293b" }}>{exp.title}</Text>
                <Text style={{ fontSize: 9, color: "#64748b" }}>
                  {exp.start_date} - {exp.end_date}
                </Text>
              </View>
              <Text style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>{exp.company}</Text>
              <Text style={{ fontSize: 9, lineHeight: 1.4, color: "#374151" }}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Publications (placeholder) */}
      <View style={academicStyles.section}>
        <Text style={academicStyles.sectionTitle}>Selected Publications</Text>
        <View style={academicStyles.publicationItem}>
          <Text style={academicStyles.publicationTitle}>"Advanced Research in Applied Sciences"</Text>
          <Text style={academicStyles.publicationDetails}>Journal of Academic Research, Vol. 15, 2024</Text>
        </View>
      </View>

      {/* Skills */}
      {data.skills && data.skills.technical?.length > 0 && (
        <View style={academicStyles.section}>
          <Text style={academicStyles.sectionTitle}>Technical Skills</Text>
          <Text style={{ fontSize: 10, lineHeight: 1.4, color: "#374151" }}>{data.skills.technical.join(" • ")}</Text>
        </View>
      )}
    </Page>
  </Document>
)

export const TechResumeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={techStyles.page}>
      {/* Header */}
      <View style={techStyles.header}>
        <Text style={techStyles.name}>{data.personal_info.full_name}</Text>
        <Text style={techStyles.role}>Full Stack Developer</Text>
        <View style={techStyles.contactInfo}>
          <Text>{data.personal_info.email}</Text>
          <Text>{data.personal_info.phone}</Text>
          <Text>{data.personal_info.location}</Text>
          {data.personal_info.website && <Text>{data.personal_info.website}</Text>}
        </View>
      </View>

      {/* Tech Stack */}
      {data.skills && data.skills.technical?.length > 0 && (
        <View style={techStyles.section}>
          <Text style={techStyles.sectionTitle}>Tech Stack</Text>
          <View style={techStyles.techStack}>
            {data.skills.technical.map((skill, index) => (
              <Text key={index} style={techStyles.techItem}>
                {skill}
              </Text>
            ))}
          </View>
        </View>
      )}

      {/* Summary */}
      {data.summary && (
        <View style={techStyles.section}>
          <Text style={techStyles.sectionTitle}>About</Text>
          <Text style={{ fontSize: 10, lineHeight: 1.5, color: "#374151" }}>{data.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View style={techStyles.section}>
          <Text style={techStyles.sectionTitle}>Experience</Text>
          {data.experience.map((exp, index) => (
            <View key={index} style={techStyles.projectItem}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 12, fontWeight: 700, color: "#000000" }}>{exp.title}</Text>
                <Text style={{ fontSize: 9, color: "#64748b" }}>
                  {exp.start_date} - {exp.end_date}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: "#10b981", marginBottom: 6 }}>{exp.company}</Text>
              <Text style={{ fontSize: 10, lineHeight: 1.4, color: "#374151" }}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Projects (if available) */}
      {data.projects && data.projects.length > 0 && (
        <View style={techStyles.section}>
          <Text style={techStyles.sectionTitle}>Featured Projects</Text>
          {data.projects.slice(0, 3).map((project, index) => (
            <View key={index} style={techStyles.projectItem}>
              <Text style={{ fontSize: 12, fontWeight: 700, color: "#000000", marginBottom: 4 }}>{project.name}</Text>
              <Text style={{ fontSize: 10, lineHeight: 1.4, color: "#374151", marginBottom: 6 }}>
                {project.description}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
                {project.technologies.map((tech, techIndex) => (
                  <Text key={techIndex} style={[techStyles.techItem, { fontSize: 7 }]}>
                    {tech}
                  </Text>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <View style={techStyles.section}>
          <Text style={techStyles.sectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: 600, color: "#000000" }}>{edu.degree}</Text>
              <Text style={{ fontSize: 10, color: "#64748b" }}>
                {edu.school} • {edu.graduation_date}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Page>
  </Document>
)

const commonStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 40,
    fontFamily: "Inter",
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  name: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1e293b",
    marginBottom: 5,
  },
  contactInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 9,
    color: "#64748b",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summary: {
    fontSize: 10,
    color: "#374151",
    lineHeight: 1.5,
    textAlign: "justify",
  },
  experienceItem: {
    marginBottom: 12,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 600,
    color: "#1e293b",
  },
  company: {
    fontSize: 10,
    color: "#2563eb",
    fontWeight: 500,
  },
  dateLocation: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 4,
  },
  description: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.4,
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillItem: {
    backgroundColor: "#f1f5f9",
    padding: "4 8",
    borderRadius: 4,
    fontSize: 9,
    color: "#475569",
  },
  educationItem: {
    marginBottom: 8,
  },
  degree: {
    fontSize: 11,
    fontWeight: 600,
    color: "#1e293b",
  },
  school: {
    fontSize: 10,
    color: "#2563eb",
    fontWeight: 500,
  },
  twoColumn: {
    flexDirection: "row",
    gap: 20,
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
  },
})

export const ModernResumeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={commonStyles.page}>
      {/* Header */}
      <View style={commonStyles.header}>
        <Text style={commonStyles.name}>{data.personal_info.full_name}</Text>
        <View style={commonStyles.contactInfo}>
          <Text>{data.personal_info.email}</Text>
          <Text>{data.personal_info.phone}</Text>
          <Text>{data.personal_info.location}</Text>
        </View>
        {(data.personal_info.linkedin || data.personal_info.website) && (
          <View style={[commonStyles.contactInfo, { marginTop: 3 }]}>
            {data.personal_info.linkedin && <Text>{data.personal_info.linkedin}</Text>}
            {data.personal_info.website && <Text>{data.personal_info.website}</Text>}
          </View>
        )}
      </View>

      {/* Summary */}
      {data.summary && (
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Professional Summary</Text>
          <Text style={commonStyles.summary}>{data.summary}</Text>
        </View>
      )}

      {/* Two Column Layout */}
      <View style={commonStyles.twoColumn}>
        {/* Left Column - Experience */}
        <View style={commonStyles.leftColumn}>
          {data.experience && data.experience.length > 0 && (
            <View style={commonStyles.section}>
              <Text style={commonStyles.sectionTitle}>Experience</Text>
              {data.experience.map((exp, index) => (
                <View key={index} style={commonStyles.experienceItem}>
                  <Text style={commonStyles.jobTitle}>{exp.title}</Text>
                  <Text style={commonStyles.company}>{exp.company}</Text>
                  <Text style={commonStyles.dateLocation}>
                    {exp.start_date} - {exp.end_date} | {exp.location}
                  </Text>
                  <Text style={commonStyles.description}>{exp.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right Column - Education & Skills */}
        <View style={commonStyles.rightColumn}>
          {/* Education */}
          {data.education && data.education.length > 0 && (
            <View style={commonStyles.section}>
              <Text style={commonStyles.sectionTitle}>Education</Text>
              {data.education.map((edu, index) => (
                <View key={index} style={commonStyles.educationItem}>
                  <Text style={commonStyles.degree}>{edu.degree}</Text>
                  <Text style={commonStyles.school}>{edu.school}</Text>
                  <Text style={commonStyles.dateLocation}>
                    {edu.graduation_date}
                    {edu.gpa && ` | GPA: ${edu.gpa}`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {data.skills && (data.skills.technical?.length > 0 || data.skills.soft?.length > 0) && (
            <View style={commonStyles.section}>
              <Text style={commonStyles.sectionTitle}>Skills</Text>

              {data.skills.technical && data.skills.technical.length > 0 && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={[commonStyles.jobTitle, { fontSize: 10, marginBottom: 4 }]}>Technical</Text>
                  <View style={commonStyles.skillsContainer}>
                    {data.skills.technical.map((skill, index) => (
                      <Text key={index} style={commonStyles.skillItem}>
                        {skill}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {data.skills.soft && data.skills.soft.length > 0 && (
                <View>
                  <Text style={[commonStyles.jobTitle, { fontSize: 10, marginBottom: 4 }]}>Soft Skills</Text>
                  <View style={commonStyles.skillsContainer}>
                    {data.skills.soft.map((skill, index) => (
                      <Text key={index} style={commonStyles.skillItem}>
                        {skill}
                      </Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    </Page>
  </Document>
)

export const ClassicResumeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={[commonStyles.page, { padding: 50 }]}>
      {/* Header - Centered */}
      <View style={[commonStyles.header, { alignItems: "center", textAlign: "center" }]}>
        <Text style={commonStyles.name}>{data.personal_info.full_name}</Text>
        <Text style={[commonStyles.contactInfo, { justifyContent: "center", gap: 15 }]}>
          {data.personal_info.email} • {data.personal_info.phone} • {data.personal_info.location}
        </Text>
      </View>

      {/* Summary */}
      {data.summary && (
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Objective</Text>
          <Text style={commonStyles.summary}>{data.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Professional Experience</Text>
          {data.experience.map((exp, index) => (
            <View key={index} style={commonStyles.experienceItem}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={commonStyles.jobTitle}>{exp.title}</Text>
                  <Text style={commonStyles.company}>
                    {exp.company}, {exp.location}
                  </Text>
                </View>
                <Text style={commonStyles.dateLocation}>
                  {exp.start_date} - {exp.end_date}
                </Text>
              </View>
              <Text style={[commonStyles.description, { marginTop: 4 }]}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={commonStyles.educationItem}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View>
                  <Text style={commonStyles.degree}>{edu.degree}</Text>
                  <Text style={commonStyles.school}>
                    {edu.school}, {edu.location}
                  </Text>
                </View>
                <Text style={commonStyles.dateLocation}>{edu.graduation_date}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills && (data.skills.technical?.length > 0 || data.skills.soft?.length > 0) && (
        <View style={commonStyles.section}>
          <Text style={commonStyles.sectionTitle}>Skills</Text>
          {data.skills.technical && data.skills.technical.length > 0 && (
            <Text style={commonStyles.description}>
              <Text style={{ fontWeight: 600 }}>Technical: </Text>
              {data.skills.technical.join(", ")}
            </Text>
          )}
          {data.skills.soft && data.skills.soft.length > 0 && (
            <Text style={[commonStyles.description, { marginTop: 4 }]}>
              <Text style={{ fontWeight: 600 }}>Soft Skills: </Text>
              {data.skills.soft.join(", ")}
            </Text>
          )}
        </View>
      )}
    </Page>
  </Document>
)

export const RESUME_TEMPLATES = {
  harvard: HarvardResumeTemplate,
  executive: ExecutiveResumeTemplate,
  creative: CreativeResumeTemplate,
  academic: AcademicResumeTemplate,
  tech: TechResumeTemplate,
  modern: ModernResumeTemplate,
  classic: ClassicResumeTemplate,
} as const

export const TEMPLATE_CATEGORIES = {
  free: ["harvard"],
  premium: ["executive", "creative", "academic", "tech", "classic", "modern"],
} as const

export type TemplateType = keyof typeof RESUME_TEMPLATES

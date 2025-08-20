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

const styles = StyleSheet.create({
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
}

export const ModernResumeTemplate: React.FC<{ data: ResumeData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{data.personal_info.full_name}</Text>
        <View style={styles.contactInfo}>
          <Text>{data.personal_info.email}</Text>
          <Text>{data.personal_info.phone}</Text>
          <Text>{data.personal_info.location}</Text>
        </View>
        {(data.personal_info.linkedin || data.personal_info.website) && (
          <View style={[styles.contactInfo, { marginTop: 3 }]}>
            {data.personal_info.linkedin && <Text>{data.personal_info.linkedin}</Text>}
            {data.personal_info.website && <Text>{data.personal_info.website}</Text>}
          </View>
        )}
      </View>

      {/* Summary */}
      {data.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{data.summary}</Text>
        </View>
      )}

      {/* Two Column Layout */}
      <View style={styles.twoColumn}>
        {/* Left Column - Experience */}
        <View style={styles.leftColumn}>
          {data.experience && data.experience.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Experience</Text>
              {data.experience.map((exp, index) => (
                <View key={index} style={styles.experienceItem}>
                  <Text style={styles.jobTitle}>{exp.title}</Text>
                  <Text style={styles.company}>{exp.company}</Text>
                  <Text style={styles.dateLocation}>
                    {exp.start_date} - {exp.end_date} | {exp.location}
                  </Text>
                  <Text style={styles.description}>{exp.description}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Right Column - Education & Skills */}
        <View style={styles.rightColumn}>
          {/* Education */}
          {data.education && data.education.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Education</Text>
              {data.education.map((edu, index) => (
                <View key={index} style={styles.educationItem}>
                  <Text style={styles.degree}>{edu.degree}</Text>
                  <Text style={styles.school}>{edu.school}</Text>
                  <Text style={styles.dateLocation}>
                    {edu.graduation_date}
                    {edu.gpa && ` | GPA: ${edu.gpa}`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Skills */}
          {data.skills && (data.skills.technical?.length > 0 || data.skills.soft?.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Skills</Text>

              {data.skills.technical && data.skills.technical.length > 0 && (
                <View style={{ marginBottom: 8 }}>
                  <Text style={[styles.jobTitle, { fontSize: 10, marginBottom: 4 }]}>Technical</Text>
                  <View style={styles.skillsContainer}>
                    {data.skills.technical.map((skill, index) => (
                      <Text key={index} style={styles.skillItem}>
                        {skill}
                      </Text>
                    ))}
                  </View>
                </View>
              )}

              {data.skills.soft && data.skills.soft.length > 0 && (
                <View>
                  <Text style={[styles.jobTitle, { fontSize: 10, marginBottom: 4 }]}>Soft Skills</Text>
                  <View style={styles.skillsContainer}>
                    {data.skills.soft.map((skill, index) => (
                      <Text key={index} style={styles.skillItem}>
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
    <Page size="A4" style={[styles.page, { padding: 50 }]}>
      {/* Header - Centered */}
      <View style={[styles.header, { alignItems: "center", textAlign: "center" }]}>
        <Text style={styles.name}>{data.personal_info.full_name}</Text>
        <Text style={[styles.contactInfo, { justifyContent: "center", gap: 15 }]}>
          {data.personal_info.email} • {data.personal_info.phone} • {data.personal_info.location}
        </Text>
      </View>

      {/* Summary */}
      {data.summary && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objective</Text>
          <Text style={styles.summary}>{data.summary}</Text>
        </View>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {data.experience.map((exp, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.jobTitle}>{exp.title}</Text>
                  <Text style={styles.company}>
                    {exp.company}, {exp.location}
                  </Text>
                </View>
                <Text style={styles.dateLocation}>
                  {exp.start_date} - {exp.end_date}
                </Text>
              </View>
              <Text style={[styles.description, { marginTop: 4 }]}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View>
                  <Text style={styles.degree}>{edu.degree}</Text>
                  <Text style={styles.school}>
                    {edu.school}, {edu.location}
                  </Text>
                </View>
                <Text style={styles.dateLocation}>{edu.graduation_date}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Skills */}
      {data.skills && (data.skills.technical?.length > 0 || data.skills.soft?.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {data.skills.technical && data.skills.technical.length > 0 && (
            <Text style={styles.description}>
              <Text style={{ fontWeight: 600 }}>Technical: </Text>
              {data.skills.technical.join(", ")}
            </Text>
          )}
          {data.skills.soft && data.skills.soft.length > 0 && (
            <Text style={[styles.description, { marginTop: 4 }]}>
              <Text style={{ fontWeight: 600 }}>Soft Skills: </Text>
              {data.skills.soft.join(", ")}
            </Text>
          )}
        </View>
      )}
    </Page>
  </Document>
)

// Database types for the resume generator
export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  location?: string
  linkedin_url?: string
  github_url?: string
  website_url?: string
  professional_summary?: string
  created_at: string
  updated_at: string
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  location?: string
  start_date: string
  end_date?: string
  is_current: boolean
  description: string[]
  achievements?: string[]
}

export interface Education {
  id: string
  institution: string
  degree: string
  field_of_study?: string
  location?: string
  start_date: string
  end_date?: string
  gpa?: string
  honors?: string[]
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  url?: string
  github_url?: string
  start_date?: string
  end_date?: string
}

export interface Certification {
  id: string
  name: string
  issuer: string
  issue_date: string
  expiry_date?: string
  credential_id?: string
  url?: string
}

export interface Resume {
  id: string
  user_id: string
  title: string
  template_style: string
  work_experience: WorkExperience[]
  education: Education[]
  skills: string[]
  projects: Project[]
  certifications: Certification[]
  additional_sections: Record<string, any>
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface JobPosting {
  id: string
  user_id: string
  url: string
  title: string
  company: string
  location?: string
  job_type?: string
  salary_range?: string
  description: string
  requirements?: string
  benefits?: string
  scraped_data: Record<string, any>
  created_at: string
}

export interface ResumeCustomization {
  id: string
  user_id: string
  base_resume_id: string
  job_posting_id: string
  customized_data: Resume
  customization_notes?: string
  match_score?: number
  created_at: string
}

"use client"

import Link from "next/link"
import { ArrowLeft, CheckCircle, User, FileText, Sparkles, Download, Settings, Crown } from "lucide-react"

const steps = [
  {
    title: "Getting Started",
    icon: User,
    content: [
      {
        step: "Create Your Account",
        description: "Sign up with your email address to get started with FreeResumeAI.",
        details: [
          "Visit the homepage and click 'Get Started'",
          "Enter your email address and create a secure password",
          "Verify your email address through the confirmation link",
          "You'll be automatically logged in and redirected to your dashboard",
        ],
      },
      {
        step: "Complete Your Profile",
        description: "Set up your profile information for better resume generation.",
        details: [
          "Click the settings gear icon in the top right corner",
          "Navigate to your profile page",
          "Fill in your personal information",
          "Update your password if needed",
        ],
      },
    ],
  },
  {
    title: "Creating Your First Resume",
    icon: FileText,
    content: [
      {
        step: "Start a New Resume",
        description: "Begin creating your professional resume from your dashboard.",
        details: [
          "From your dashboard, click 'Create New Resume'",
          "Enter a descriptive name for your resume (e.g., 'Software Engineer Resume')",
          "Click 'Create' to start building your resume",
        ],
      },
      {
        step: "Fill in Personal Information",
        description: "Add your contact details and basic information.",
        details: [
          "Enter your full name, email, and phone number",
          "Add your location (city, state/country)",
          "Include your LinkedIn profile URL",
          "Add your personal website or portfolio if applicable",
        ],
      },
      {
        step: "Write Your Professional Summary",
        description: "Create a compelling summary that highlights your key strengths.",
        details: [
          "Write 2-3 sentences about your professional background",
          "Highlight your most relevant skills and experience",
          "Focus on what makes you unique as a candidate",
          "Keep it concise but impactful",
        ],
      },
      {
        step: "Add Work Experience",
        description: "Detail your professional experience with specific achievements.",
        details: [
          "List your jobs in reverse chronological order (most recent first)",
          "Include company name, job title, and employment dates",
          "Write 3-5 bullet points describing your responsibilities and achievements",
          "Use action verbs and quantify results when possible",
          "Click 'Add Experience' to include additional positions",
        ],
      },
      {
        step: "Include Education",
        description: "Add your educational background and qualifications.",
        details: [
          "Enter your degree type and field of study",
          "Include the school name and graduation date",
          "Add your GPA if it's 3.5 or higher",
          "Include relevant coursework, honors, or activities if applicable",
        ],
      },
      {
        step: "List Your Skills",
        description: "Showcase your technical and soft skills.",
        details: [
          "Add technical skills relevant to your target job",
          "Include programming languages, software, and tools",
          "List soft skills like leadership, communication, and problem-solving",
          "Organize skills by category if you have many",
        ],
      },
    ],
  },
  {
    title: "AI Optimization Features",
    icon: Sparkles,
    content: [
      {
        step: "Job Description Analysis",
        description: "Use AI to optimize your resume for specific job postings.",
        details: [
          "Click 'Optimize for Job' on your resume page",
          "Paste the job description you're applying for",
          "Our AI will analyze the requirements and suggest improvements",
          "Review and apply the suggestions that fit your experience",
        ],
      },
      {
        step: "ATS Optimization",
        description: "Ensure your resume passes Applicant Tracking Systems.",
        details: [
          "Our AI automatically formats your resume for ATS compatibility",
          "Keywords from job descriptions are highlighted and suggested",
          "Section headers and formatting are optimized for machine reading",
          "Your resume will be more likely to reach human recruiters",
        ],
      },
      {
        step: "Content Suggestions",
        description: "Get AI-powered recommendations to improve your content.",
        details: [
          "AI suggests stronger action verbs for your experience",
          "Recommendations for quantifying your achievements",
          "Industry-specific keywords to include",
          "Tips for improving your professional summary",
        ],
      },
    ],
  },
  {
    title: "Templates and Customization",
    icon: Settings,
    content: [
      {
        step: "Choose Your Template",
        description: "Select from professional resume templates.",
        details: [
          "Free users get access to the Harvard template",
          "Premium users can choose from 5 additional templates:",
          "• Executive: Professional and sophisticated",
          "• Creative: Modern design with sidebar",
          "• Academic: Research and education focused",
          "• Tech: Developer and technical roles",
          "• Classic: Traditional single-column layout",
          "• Modern: Clean two-column design",
        ],
      },
      {
        step: "Customize Your Resume",
        description: "Personalize your resume appearance and content.",
        details: [
          "Switch between templates at any time",
          "Edit any section by clicking on it",
          "Reorder sections to match your priorities",
          "Add or remove sections as needed",
        ],
      },
    ],
  },
  {
    title: "Downloading and Sharing",
    icon: Download,
    content: [
      {
        step: "Generate PDF",
        description: "Create a professional PDF version of your resume.",
        details: [
          "Click 'Download PDF' on your resume page",
          "Your resume will be generated in high-quality PDF format",
          "The PDF is optimized for both digital and print use",
          "Save multiple versions for different job applications",
        ],
      },
      {
        step: "Managing Multiple Resumes",
        description: "Create targeted resumes for different opportunities.",
        details: [
          "Free users can create up to 10 resumes",
          "Premium users get unlimited resume creation",
          "Name your resumes descriptively (e.g., 'Marketing Manager Resume')",
          "Customize each resume for specific job types or industries",
        ],
      },
    ],
  },
  {
    title: "Premium Features",
    icon: Crown,
    content: [
      {
        step: "Upgrade to Premium",
        description: "Unlock advanced features and unlimited access.",
        details: [
          "One-time payment of $25 for lifetime access",
          "Unlimited resume creation",
          "Access to all 5 premium templates",
          "Priority customer support",
          "Advanced AI optimization features",
        ],
      },
      {
        step: "Payment Options",
        description: "Choose your preferred payment method.",
        details: [
          "Credit card payments through Stripe for instant access",
          "Bitcoin payments for cryptocurrency users",
          "Secure payment processing with enterprise-grade security",
          "Automatic account upgrade after successful payment",
        ],
      },
    ],
  },
]

function StepSection({ title, icon: Icon, content }: { title: string; icon: any; content: any[] }) {
  return (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <div className="bg-blue-600/20 p-3 rounded-lg mr-4">
          <Icon className="h-6 w-6 text-blue-400" />
        </div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
      </div>

      <div className="space-y-8">
        {content.map((item, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h3 className="text-xl font-medium text-white mb-3">{item.step}</h3>
            <p className="text-white/80 mb-4">{item.description}</p>
            <ul className="space-y-2">
              {item.details.map((detail: string, detailIndex: number) => (
                <li key={detailIndex} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-white/70">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DocumentationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/support"
            className="inline-flex items-center text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Support
          </Link>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Documentation</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Complete step-by-step guide to using FreeResumeAI. Learn how to create professional, ATS-optimized resumes
              with our AI-powered platform.
            </p>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-blue-600/10 border border-blue-500/20 rounded-lg p-6 mb-12">
          <h2 className="text-xl font-semibold text-white mb-3">Quick Start</h2>
          <p className="text-white/80 mb-4">
            New to FreeResumeAI? Follow these steps to create your first resume in under 10 minutes:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-white/70">
            <li>Create your free account</li>
            <li>Click "Create New Resume" from your dashboard</li>
            <li>Fill in your personal information and work experience</li>
            <li>Use AI optimization to improve your content</li>
            <li>Choose a template and download your PDF</li>
          </ol>
        </div>

        {/* Documentation Sections */}
        <div>
          {steps.map((section, index) => (
            <StepSection key={index} title={section.title} icon={section.icon} content={section.content} />
          ))}
        </div>

        {/* Support Section */}
        <div className="mt-16">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-semibold text-white mb-4">Need Additional Help?</h3>
            <p className="text-white/80 mb-6">
              If you need further assistance or have specific questions, our support team is ready to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/support"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
              >
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

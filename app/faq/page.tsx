"use client"

import Link from "next/link"
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"
import { useState } from "react"

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I create my first resume?",
        answer:
          "Simply sign up for a free account, click 'Create New Resume' on your dashboard, fill in your personal information, work experience, education, and skills. Our AI will help optimize your content for better results.",
      },
      {
        question: "Is FreeResumeAI really free?",
        answer:
          "Yes! Free users can create up to 5 AI-optimized resumes with our Harvard template. Premium users get unlimited resumes and access to 5 professional templates including Executive, Creative, Academic, and Tech styles.",
      },
      {
        question: "What makes this different from other resume builders?",
        answer:
          "Our AI analyzes job descriptions and optimizes your resume content for ATS systems, increasing your chances of getting interviews. We also offer job-specific customization and multiple professional templates.",
      },
    ],
  },
  {
    category: "AI Features",
    questions: [
      {
        question: "How does the AI optimization work?",
        answer:
          "Our AI analyzes job descriptions and suggests improvements to your resume content, including keyword optimization, skill highlighting, and experience rewriting to match job requirements better.",
      },
      {
        question: "Can I customize the AI suggestions?",
        answer:
          "All AI suggestions are editable. You can accept, modify, or reject any recommendations to ensure your resume reflects your authentic experience and voice.",
      },
      {
        question: "What is ATS optimization?",
        answer:
          "ATS (Applicant Tracking System) optimization ensures your resume can be properly read by automated systems that many companies use to screen applications. Our AI formats content to pass these systems.",
      },
    ],
  },
  {
    category: "Premium Features",
    questions: [
      {
        question: "What do I get with a premium account?",
        answer:
          "Premium users get unlimited resume creation, access to 5 professional templates (Executive, Creative, Academic, Tech, plus Classic and Modern), priority support, and advanced AI features.",
      },
      {
        question: "How much does premium cost?",
        answer:
          "Premium access costs $25 one-time payment. This unlocks unlimited resumes and all premium templates forever - no monthly subscriptions.",
      },
      {
        question: "Can I upgrade my account later?",
        answer:
          "Yes! You can upgrade to premium at any time from your dashboard or when you hit the 5-resume limit. Your existing resumes will remain accessible.",
      },
    ],
  },
  {
    category: "Templates & Formatting",
    questions: [
      {
        question: "What resume templates are available?",
        answer:
          "Free users get the Harvard template. Premium users access Executive (professional), Creative (modern sidebar), Academic (research-focused), Tech (developer-focused), Classic (single column), and Modern (two column) templates.",
      },
      {
        question: "Can I switch templates after creating a resume?",
        answer:
          "Yes! You can change templates at any time when viewing your resume. Premium templates require a premium account to use.",
      },
      {
        question: "Are the resumes ATS-friendly?",
        answer:
          "All our templates are designed to be ATS-friendly with proper formatting, clear section headers, and standard fonts that automated systems can read easily.",
      },
    ],
  },
  {
    category: "Account & Billing",
    questions: [
      {
        question: "How do I reset my password?",
        answer:
          "Go to the login page and click 'Forgot Password'. Enter your email address and we'll send you a reset link. You can also change your password from your profile page when logged in.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards through Stripe for instant access. We also accept Bitcoin payments for users who prefer cryptocurrency.",
      },
      {
        question: "Is my data secure?",
        answer:
          "Yes! We use enterprise-grade security with encrypted data storage, secure authentication, and never share your personal information with third parties.",
      },
    ],
  },
  {
    category: "Technical Support",
    questions: [
      {
        question: "My resume isn't generating properly. What should I do?",
        answer:
          "Try refreshing the page first. If the issue persists, check that all required fields are filled out. Contact our support team if you continue experiencing problems.",
      },
      {
        question: "Can I download my resume in different formats?",
        answer:
          "Currently, we generate resumes in PDF format, which is the most widely accepted format by employers and ATS systems.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Contact our support team to request account deletion. We'll permanently remove your data within 30 days as required by privacy regulations.",
      },
    ],
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-white/10 rounded-lg bg-white/5 backdrop-blur-sm">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-white">{question}</span>
        {isOpen ? (
          <ChevronDown className="h-5 w-5 text-white/60" />
        ) : (
          <ChevronRight className="h-5 w-5 text-white/60" />
        )}
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <p className="text-white/80 leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

function FAQCategory({
  category,
  questions,
}: { category: string; questions: Array<{ question: string; answer: string }> }) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-white mb-6">{category}</h2>
      <div className="space-y-3">
        {questions.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  )
}

export default function FAQPage() {
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
            <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Find answers to common questions about FreeResumeAI, our features, and how to get the most out of our
              AI-powered resume builder.
            </p>
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-12">
          {faqs.map((category, index) => (
            <FAQCategory key={index} category={category.category} questions={category.questions} />
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-16 text-center">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8">
            <h3 className="text-2xl font-semibold text-white mb-4">Still have questions?</h3>
            <p className="text-white/80 mb-6">Can't find what you're looking for? Our support team is here to help.</p>
            <Link
              href="/support"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

import type React from "react"
import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
})

export const metadata: Metadata = {
  title: "AI Resume Builder | Create Professional Resumes with AI | ResumeAI",
  description:
    "Create professional, ATS-friendly resumes with our AI-powered resume builder. Customize resumes for specific jobs, optimize for applicant tracking systems, and land your dream job. Free resume templates included.",
  keywords: [
    "AI resume builder",
    "resume generator",
    "professional resume maker",
    "ATS resume builder",
    "job application resume",
    "resume templates",
    "CV builder",
    "resume optimizer",
    "job-specific resume",
    "resume customization",
    "free resume builder",
    "resume writing AI",
  ],
  authors: [{ name: "ResumeAI" }],
  creator: "ResumeAI",
  publisher: "ResumeAI",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ai-resume-generator.vercel.app",
    siteName: "ResumeAI - AI Resume Builder",
    title: "AI Resume Builder | Create Professional Resumes with AI",
    description:
      "Create professional, ATS-friendly resumes with our AI-powered resume builder. Customize resumes for specific jobs and land your dream job.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ResumeAI - AI-Powered Resume Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Resume Builder | Create Professional Resumes with AI",
    description:
      "Create professional, ATS-friendly resumes with our AI-powered resume builder. Customize resumes for specific jobs and land your dream job.",
    images: ["/og-image.png"],
    creator: "@resumeai",
  },
  alternates: {
    canonical: "https://ai-resume-generator.vercel.app",
  },
  category: "technology",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicon.png", sizes: "180x180", type: "image/png" }],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "ResumeAI - AI Resume Builder",
              description:
                "AI-powered resume builder that creates professional, ATS-friendly resumes customized for specific job applications",
              url: "https://ai-resume-generator.vercel.app",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free resume builder with premium features available",
              },
              featureList: [
                "AI-powered resume generation",
                "Job-specific customization",
                "ATS optimization",
                "Professional templates",
                "PDF export",
                "Real-time editing",
              ],
              screenshot: "/og-image.png",
              softwareVersion: "1.0",
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  )
}

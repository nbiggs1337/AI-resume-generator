"use client"

import Link from "next/link"
import { ArrowLeft, Play, Users, Star } from "lucide-react"

const tutorials = [
  {
    id: 1,
    title: "Getting Started: Create Your First Resume",
    description:
      "Learn how to create a professional resume from scratch using FreeResumeAI's intuitive interface and AI-powered optimization.",
    duration: "8:32",
    difficulty: "Beginner",
    topics: [
      "Creating your account and setting up your profile",
      "Adding personal information and contact details",
      "Writing an effective professional summary",
      "Adding work experience with impact-focused bullet points",
      "Including education and skills sections",
      "Choosing the right template for your industry",
      "Downloading your finished resume as PDF",
    ],
    thumbnail: "/resume-tutorial-thumbnail.png",
    views: "2.1K",
    rating: 4.8,
  },
  {
    id: 2,
    title: "Advanced Features: AI Optimization & Job Matching",
    description:
      "Master the advanced AI features to optimize your resume for specific job postings and improve your chances of getting interviews.",
    duration: "12:45",
    difficulty: "Intermediate",
    topics: [
      "Using the job description analyzer",
      "Understanding ATS optimization recommendations",
      "Applying AI-suggested content improvements",
      "Customizing resumes for different job applications",
      "Premium template features and customization",
      "Managing multiple resume versions",
      "Best practices for keyword optimization",
      "Tracking your resume performance",
    ],
    thumbnail: "/ai-resume-optimization-thumbnail.png",
    views: "1.8K",
    rating: 4.9,
  },
]

function VideoCard({ tutorial }: { tutorial: (typeof tutorials)[0] }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:bg-white/10 transition-colors">
      {/* Video Thumbnail */}
      <div className="relative">
        <img src={tutorial.thumbnail || "/placeholder.svg"} alt={tutorial.title} className="w-full h-64 object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
          <button className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-4 hover:bg-white/30 transition-colors">
            <Play className="h-8 w-8 text-white ml-1" />
          </button>
        </div>
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-white text-sm">
          {tutorial.duration}
        </div>
      </div>

      {/* Video Info */}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              tutorial.difficulty === "Beginner" ? "bg-green-600/20 text-green-400" : "bg-blue-600/20 text-blue-400"
            }`}
          >
            {tutorial.difficulty}
          </span>
          <div className="flex items-center text-white/60 text-sm">
            <Users className="h-4 w-4 mr-1" />
            {tutorial.views} views
          </div>
          <div className="flex items-center text-white/60 text-sm">
            <Star className="h-4 w-4 mr-1 fill-current text-yellow-400" />
            {tutorial.rating}
          </div>
        </div>

        <h3 className="text-xl font-semibold text-white mb-3">{tutorial.title}</h3>
        <p className="text-white/80 mb-4">{tutorial.description}</p>

        <div className="mb-4">
          <h4 className="text-white font-medium mb-2">What you'll learn:</h4>
          <ul className="space-y-1">
            {tutorial.topics.slice(0, 3).map((topic, index) => (
              <li key={index} className="text-white/70 text-sm flex items-start">
                <span className="text-blue-400 mr-2">•</span>
                {topic}
              </li>
            ))}
            {tutorial.topics.length > 3 && (
              <li className="text-white/60 text-sm">+ {tutorial.topics.length - 3} more topics</li>
            )}
          </ul>
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
          <Play className="h-4 w-4 mr-2" />
          Watch Tutorial
        </button>
      </div>
    </div>
  )
}

export default function VideoTutorialsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
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
            <h1 className="text-4xl font-bold text-white mb-4">Video Tutorials</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Learn how to use FreeResumeAI with our comprehensive video tutorials. From basic resume creation to
              advanced AI optimization techniques.
            </p>
          </div>
        </div>

        {/* Tutorial Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">2</div>
            <div className="text-white/80">Video Tutorials</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">21m</div>
            <div className="text-white/80">Total Duration</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">3.9K</div>
            <div className="text-white/80">Total Views</div>
          </div>
        </div>

        {/* Video Tutorials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {tutorials.map((tutorial) => (
            <VideoCard key={tutorial.id} tutorial={tutorial} />
          ))}
        </div>

        {/* Coming Soon */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold text-white mb-4">More Tutorials Coming Soon</h3>
          <p className="text-white/80 mb-6">
            We're constantly creating new content to help you master resume building. Stay tuned for tutorials on
            industry-specific tips, interview preparation, and career advancement strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/support"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Request a Tutorial
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors"
            >
              Read Documentation
            </Link>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3">Need Help?</h4>
            <p className="text-white/80 mb-4">
              Can't find what you're looking for? Our support team is here to help with any questions.
            </p>
            <Link href="/support" className="text-blue-400 hover:text-blue-300 font-medium">
              Contact Support →
            </Link>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-white mb-3">Quick Answers</h4>
            <p className="text-white/80 mb-4">
              Browse our frequently asked questions for instant answers to common questions.
            </p>
            <Link href="/faq" className="text-blue-400 hover:text-blue-300 font-medium">
              View FAQ →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

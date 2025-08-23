import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Brain, HelpCircle, Zap, Target, Shield, Star, CheckCircle, ArrowRight } from "lucide-react"

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-gray-100">
      <header className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-serif font-bold text-foreground">ResumeAI</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <Link href="/support">
                <Button variant="ghost" size="sm" className="glass-button border-0">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link href="/auth/login">
              <Button variant="ghost" className="glass-button border-0">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-primary hover:bg-primary/90 shadow-lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent"></div>
        <div className="absolute inset-0 glass opacity-20"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h2 className="text-6xl font-serif font-bold mb-6 text-white">AI-Powered Resume Builder</h2>
          <p className="text-xl mb-8 text-white/90 leading-relaxed max-w-2xl mx-auto">
            Create professional, ATS-optimized resumes in minutes. Our AI analyzes job descriptions and tailors your
            resume for maximum impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/sign-up">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-10 py-6 bg-white text-primary hover:bg-white/90 shadow-2xl"
              >
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-white/80 text-sm">10 free resumes • No credit card required</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-serif font-bold mb-4 text-foreground">Why Choose ResumeAI?</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our AI-powered platform helps you create resumes that get noticed by employers and pass ATS systems.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-2xl border border-white/20 text-center">
              <Zap className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">AI-Powered Optimization</h4>
              <p className="text-muted-foreground">
                Our AI analyzes job descriptions and optimizes your resume content for maximum relevance and impact.
              </p>
            </div>
            <div className="glass p-8 rounded-2xl border border-white/20 text-center">
              <Target className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">ATS-Friendly</h4>
              <p className="text-muted-foreground">
                All templates are designed to pass Applicant Tracking Systems and reach human recruiters.
              </p>
            </div>
            <div className="glass p-8 rounded-2xl border border-white/20 text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <h4 className="text-xl font-semibold mb-3">Professional Templates</h4>
              <p className="text-muted-foreground">
                Choose from expertly designed templates that make a great first impression with employers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 glass border-y border-white/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-4xl font-serif font-bold mb-16 text-foreground">Trusted by Job Seekers</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/50 p-8 rounded-2xl border border-white/20">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "ResumeAI helped me land my dream job at a Fortune 500 company. The AI suggestions were spot-on!"
              </p>
              <p className="font-semibold">Sarah M., Software Engineer</p>
            </div>
            <div className="bg-white/50 p-8 rounded-2xl border border-white/20">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4">
                "I got 3x more interviews after using ResumeAI. The job-specific optimization really works!"
              </p>
              <p className="font-semibold">Michael R., Marketing Manager</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h3 className="text-4xl font-serif font-bold mb-8 text-foreground">Simple, Transparent Pricing</h3>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="glass p-8 rounded-2xl border border-white/20">
              <h4 className="text-2xl font-semibold mb-4">Free</h4>
              <p className="text-3xl font-bold mb-6">$0</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>10 AI-optimized resumes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Professional templates</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>PDF export</span>
                </li>
              </ul>
              <Link href="/auth/sign-up">
                <Button variant="outline" className="w-full bg-transparent">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="glass p-8 rounded-2xl border border-primary/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-4 py-1 rounded-full text-sm">Popular</span>
              </div>
              <h4 className="text-2xl font-semibold mb-4">Unlimited</h4>
              <p className="text-3xl font-bold mb-6">$25</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Unlimited resumes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Advanced AI optimization</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Priority support</span>
                </li>
              </ul>
              <Link href="/auth/sign-up">
                <Button className="w-full bg-primary hover:bg-primary/90">Upgrade Now</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-16 px-4 glass border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-serif font-bold text-foreground">ResumeAI</span>
          </div>
          <div className="flex justify-center gap-8 mb-6">
            <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/support" className="text-muted-foreground hover:text-primary transition-colors">
              Support
            </Link>
          </div>
          <div className="text-center text-muted-foreground">
            <p className="text-lg">&copy; 2024 ResumeAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

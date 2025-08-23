import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Brain, Zap, Target, Download, Sparkles } from "lucide-react"

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
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>
        <div className="container mx-auto max-w-6xl text-center relative z-10">
          <div className="glass-card inline-flex items-center gap-2 mb-8 px-4 py-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium">AI-Powered Resume Generation</span>
          </div>
          <h2 className="text-6xl md:text-7xl font-serif font-bold text-foreground mb-8 leading-tight">
            Create Resumes That
            <span className="text-primary block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Get You Hired
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Transform your career with AI-powered resume customization. Paste any job posting URL and watch as our
            intelligent system tailors your resume to match exactly what employers are looking for.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg px-10 py-6 bg-primary hover:bg-primary/90 shadow-xl depth-2">
                Start Building Your Resume
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-10 py-6 glass-button border-white/30 bg-transparent"
            >
              View Sample Resumes
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-transparent"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-serif font-bold text-foreground mb-6">Why Choose ResumeAI?</h3>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our advanced AI technology analyzes job postings and optimizes your resume for maximum impact
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 glass">
                  <Target className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-2xl font-serif">Smart Job Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed text-muted-foreground">
                  Simply paste a job posting URL and our AI analyzes the requirements to customize your resume perfectly
                  for that specific role.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-6 glass">
                  <Zap className="h-10 w-10 text-accent" />
                </div>
                <CardTitle className="text-2xl font-serif">Instant Optimization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed text-muted-foreground">
                  Get tailored resumes in seconds. Our AI highlights relevant skills, adjusts keywords, and optimizes
                  content for ATS systems.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-blue-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6 glass">
                  <Download className="h-10 w-10 text-blue-600" />
                </div>
                <CardTitle className="text-2xl font-serif">Professional PDFs</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-base leading-relaxed text-muted-foreground">
                  Export beautiful, ATS-friendly PDF resumes with multiple professional templates to choose from.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-50/80 to-gray-50/80"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-20">
            <h3 className="text-4xl font-serif font-bold text-foreground mb-6">How It Works</h3>
            <p className="text-xl text-muted-foreground">Three simple steps to your perfect resume</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <h4 className="text-2xl font-serif font-semibold mb-4">Build Your Base Resume</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Create your master resume with all your experience, skills, and achievements in our intuitive builder.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <h4 className="text-2xl font-serif font-semibold mb-4">Paste Job URL</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Simply paste the URL of any job posting you're interested in applying for.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-xl group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <h4 className="text-2xl font-serif font-semibold mb-4">Get Tailored Resume</h4>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Our AI customizes your resume to match the job requirements and generates a professional PDF.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-accent"></div>
        <div className="absolute inset-0 glass opacity-20"></div>
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <h3 className="text-5xl font-serif font-bold mb-8 text-white">Ready to Land Your Dream Job?</h3>
          <p className="text-xl mb-10 text-white/90 leading-relaxed">
            Join thousands of professionals who have successfully landed interviews with AI-optimized resumes.
          </p>
          <Link href="/auth/sign-up">
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-10 py-6 bg-white text-primary hover:bg-white/90 shadow-2xl"
            >
              Create Your First Resume
            </Button>
          </Link>
        </div>
      </section>

      <footer className="py-16 px-4 glass border-t border-white/10">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-center gap-2 mb-8">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-2xl font-serif font-bold text-foreground">ResumeAI</span>
          </div>
          <div className="text-center text-muted-foreground">
            <p className="text-lg">&copy; 2024 ResumeAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

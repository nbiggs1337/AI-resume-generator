"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, CheckCircle, AlertCircle, HelpCircle, CreditCard, Bug, Lightbulb } from "lucide-react"

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "",
    priority: "medium",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const categories = [
    {
      value: "technical",
      label: "Technical Issues",
      icon: Bug,
      description: "App bugs, login problems, or technical difficulties",
    },
    {
      value: "billing",
      label: "Billing & Payments",
      icon: CreditCard,
      description: "Payment issues, subscription questions, or refunds",
    },
    {
      value: "feature",
      label: "Feature Requests",
      icon: Lightbulb,
      description: "Suggestions for new features or improvements",
    },
    {
      value: "general",
      label: "General Inquiries",
      icon: HelpCircle,
      description: "Questions about our service or general support",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch("/api/support/create-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit support request")
      }

      setSubmitStatus("success")
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "",
        priority: "medium",
      })
    } catch (error) {
      console.error("Support request error:", error)
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="glass-card mb-6">
            <h1 className="text-4xl font-bold text-foreground mb-4">How can we help you?</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get the support you need for your AI-powered resume journey. Our team is here to help with any questions
              or issues you may have.
            </p>
          </div>
        </div>

        {/* Category Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <Card
                key={category.value}
                className={`glass-card cursor-pointer transition-all duration-200 hover:scale-105 ${
                  formData.category === category.value ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => handleInputChange("category", category.value)}
              >
                <CardContent className="p-4 text-center">
                  <IconComponent className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <h3 className="font-semibold text-sm mb-1">{category.label}</h3>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Support Request Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-primary" />
              Submit Support Request
            </CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name and Email Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-foreground">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="glass-button"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="glass-button"
                  />
                </div>
              </div>

              {/* Category and Priority Row */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="category" className="text-sm font-medium text-foreground">
                    Category *
                  </label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className="glass-button">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="priority" className="text-sm font-medium text-foreground">
                    Priority
                  </label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                    <SelectTrigger className="glass-button">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Low
                          </Badge>
                          <span>General questions</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            Medium
                          </Badge>
                          <span>Standard support</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="text-xs">
                            High
                          </Badge>
                          <span>Urgent issues</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-red-600 text-xs">Urgent</Badge>
                          <span>Critical problems</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-foreground">
                  Subject *
                </label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Brief description of your issue or question"
                  value={formData.subject}
                  onChange={(e) => handleInputChange("subject", e.target.value)}
                  required
                  className="glass-button"
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-foreground">
                  Message *
                </label>
                <Textarea
                  id="message"
                  placeholder="Please provide detailed information about your issue or question. Include any relevant steps you've taken or error messages you've encountered."
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  required
                  rows={6}
                  className="glass-button resize-none"
                />
              </div>

              {/* Status Messages */}
              {submitStatus === "success" && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your support request has been submitted successfully! We'll get back to you within 24 hours.
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === "error" && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {errorMessage || "Failed to submit your request. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.name ||
                  !formData.email ||
                  !formData.subject ||
                  !formData.message ||
                  !formData.category
                }
                className="w-full glass-button bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Support Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Help Section */}
        <div className="mt-12 text-center">
          <Card className="glass-card">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Need immediate help?</h3>
              <p className="text-muted-foreground mb-4">
                Check out our frequently asked questions or browse our documentation for quick answers.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="outline" className="glass-button bg-transparent">
                  View FAQ
                </Button>
                <Button variant="outline" className="glass-button bg-transparent">
                  Documentation
                </Button>
                <Button variant="outline" className="glass-button bg-transparent">
                  Video Tutorials
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

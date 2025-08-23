import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service - AI Resume Generator",
  description: "Terms of Service for AI Resume Generator - Legal terms and conditions for using our service.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
          <p className="text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  By accessing or using our AI Resume Generator service, you agree to be bound by these Terms of Service
                  and our Privacy Policy. If you do not agree to these terms, please do not use our service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Description of Service</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Our service provides AI-powered resume optimization, job analysis, and career guidance tools. We offer
                  both free and paid tiers with different feature limitations.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Free accounts: Limited to 10 resume generations</li>
                  <li>Paid accounts: Unlimited resume generations and premium features</li>
                  <li>AI-powered resume optimization and job matching</li>
                  <li>PDF generation and export capabilities</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. User Accounts and Registration</h2>
              <div className="space-y-4 text-slate-700">
                <p>To use our service, you must:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete registration information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Be at least 13 years old (or the minimum age in your jurisdiction)</li>
                  <li>Use the service only for lawful purposes</li>
                </ul>
                <p>You are responsible for all activities that occur under your account.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Payment Terms</h2>
              <div className="space-y-4 text-slate-700">
                <p>For paid services:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payment is required before accessing premium features</li>
                  <li>All payments are processed securely through Stripe or Bitcoin</li>
                  <li>Prices are subject to change with notice</li>
                  <li>Refunds are provided at our discretion</li>
                  <li>You authorize us to charge your payment method for applicable fees</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Acceptable Use Policy</h2>
              <div className="space-y-4 text-slate-700">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the service for any illegal or unauthorized purpose</li>
                  <li>Submit false, misleading, or fraudulent information</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Use automated tools to access the service without permission</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Content and Intellectual Property</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  You retain ownership of your resume content and personal information. By using our service, you grant
                  us a limited license to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Process your content through AI systems for optimization</li>
                  <li>Store and display your content within the service</li>
                  <li>Use anonymized data for service improvement</li>
                </ul>
                <p>Our service, including all software, designs, and AI models, remains our intellectual property.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. AI-Generated Content Disclaimer</h2>
              <div className="space-y-4 text-slate-700">
                <p>Our AI-powered suggestions are provided for informational purposes only. We do not guarantee:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The accuracy or completeness of AI-generated content</li>
                  <li>Job placement or interview success</li>
                  <li>Compliance with specific industry requirements</li>
                </ul>
                <p>You are responsible for reviewing and verifying all AI-generated content before use.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Service Availability</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  We strive to maintain high service availability but do not guarantee uninterrupted access. We may:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Perform maintenance that temporarily affects service</li>
                  <li>Modify or discontinue features with notice</li>
                  <li>Suspend accounts that violate these terms</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Limitation of Liability</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
                  CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR USE,
                  ARISING FROM YOUR USE OF THE SERVICE.
                </p>
                <p>
                  Our total liability shall not exceed the amount you paid for the service in the 12 months preceding
                  the claim.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Indemnification</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  You agree to indemnify and hold us harmless from any claims, damages, or expenses arising from your
                  use of the service, violation of these terms, or infringement of any rights.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Termination</h2>
              <div className="space-y-4 text-slate-700">
                <p>Either party may terminate this agreement at any time. Upon termination:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your access to the service will cease</li>
                  <li>We may delete your account and data after a reasonable period</li>
                  <li>Surviving provisions will remain in effect</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Governing Law</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  These terms are governed by the laws of the jurisdiction where our company is incorporated. Any
                  disputes will be resolved through binding arbitration or in the courts of that jurisdiction.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Changes to Terms</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  We may modify these terms at any time. Material changes will be communicated through the service or by
                  email. Continued use after changes constitutes acceptance of the new terms.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. Contact Information</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  For questions about these terms, please contact us through our support page or email us directly. We
                  will respond to inquiries within a reasonable timeframe.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

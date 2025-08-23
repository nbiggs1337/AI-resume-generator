import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - AI Resume Generator",
  description: "Privacy Policy for AI Resume Generator - How we collect, use, and protect your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Information We Collect</h2>
              <div className="space-y-4 text-slate-700">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address when you create an account</li>
                  <li>Resume content, work experience, education, and skills</li>
                  <li>Job posting information you analyze</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Support requests and communications</li>
                </ul>

                <h3 className="text-lg font-medium mt-6">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Usage data and analytics</li>
                  <li>Device information and IP address</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log files and error reports</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. How We Use Your Information</h2>
              <div className="space-y-4 text-slate-700">
                <p>We use your information to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and improve our AI resume generation services</li>
                  <li>Process payments and manage your account</li>
                  <li>Send important updates and notifications</li>
                  <li>Provide customer support</li>
                  <li>Analyze usage patterns to improve our service</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. AI Processing and Data Security</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Your resume data is processed by AI services to provide optimization suggestions. We implement
                  industry-standard security measures including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption in transit and at rest</li>
                  <li>Secure database storage with access controls</li>
                  <li>Regular security audits and monitoring</li>
                  <li>Limited data retention policies</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Information Sharing</h2>
              <div className="space-y-4 text-slate-700">
                <p>We do not sell your personal information. We may share information in limited circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>With AI service providers for resume optimization (anonymized when possible)</li>
                  <li>With payment processors for transaction processing</li>
                  <li>When required by law or to protect our rights</li>
                  <li>In connection with a business transfer or merger</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Your Rights and Choices</h2>
              <div className="space-y-4 text-slate-700">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access, update, or delete your personal information</li>
                  <li>Export your data in a portable format</li>
                  <li>Opt out of marketing communications</li>
                  <li>Request restriction of processing</li>
                  <li>File a complaint with supervisory authorities</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Data Retention</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  We retain your information for as long as necessary to provide our services and comply with legal
                  obligations. Resume data is retained while your account is active and for a reasonable period after
                  deletion to prevent accidental loss.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. International Transfers</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Your information may be transferred to and processed in countries other than your own. We ensure
                  appropriate safeguards are in place to protect your data in accordance with applicable privacy laws.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Children's Privacy</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  Our service is not intended for children under 13. We do not knowingly collect personal information
                  from children under 13. If we become aware of such collection, we will delete the information
                  immediately.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Changes to This Policy</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  We may update this privacy policy from time to time. We will notify you of any material changes by
                  posting the new policy on this page and updating the "Last updated" date.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Contact Us</h2>
              <div className="space-y-4 text-slate-700">
                <p>
                  If you have questions about this privacy policy or our data practices, please contact us through our
                  support page or email us directly.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

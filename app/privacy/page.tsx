import { Metadata } from "next"
import { Layers } from "lucide-react"

export const metadata: Metadata = {
  title: "Privacy Policy | CIAO",
  description: "Privacy Policy for CIAO Academic Information System",
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl py-16">
        <div className="flex items-center gap-2 mb-8">
          <Layers className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Privacy Policy
          </h1>
        </div>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="bg-card rounded-lg border p-8 shadow-sm">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">1. Introduction</h2>
              <p className="text-muted-foreground">
                At CIAO, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our academic information system.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">2. Information We Collect</h2>
              <p className="text-muted-foreground">We may collect the following types of information:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Personal identification information (name, email address, etc.)
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Academic records and performance data
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Usage data and system interaction logs
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Device and browser information
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">3. How We Use Your Information</h2>
              <p className="text-muted-foreground">We use the collected information for:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Providing and maintaining our services
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Improving user experience
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Communicating with users
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Ensuring system security
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Complying with legal obligations
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">4. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">5. Your Rights</h2>
              <p className="text-muted-foreground">You have the right to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Access your personal data
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Correct inaccurate data
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Request deletion of your data
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Object to data processing
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Data portability
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">6. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy, please contact us at:
                <br />
                <a href="mailto:privacy@ciao.edu" className="text-primary hover:underline">
                  privacy@ciao.edu
                </a>
              </p>
            </section>

            <section>
              <p className="text-sm text-muted-foreground">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 
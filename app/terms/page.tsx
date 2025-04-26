import { Metadata } from "next"
import { Layers } from "lucide-react"

export const metadata: Metadata = {
  title: "Terms of Service | CIAO",
  description: "Terms of Service for CIAO Academic Information System",
}

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container max-w-4xl py-16">
        <div className="flex items-center gap-2 mb-8">
          <Layers className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Terms of Service
          </h1>
        </div>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="bg-card rounded-lg border p-8 shadow-sm">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing and using the CIAO Academic Information System, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this system.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">2. Use License</h2>
              <p className="text-muted-foreground">Permission is granted to temporarily use the system for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Modify or copy the materials
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Use the materials for any commercial purpose
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Attempt to decompile or reverse engineer any software
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Remove any copyright or other proprietary notations
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Transfer the materials to another person
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">3. User Responsibilities</h2>
              <p className="text-muted-foreground">As a user of the system, you agree to:</p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Provide accurate and complete information
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Maintain the security of your account
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Not share your login credentials
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Use the system in compliance with all applicable laws
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                  Report any security concerns immediately
                </li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">4. Disclaimer</h2>
              <p className="text-muted-foreground">
                The materials on the CIAO system are provided on an 'as is' basis. CIAO makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">5. Limitations</h2>
              <p className="text-muted-foreground">
                In no event shall CIAO or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the system.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">6. Revisions and Errata</h2>
              <p className="text-muted-foreground">
                The materials appearing on the system could include technical, typographical, or photographic errors. CIAO does not warrant that any of the materials on its system are accurate, complete, or current. CIAO may make changes to the materials contained on its system at any time without notice.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold mb-4 text-primary">7. Contact Information</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms of Service, please contact us at:
                <br />
                <a href="mailto:legal@ciao.edu" className="text-primary hover:underline">
                  legal@ciao.edu
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
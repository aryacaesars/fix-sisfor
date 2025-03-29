"use client"

import Link from "next/link"
import { Layers, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedSection } from "@/components/animated-section"

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-20 items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-2 transition-transform duration-200 hover:scale-105">
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Ciao</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-4 md:p-8">
        <AnimatedSection className="w-full max-w-md">
          <div className="rounded-lg border bg-card p-8 shadow-sm text-center">
            <div className="mx-auto w-fit rounded-full bg-destructive/10 p-3">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <h1 className="mt-6 text-2xl font-bold">Access Denied</h1>
            <p className="mt-2 text-muted-foreground">
              You don't have permission to access this page. Please contact an administrator if you believe this is an
              error.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild>
                <Link href="/role-selection">Change Role</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      </main>
      <footer className="border-t py-6 bg-muted">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Ciao. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Help
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}


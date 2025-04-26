"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Layers, Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedSection } from "@/components/animated-section"
import { useToast } from "@/hooks/use-toast"
import { useSearchParams, useRouter } from "next/navigation"

export default function VerifyEmailPage() {
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Tambahkan state untuk menampilkan status verifikasi
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [statusMessage, setStatusMessage] = useState<string>("")

  // Tambahkan useEffect untuk memproses token verifikasi jika ada
  useEffect(() => {
    const token = searchParams.get("token")

    if (token) {
      setVerificationStatus("loading")
      setStatusMessage("Verifying your email...")

      // Panggil API verifikasi
      fetch(`/api/verify-email?token=${token}`)
        .then(async (response) => {
          if (response.ok || response.redirected) {
            setVerificationStatus("success")
            setStatusMessage("Email successfully verified! You will be redirected to the login page.")

            // Redirect ke halaman login setelah beberapa detik
            setTimeout(() => {
              router.push("/auth/login?verified=true")
            }, 3000)
          } else {
            const data = await response.json()
            throw new Error(data.error || "Failed to verify email")
          }
        })
        .catch((error) => {
          setVerificationStatus("error")
          setStatusMessage(error.message || "An error occurred while verifying email")
          toast({
            title: "Verification failed",
            description: error.message || "An error occurred while verifying email",
            variant: "destructive",
          })
        })
        
    }
  }, [searchParams, router, toast])

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/verify-email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Verification email sent",
          description: "Please check your inbox for the verification link",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
          <div className="rounded-lg border bg-card p-8 shadow-sm">
            <div className="mb-8 space-y-2 text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Verify your email</h1>
              <p className="text-muted-foreground">
                Please check your email for a verification link. If you didn't receive an email, you can request a new
                one below.
              </p>
            </div>
            {verificationStatus === "loading" && (
              <div className="mb-6 p-4 rounded-md bg-blue-50 text-blue-700 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
                <p>{statusMessage}</p>
              </div>
            )}

            {verificationStatus === "success" && (
              <div className="mb-6 p-4 rounded-md bg-green-50 text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <p>{statusMessage}</p>
              </div>
            )}

            {verificationStatus === "error" && (
              <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p>{statusMessage}</p>
              </div>
            )}
            <form onSubmit={handleResendVerification} className="space-y-6">
              <div className="space-y-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Resend verification email"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <Link href="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        </AnimatedSection>
      </main>
      <footer className="border-t py-6 bg-muted">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Ciao. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Terms
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}


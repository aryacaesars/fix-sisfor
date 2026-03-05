"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Layers, KeyRound, ArrowRight, AlertCircle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedSection } from "@/components/animated-section"
import { useToast } from "@/hooks/use-toast"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    const urlToken = searchParams.get("token")
    setToken(urlToken)
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token) {
      setStatus("error")
      const errorMsg = "Token reset password tidak ditemukan."
      setMessage(errorMsg)
      toast({
        title: "Token tidak valid",
        description: errorMsg,
        variant: "destructive",
      })
      return
    }

    if (!password || password.length < 8) {
      setStatus("error")
      const errorMsg = "Password minimal 8 karakter."
      setMessage(errorMsg)
      toast({
        title: "Password terlalu pendek",
        description: errorMsg,
        variant: "destructive",
      })
      return
    }

    if (password !== confirmPassword) {
      setStatus("error")
      const errorMsg = "Password dan konfirmasi password tidak sama."
      setMessage(errorMsg)
      toast({
        title: "Konfirmasi password tidak cocok",
        description: errorMsg,
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setStatus("idle")
    setMessage("")

    try {
      const response = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage(data.message || "Password berhasil direset. Anda akan diarahkan ke halaman login.")
        toast({
          title: "Password berhasil direset",
          description: data.message || "Silakan login dengan password baru Anda.",
        })

        setTimeout(() => {
          router.push("/auth/login")
        }, 2000)
      } else {
        setStatus("error")
        const errorMsg = data.error || "Gagal mereset password."
        setMessage(errorMsg)
        toast({
          title: "Gagal mereset password",
          description: errorMsg,
          variant: "destructive",
        })
      }
    } catch (error) {
      setStatus("error")
      const errorMsg = "Terjadi kesalahan tak terduga. Silakan coba lagi."
      setMessage(errorMsg)
      toast({
        title: "Terjadi kesalahan",
        description: errorMsg,
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
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Reset your password</h1>
              <p className="text-muted-foreground">
                Enter a new password for your account. Make sure it&apos;s strong and secure.
              </p>
            </div>

            {!token && (
              <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                <p>Token reset password tidak ditemukan. Silakan buka link dari email Anda.</p>
              </div>
            )}

            {status === "success" && (
              <div className="mb-6 p-4 rounded-md bg-emerald-50 text-emerald-700 flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4" />
                <p>{message}</p>
              </div>
            )}

            {status === "error" && (
              <div className="mb-6 p-4 rounded-md bg-red-50 text-red-700 flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                <p>{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading || !token}
                />
                <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading || !token}
                />
              </div>
              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:scale-[1.02]"
                disabled={isLoading || !token}
              >
                {isLoading ? "Updating password..." : "Update password"}
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
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-foreground transition-colors duration-200"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}


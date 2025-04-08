"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Layers, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react" // Tambahkan Eye dan EyeOff
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedSection } from "@/components/animated-section"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
  // Add this at the top of your component function
  const router = useRouter()
  const searchParams = useSearchParams()
  const verified = searchParams.get("verified") === "true"
  const { toast } = useToast()
  const { login, user, isCheckingAuth } = useAuth() // Add `user` and `isCheckingAuth` here
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [showPassword, setShowPassword] = useState(false) // State untuk mengontrol visibilitas password

  useEffect(() => {
    if (user?.role && !isCheckingAuth) {
      toast({
        title: "Role already selected",
        description: `You already have the ${user.role} role.`,
      })
      router.push(user.role === "student" ? "/student-dashboard" : "/freelancer-dashboard")
    }
  }, [user, router, toast, isCheckingAuth])

  // Add this after your state declarations
  useEffect(() => {
    if (verified) {
      toast({
        title: "Email verified",
        description: "Your email has been verified. You can now log in.",
      })
    }
  }, [verified, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (error) setError(null)
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

  // Modify your handleSubmit function to handle verification errors
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await login(formData.email, formData.password)

      if (result.success) {
        toast({
          title: "Login successful",
          description: "Welcome back to Ciao!",
        });

        // Get user role from the login result
        const userRole = result.role; // Assuming the role is returned in the result

        // Redirect to the appropriate dashboard based on role
        if (userRole === "student") {
          router.push("/student-dashboard");
        } else if (userRole === "freelancer") {
          router.push("/freelancer-dashboard");
        } else {
          // Handle unknown roles or redirect to a default page
          router.push("/unauthorized");
        }
      } else {
        // Check if the error is about email verification
        if (result.message.includes("verify your email")) {
          setError("Please verify your email before logging in")
          toast({
            title: "Verification required",
            description: "Please check your email for a verification link or request a new one.",
            variant: "destructive",
          })
          // Redirect to verification page
          router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`)
        } else {
          setError(result.message)
        }
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
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
              <h1 className="text-3xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground">Enter your credentials to access your account</p>
            </div>
            {error && (
              <div className="mb-6 p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"} // Ubah tipe input berdasarkan state
                      required
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="transition-all duration-200 pr-10" // Tambahkan padding untuk ikon
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)} // Toggle visibilitas password
                      className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-primary"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember-me"
                    checked={formData.rememberMe}
                    onCheckedChange={handleCheckboxChange}
                    disabled={isLoading}
                  />
                  <Label htmlFor="remember-me" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/auth/signup" className="font-medium text-primary underline-offset-4 hover:underline">
                Sign up
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


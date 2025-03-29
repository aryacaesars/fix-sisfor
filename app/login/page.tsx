"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Layers, ArrowRight, Github, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedSection } from "@/components/animated-section"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user types
    if (error) setError(null)
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }))
  }

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
        })

        // The auth context will handle redirection based on role
      } else {
        setError(result.message)
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

  const handleOAuthSignIn = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: "/role-selection" })
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      })
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
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="transition-all duration-200"
                  />
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
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="transition-all duration-200 hover:scale-[1.02]"
                  disabled={isLoading}
                  onClick={() => handleOAuthSignIn("google")}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Google
                </Button>
                <Button
                  variant="outline"
                  className="transition-all duration-200 hover:scale-[1.02]"
                  disabled={isLoading}
                  onClick={() => handleOAuthSignIn("github")}
                >
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </div>
            </div>
            <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
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


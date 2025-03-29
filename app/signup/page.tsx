"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Layers, ArrowRight, Github, CheckCircle, AlertCircle, BookOpen, Briefcase } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedSection } from "@/components/animated-section"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signIn } from "next-auth/react"

export default function SignupPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<"student" | "freelancer">("student")
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Clear general error
    if (generalError) setGeneralError(null)
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, agreeTerms: checked }))

    if (errors.agreeTerms) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors.agreeTerms
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.username.trim()) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = "You must agree to the terms and conditions"
    }

    if (!selectedRole) {
      newErrors.role = "Please select a role"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Register the user with the selected role
      const result = await signUp(formData.email, formData.password, formData.username, selectedRole)

      if (result.success) {
        toast({
          title: "Account created successfully",
          description: `Welcome to Ciao! You're now registered as a ${selectedRole}.`,
        })

        // Redirect to the appropriate dashboard based on role
        router.push(selectedRole === "student" ? "/student-dashboard" : "/freelancer-dashboard")
      } else {
        setGeneralError(result.message)
        toast({
          title: "Registration failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      setGeneralError("An unexpected error occurred. Please try again.")
      toast({
        title: "Registration failed",
        description: "There was a problem creating your account. Please try again.",
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
        title: "Registration failed",
        description: "An error occurred during registration. Please try again.",
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
              <h1 className="text-3xl font-bold">Create an account</h1>
              <p className="text-muted-foreground">Enter your information to get started</p>
            </div>

            {generalError && (
              <div className="mb-6 p-3 rounded-md bg-destructive/10 text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{generalError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    placeholder="johndoe"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`transition-all duration-200 ${errors.username ? "border-destructive" : ""}`}
                  />
                  {errors.username && (
                    <p className="text-xs text-destructive flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.username}
                    </p>
                  )}
                </div>
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
                    className={`transition-all duration-200 ${errors.email ? "border-destructive" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`transition-all duration-200 ${errors.password ? "border-destructive" : ""}`}
                  />
                  {errors.password && (
                    <p className="text-xs text-destructive flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.password}
                    </p>
                  )}
                  {formData.password && !errors.password && (
                    <div className="flex items-center gap-1 mt-1">
                      <div
                        className={`h-1 flex-1 rounded-full ${formData.password.length < 8 ? "bg-destructive" : formData.password.length < 12 ? "bg-yellow-500" : "bg-green-500"}`}
                      ></div>
                      <div
                        className={`h-1 flex-1 rounded-full ${formData.password.length < 12 ? "bg-muted" : "bg-green-500"}`}
                      ></div>
                      <div
                        className={`h-1 flex-1 rounded-full ${formData.password.length < 16 ? "bg-muted" : "bg-green-500"}`}
                      ></div>
                      <span className="text-xs text-muted-foreground ml-2">
                        {formData.password.length < 8 ? "Weak" : formData.password.length < 12 ? "Good" : "Strong"}
                      </span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`transition-all duration-200 ${errors.confirmPassword ? "border-destructive" : ""}`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-destructive flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.confirmPassword}
                    </p>
                  )}
                  {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <p className="text-xs text-green-500 flex items-center mt-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Passwords match
                    </p>
                  )}
                </div>

                {/* Role selection */}
                <div className="space-y-2">
                  <Label>Select your role</Label>
                  <Tabs
                    defaultValue="student"
                    className="w-full"
                    value={selectedRole}
                    onValueChange={(value) => setSelectedRole(value as "student" | "freelancer")}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="student" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        Student
                      </TabsTrigger>
                      <TabsTrigger value="freelancer" className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Freelancer
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="student" className="mt-2 text-sm text-muted-foreground">
                      As a student, you'll be able to track assignments, manage study groups, and organize your academic
                      schedule.
                    </TabsContent>
                    <TabsContent value="freelancer" className="mt-2 text-sm text-muted-foreground">
                      As a freelancer, you'll manage client projects, track billable hours, and streamline your business
                      workflow.
                    </TabsContent>
                  </Tabs>
                  {errors.role && (
                    <p className="text-xs text-destructive flex items-center mt-1">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.role}
                    </p>
                  )}
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="agree-terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={handleCheckboxChange}
                    disabled={isLoading}
                    className={errors.agreeTerms ? "border-destructive" : ""}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="agree-terms" className="text-sm font-normal">
                      I agree to the{" "}
                      <Link href="/terms" className="font-medium text-primary underline-offset-4 hover:underline">
                        terms of service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
                        privacy policy
                      </Link>
                    </Label>
                    {errors.agreeTerms && (
                      <p className="text-xs text-destructive flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {errors.agreeTerms}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full transition-all duration-200 hover:scale-[1.02]"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create account"}
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
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
                Sign in
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


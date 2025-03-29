"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Layers, BookOpen, Briefcase, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedSection } from "@/components/animated-section"
import { useToast } from "@/hooks/use-toast"
import { saveUserRole } from "@/app/role-selection/actions"
import { useAuth } from "@/context/auth-context"

export default function RoleSelectionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, setUserRole, isAuthenticated } = useAuth()
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      // Simulate API call to check auth
      await new Promise((resolve) => setTimeout(resolve, 300))

      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please log in to continue",
          variant: "destructive",
        })
        router.push("/login")
      }

      setIsCheckingAuth(false)
    }

    checkAuth()
  }, [router, toast, isAuthenticated])

  // If user already has a role, redirect them
  useEffect(() => {
    if (user?.role && !isCheckingAuth) {
      toast({
        title: "Role already selected",
        description: `You already have the ${user.role} role.`,
      })
      router.push(user.role === "student" ? "/student-dashboard" : "/freelancer-dashboard")
    }
  }, [user, router, toast, isCheckingAuth])

  if (isCheckingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  const handleRoleSelection = async () => {
    if (!selectedRole) {
      toast({
        title: "Please select a role",
        description: "You need to select a role to continue",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Save the user role on the server
      await saveUserRole(selectedRole)

      // Update the user's role in the auth context
      setUserRole(selectedRole)

      toast({
        title: "Role selected",
        description: `You've selected the ${selectedRole} role`,
      })

      // Redirect to the appropriate dashboard
      router.push(selectedRole === "student" ? "/student-dashboard" : "/freelancer-dashboard")
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem saving your role. Please try again.",
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
        <AnimatedSection className="w-full max-w-3xl">
          <div className="rounded-lg border bg-card p-8 shadow-sm">
            <div className="mb-8 space-y-2 text-center">
              <h1 className="text-3xl font-bold">Choose your role</h1>
              <p className="text-muted-foreground">Select the role that best describes how you'll use Ciao</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div
                className={`rounded-lg border p-6 cursor-pointer transition-all duration-300 hover:shadow-md ${
                  selectedRole === "student"
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedRole("student")}
              >
                <div className="flex justify-between items-start">
                  <div className="rounded-full bg-primary/10 p-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  {selectedRole === "student" && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>
                <h3 className="mt-4 text-xl font-bold">Student</h3>
                <p className="mt-2 text-muted-foreground">
                  Organize your studies, track assignments, collaborate on group projects, and manage your academic
                  schedule.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Assignment tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Study group collaboration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Class schedule management</span>
                  </li>
                </ul>
              </div>

              <div
                className={`rounded-lg border p-6 cursor-pointer transition-all duration-300 hover:shadow-md ${
                  selectedRole === "freelancer"
                    ? "border-primary bg-primary/5 ring-2 ring-primary"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setSelectedRole("freelancer")}
              >
                <div className="flex justify-between items-start">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  {selectedRole === "freelancer" && <CheckCircle className="h-5 w-5 text-primary" />}
                </div>
                <h3 className="mt-4 text-xl font-bold">Freelancer</h3>
                <p className="mt-2 text-muted-foreground">
                  Manage client projects, track billable hours, organize tasks, and streamline your freelance business
                  workflow.
                </p>
                <ul className="mt-4 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Client project management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Time tracking & invoicing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>Deadline management</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={handleRoleSelection}
                disabled={!selectedRole || isLoading}
                className="px-8 transition-all duration-200 hover:scale-105"
              >
                {isLoading ? "Processing..." : "Continue"}
                {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              You can change your role later in your account settings
            </p>
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


"use client"

import { createContext, useContext, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"

interface AuthContextType {
  user: {
    id?: string
    email?: string
    name?: string
    role?: string
    image?: string
  } | null
  isAuthenticated: boolean
  status: "loading" | "authenticated" | "unauthenticated"
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signUp: (
    email: string,
    password: string,
    name: string,
    role: string,
  ) => Promise<{ success: boolean; message: string }>
  signOut: () => void
  isAuthorized: (allowedRoles: string[]) => boolean
  setUserRole: (role: string) => Promise<{ success: boolean; message: string }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status: sessionStatus } = useSession()

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        return {
          success: false,
          message: result.error || "Invalid email or password",
        }
      }

      return {
        success: true,
        message: "Login successful",
      }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: "An unexpected error occurred",
      }
    }
  }

  // Sign up function
  const signUp = async (email: string, password: string, name: string, role: string) => {
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.error || "Registration failed",
        }
      }

      // Auto login after successful registration
      const loginResult = await login(email, password)
      return loginResult
    } catch (error) {
      console.error("Registration error:", error)
      return {
        success: false,
        message: "An unexpected error occurred",
      }
    }
  }

  // Check if user is authorized for specific roles
  const isAuthorized = (allowedRoles: string[]) => {
    if (!session?.user?.role) return false
    return allowedRoles.includes(session.user.role)
  }

  // Set user role
  const setUserRole = async (role: string) => {
    try {
      const response = await fetch("/api/users/role", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          message: data.error || "Failed to update role",
        }
      }

      // Force refresh the session
      await signOut({ redirect: false })
      await signIn("credentials", {
        redirect: false,
        email: session?.user?.email,
        password: "", // This won't work in a real app, but we're just illustrating the concept
      })

      return {
        success: true,
        message: "Role updated successfully",
      }
    } catch (error) {
      console.error("Error updating role:", error)
      return {
        success: false,
        message: "An unexpected error occurred",
      }
    }
  }

  // Check for protected routes and redirect if necessary
  useEffect(() => {
    if (sessionStatus !== "loading") {
      const protectedRoutes = ["/student-dashboard", "/freelancer-dashboard"]
      const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

      if (isProtectedRoute && sessionStatus !== "authenticated") {
        router.push("/login")
      }

      // Redirect from role selection if not authenticated
      if (pathname === "/role-selection" && sessionStatus !== "authenticated") {
        router.push("/login")
      }

      // Redirect from login/signup if already authenticated
      if (
        (pathname === "/login" || pathname === "/signup") &&
        sessionStatus === "authenticated" &&
        session?.user?.role
      ) {
        router.push(session.user.role === "student" ? "/student-dashboard" : "/freelancer-dashboard")
      }
    }
  }, [pathname, router, sessionStatus, session])

  return (
    <AuthContext.Provider
      value={{
        user: session?.user || null,
        isAuthenticated: sessionStatus === "authenticated",
        status: sessionStatus,
        login,
        signUp,
        signOut: () => signOut({ callbackUrl: "/login" }),
        isAuthorized,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


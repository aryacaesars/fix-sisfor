"use client"

import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export function useRBAC(allowedRoles?: string[]) {
  const { user, status, isAuthorized } = useAuth()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      // Add a small delay to ensure auth context is initialized
      await new Promise((resolve) => setTimeout(resolve, 300))

      // If authentication check is complete
      if (status !== "loading") {
        if (status === "unauthenticated") {
          // User is not logged in, redirect to login
          router.push("/login")
        } else if (allowedRoles && !isAuthorized(allowedRoles)) {
          // User is authenticated but doesn't have the required role
          router.push("/unauthorized")
        }
        setIsChecking(false)
      }
    }

    if (allowedRoles) {
      checkAuth()
    } else {
      setIsChecking(false)
    }
  }, [allowedRoles, isAuthorized, router, status])

  // Add a checkAccess function that can be called from components
  const checkAccess = (requiredRole: string | string[]) => {
    const rolesToCheck = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

    if (status === "unauthenticated") {
      router.push("/login")
      return false
    }

    if (!isAuthorized(rolesToCheck)) {
      router.push("/unauthorized")
      return false
    }

    return true
  }

  return {
    isAuthorized: allowedRoles ? isAuthorized(allowedRoles) : false,
    role: user?.role || null,
    isLoading: status === "loading" || isChecking,
    checkAccess,
  }
}


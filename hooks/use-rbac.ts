"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export function useRBAC(allowedRoles: string[]) {
  const { data: session, status } = useSession()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true)
      
      try {
        // Not authenticated
        if (status === "unauthenticated") {
          console.log("Session unauthenticated")
          setIsAuthorized(false)
          setIsLoading(false)
          return
        }
        
        // Still loading session
        if (status === "loading") {
          console.log("Session loading")
          return // Keep isLoading true
        }
        
        // Authenticated, check role
        if (session?.user) {
          console.log("Session authenticated:", session.user)
          
          // Get user role from session or API
          let userRole = (session.user as any)?.role
          
          // Log for debugging
          console.log("User role from session:", userRole)
          
          // Make role case-insensitive for comparison
          const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase())
          const normalizedUserRole = userRole?.toLowerCase()
          
          console.log("Checking if", normalizedUserRole, "is in", normalizedAllowedRoles)
          
          // Check if user has the required role
          const hasAccess = normalizedUserRole && normalizedAllowedRoles.includes(normalizedUserRole)
          console.log("Has access:", hasAccess)
          
          setIsAuthorized(hasAccess)
          setUser(session.user)
        } else {
          console.log("No user in session")
          setIsAuthorized(false)
        }
      } catch (error) {
        console.error("Error checking authorization:", error)
        setIsAuthorized(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [allowedRoles, session, status])

  return { isAuthorized, isLoading, user }
}


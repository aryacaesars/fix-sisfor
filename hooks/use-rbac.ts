"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import Cookies from 'js-cookie'

export function useRBAC(allowedRoles: string[]) {
  const { data: session, status } = useSession()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true)
      
      try {
        // Check both session and cookie
        const storedSession = Cookies.get('auth-session')
        const currentSession = session || (storedSession ? JSON.parse(storedSession) : null)
        
        // Not authenticated
        if (status === "unauthenticated" && !storedSession) {
          console.log("Session unauthenticated")
          setIsAuthorized(false)
          setIsLoading(false)
          return
        }
        
        // Still loading session
        if (status === "loading" && !storedSession) {
          console.log("Session loading")
          return // Keep isLoading true
        }
        
        // Authenticated, check role
        if (currentSession?.user) {
          console.log("Session authenticated:", currentSession.user)
          
          // Get user role from session or stored session
          let userRole = (currentSession.user as any)?.role
          
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
          setUser(currentSession.user)
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


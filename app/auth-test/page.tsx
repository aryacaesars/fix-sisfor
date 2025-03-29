"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"

export default function AuthTestPage() {
  const { status, role, signOut } = useAuth()
  const router = useRouter()
  const [authStatus, setAuthStatus] = useState<string | null>(null)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    // Check localStorage directly
    setAuthStatus(localStorage.getItem("auth-status"))
    setUserRole(localStorage.getItem("user-role"))
  }, [])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Authentication Test</CardTitle>
          <CardDescription>Verify the current authentication state</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="font-medium">Auth Context Status:</div>
            <div>{status}</div>

            <div className="font-medium">Auth Context Role:</div>
            <div>{role || "None"}</div>

            <div className="font-medium">localStorage Auth Status:</div>
            <div>{authStatus || "None"}</div>

            <div className="font-medium">localStorage User Role:</div>
            <div>{userRole || "None"}</div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/login")}>
            Go to Login
          </Button>
          <Button variant="outline" onClick={() => router.push("/role-selection")}>
            Go to Role Selection
          </Button>
          <Button variant="destructive" onClick={signOut}>
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}


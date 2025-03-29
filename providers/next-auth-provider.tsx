"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import { AuthProvider } from "@/context/auth-context"

export function NextAuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>{children}</AuthProvider>
    </SessionProvider>
  )
}


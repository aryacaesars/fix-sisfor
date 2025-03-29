"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Layers, Menu, X, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "next-themes"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
}

interface DashboardLayoutProps {
  children: React.ReactNode
  navItems: NavItem[]
  role: "student" | "freelancer"
}

export function DashboardLayout({ children, navItems, role }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { signOut, user } = useAuth()
  const isMobile = useMobile()
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)
  const { theme } = useTheme()

  // Close sidebar on mobile when path changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [pathname, isMobile])

  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile)
  }, [isMobile])

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
            <Link href={`/${role}-dashboard`} className="flex items-center gap-2">
              <Layers className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold hidden md:inline-block">Ciao</span>
            </Link>
            <div className="ml-2 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary capitalize">
              {role}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="transition-all duration-200 hover:scale-110"
              aria-label="Sign out"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-30 mt-16 w-64 transform border-r bg-background transition-transform duration-300 ease-in-out",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            isMobile ? "shadow-lg" : "",
          )}
        >
          <div className="flex h-[calc(100vh-4rem)] flex-col justify-between py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </nav>
            <div className="px-2 space-y-1">
              <div className="px-3 py-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user?.name || user?.email || "User"}</p>
                    <p className="text-xs text-muted-foreground capitalize">{role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main
          className={cn("flex-1 transition-all duration-300 ease-in-out", sidebarOpen && !isMobile ? "ml-64" : "ml-0")}
        >
          <div className="container py-6">{children}</div>
        </main>
      </div>
    </div>
  )
}


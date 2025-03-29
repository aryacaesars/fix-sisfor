"use client"

import { Home, BookOpen, LayoutGrid, FileText, Settings, User } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import { useRBAC } from "@/hooks/use-rbac"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

const studentNavItems = [
  {
    title: "Home",
    href: "/student-dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Kanban Board",
    href: "/student-dashboard/kanban",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    title: "Assignments",
    href: "/student-dashboard/assignments",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Form Templates",
    href: "/student-dashboard/templates",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/student-dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Account",
    href: "/student-dashboard/account",
    icon: <User className="h-5 w-5" />,
  },
]

export default function StudentDashboard() {
  const { isAuthorized, isLoading, role } = useRBAC(["student"])
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated but not authorized (wrong role)
    if (!isLoading && !isAuthorized && localStorage.getItem("auth-status") === "authenticated") {
      // They're logged in but with the wrong role
      router.push("/unauthorized")
    }
  }, [isLoading, isAuthorized, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // The useRBAC hook will handle redirection
  }

  return (
    <DashboardLayout navItems={studentNavItems} role="student">
      <AnimatedSection>
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Your assignments due this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>Math Homework</span>
                  <span className="text-sm text-muted-foreground">Tomorrow</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Physics Lab Report</span>
                  <span className="text-sm text-muted-foreground">Wed, 4:00 PM</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>English Essay</span>
                  <span className="text-sm text-muted-foreground">Fri, 11:59 PM</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Study Groups</CardTitle>
              <CardDescription>Your active study groups</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>Calculus Study Group</span>
                  <span className="text-sm text-muted-foreground">5 members</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Chemistry Lab Partners</span>
                  <span className="text-sm text-muted-foreground">3 members</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Programming Project Team</span>
                  <span className="text-sm text-muted-foreground">4 members</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>Today's classes</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>Introduction to Psychology</span>
                  <span className="text-sm text-muted-foreground">9:00 AM</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Calculus II</span>
                  <span className="text-sm text-muted-foreground">11:00 AM</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Computer Science 101</span>
                  <span className="text-sm text-muted-foreground">2:00 PM</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Assignment Progress</CardTitle>
              <CardDescription>Your overall progress this semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm font-medium">24/36</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "67%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">In Progress</span>
                    <span className="text-sm font-medium">8/36</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: "22%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Not Started</span>
                    <span className="text-sm font-medium">4/36</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: "11%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Submitted Physics Lab Report</p>
                    <p className="text-xs text-muted-foreground">Today, 10:23 AM</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Added new assignment: English Essay</p>
                    <p className="text-xs text-muted-foreground">Yesterday, 4:45 PM</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Updated Kanban board for CS Project</p>
                    <p className="text-xs text-muted-foreground">Yesterday, 2:30 PM</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>
    </DashboardLayout>
  )
}


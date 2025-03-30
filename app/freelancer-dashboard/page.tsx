"use client"

import { Home, Briefcase, LayoutGrid, FileText, Settings, User, Calculator } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import { useRBAC } from "@/hooks/use-rbac"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const freelancerNavItems = [
  {
    title: "Home",
    href: "/freelancer-dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Kanban Board",
    href: "/freelancer-dashboard/kanban",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    title: "Projects",
    href: "/freelancer-dashboard/projects",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "Form Templates",
    href: "/freelancer-dashboard/form-templates",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/freelancer-dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Account",
    href: "/freelancer-dashboard/account",
    icon: <User className="h-5 w-5" />,
  },
]

export default function FreelancerDashboard() {
  const { isAuthorized, isLoading, role } = useRBAC(["freelancer"])
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
    <DashboardLayout navItems={freelancerNavItems} role="freelancer">
      <AnimatedSection>
        <h1 className="text-3xl font-bold mb-6">Freelancer Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Your current client projects</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>E-commerce Website Redesign</span>
                  <span className="text-sm text-muted-foreground">Due in 2 weeks</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Mobile App Development</span>
                  <span className="text-sm text-muted-foreground">Due in 1 month</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Brand Identity Design</span>
                  <span className="text-sm text-muted-foreground">Due in 3 days</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Time Tracking</CardTitle>
              <CardDescription>Hours logged this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>E-commerce Website</span>
                  <span className="text-sm text-muted-foreground">12 hours</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Mobile App</span>
                  <span className="text-sm text-muted-foreground">8 hours</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Brand Identity</span>
                  <span className="text-sm text-muted-foreground">5 hours</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>Your nearest project milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>Brand Identity: Logo Delivery</span>
                  <span className="text-sm text-muted-foreground">Apr 12</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>E-commerce: Wireframes</span>
                  <span className="text-sm text-muted-foreground">Apr 18</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Mobile App: UI Design</span>
                  <span className="text-sm text-muted-foreground">Apr 25</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
              <CardDescription>Your financial summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">This Month</span>
                    <span className="text-sm font-medium">$4,250</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "70%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Last Month</span>
                    <span className="text-sm font-medium">$3,800</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "63%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Outstanding Invoices</span>
                    <span className="text-sm font-medium">$1,200</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: "20%" }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Client Communication</CardTitle>
              <CardDescription>Recent messages and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">E-commerce Client: Feedback on Wireframes</p>
                    <p className="text-xs text-muted-foreground">Today, 11:30 AM</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Mobile App Client: Contract Signed</p>
                    <p className="text-xs text-muted-foreground">Yesterday, 3:15 PM</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <Calculator className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Brand Identity Client: Invoice Paid</p>
                    <p className="text-xs text-muted-foreground">Yesterday, 10:45 AM</p>
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


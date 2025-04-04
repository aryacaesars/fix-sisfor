"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatedSection } from "@/components/animated-section"
import {
  Home,
  Briefcase,
  LayoutGrid,
  FileText,
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  DollarSign,
  Settings,
  User,
} from "lucide-react"
import { useRBAC } from "@/hooks/use-rbac"

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

interface Project {
  id: string
  title: string
  client: string
  startDate: string
  endDate: string
  budget: number
  status: "active" | "completed" | "on-hold"
  description: string
}

export default function FreelancerProjectsPage() {
  const { isAuthorized, isLoading } = useRBAC(["freelancer"])

  const [projects, setProjects] = useState<Project[]>([]) // Removed dummy data

  const [searchTerm, setSearchTerm] = useState("")

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your projects...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // The useRBAC hook will handle redirection
  }

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "completed":
        return "bg-blue-500"
      case "on-hold":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

  return (
    <DashboardLayout navItems={freelancerNavItems} role="freelancer">
      <AnimatedSection>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Button className="transition-all duration-200 hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects or clients..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.status)}`}>
                    {project.status}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{project.client}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-4">{project.description}</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(project.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(project.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-1 col-span-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{formatCurrency(project.budget)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  Details
                </Button>
                <Button size="sm">Manage</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </AnimatedSection>
    </DashboardLayout>
  )
}


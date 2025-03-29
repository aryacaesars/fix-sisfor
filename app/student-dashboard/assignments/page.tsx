"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatedSection } from "@/components/animated-section"
import { Home, BookOpen, LayoutGrid, FileText, Settings, User, Plus, Search, Filter, Calendar } from "lucide-react"
import { useRBAC } from "@/hooks/use-rbac"

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

interface Assignment {
  id: string
  title: string
  course: string
  dueDate: string
  status: "completed" | "in-progress" | "not-started"
}

export default function StudentAssignmentsPage() {
  const { isAuthorized, isLoading } = useRBAC(["student"])

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: "1",
      title: "Research Paper on Climate Change",
      course: "Environmental Science",
      dueDate: "2023-04-15",
      status: "in-progress",
    },
    {
      id: "2",
      title: "Problem Set 3: Derivatives",
      course: "Calculus II",
      dueDate: "2023-04-10",
      status: "not-started",
    },
    {
      id: "3",
      title: "Lab Report: Titration Experiment",
      course: "Chemistry 101",
      dueDate: "2023-04-08",
      status: "in-progress",
    },
    {
      id: "4",
      title: "Essay on Shakespeare's Hamlet",
      course: "English Literature",
      dueDate: "2023-04-20",
      status: "not-started",
    },
    {
      id: "5",
      title: "Programming Project: Sorting Algorithms",
      course: "Computer Science 101",
      dueDate: "2023-04-12",
      status: "completed",
    },
    {
      id: "6",
      title: "Presentation on Renewable Energy",
      course: "Environmental Science",
      dueDate: "2023-04-18",
      status: "not-started",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your assignments...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // The useRBAC hook will handle redirection
  }

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-yellow-500"
      case "not-started":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <DashboardLayout navItems={studentNavItems} role="student">
      <AnimatedSection>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Assignments</h1>
          <Button className="transition-all duration-200 hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assignments..."
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

        <div className="space-y-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="transition-all duration-200 hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-medium">{assignment.title}</h3>
                    <p className="text-sm text-muted-foreground">{assignment.course}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatDate(assignment.dueDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(assignment.status)}`}></div>
                      <span className="text-sm capitalize">{assignment.status.replace("-", " ")}</span>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </AnimatedSection>
    </DashboardLayout>
  )
}


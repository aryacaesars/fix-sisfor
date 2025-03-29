"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedSection } from "@/components/animated-section"
import {
  Home,
  BookOpen,
  LayoutGrid,
  FileText,
  Settings,
  User,
  Plus,
  Download,
  ExternalLink,
  Search,
  Filter,
} from "lucide-react"
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

interface Template {
  id: string
  title: string
  description: string
  type: string
  category: "academic" | "research" | "planning" | "other"
  googleDocsUrl: string
}

export default function StudentTemplatesPage() {
  const { isAuthorized, isLoading } = useRBAC(["student"])
  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const templates: Template[] = [
    // Academic Templates
    {
      id: "1",
      title: "Lab Report Template",
      description:
        "Standard template for science lab reports with sections for hypothesis, materials, procedure, results, and conclusion.",
      type: "Academic",
      category: "academic",
      googleDocsUrl: "https://docs.google.com/document/d/example1",
    },
    {
      id: "2",
      title: "Essay Outline Template",
      description:
        "Structure your essays with this template featuring introduction, body paragraphs, and conclusion sections.",
      type: "Academic",
      category: "academic",
      googleDocsUrl: "https://docs.google.com/document/d/example2",
    },
    {
      id: "3",
      title: "Math Problem Set Template",
      description: "Formatted template for solving and presenting mathematical problems and solutions.",
      type: "Academic",
      category: "academic",
      googleDocsUrl: "https://docs.google.com/document/d/example3",
    },

    // Research Templates
    {
      id: "4",
      title: "Research Paper Format",
      description: "Academic research paper template with proper citation formatting and section organization.",
      type: "Research",
      category: "research",
      googleDocsUrl: "https://docs.google.com/document/d/example4",
    },
    {
      id: "5",
      title: "Literature Review Template",
      description: "Template for organizing and writing literature reviews for research papers.",
      type: "Research",
      category: "research",
      googleDocsUrl: "https://docs.google.com/document/d/example5",
    },
    {
      id: "6",
      title: "Research Proposal Template",
      description: "Structured template for creating research proposals with methodology and timeline sections.",
      type: "Research",
      category: "research",
      googleDocsUrl: "https://docs.google.com/document/d/example6",
    },

    // Planning Templates
    {
      id: "7",
      title: "Study Schedule Planner",
      description: "Weekly study schedule template to organize your study sessions and track progress.",
      type: "Planning",
      category: "planning",
      googleDocsUrl: "https://docs.google.com/document/d/example7",
    },
    {
      id: "8",
      title: "Project Timeline Template",
      description: "Timeline template for planning and tracking group project milestones and deadlines.",
      type: "Planning",
      category: "planning",
      googleDocsUrl: "https://docs.google.com/document/d/example8",
    },
    {
      id: "9",
      title: "Semester Planner",
      description:
        "Comprehensive semester planning template with course schedules, assignment tracking, and exam dates.",
      type: "Planning",
      category: "planning",
      googleDocsUrl: "https://docs.google.com/document/d/example9",
    },

    // Other Templates
    {
      id: "10",
      title: "Presentation Slides Template",
      description: "Clean, academic presentation template with slide layouts for various content types.",
      type: "Presentation",
      category: "other",
      googleDocsUrl: "https://docs.google.com/document/d/example10",
    },
    {
      id: "11",
      title: "Group Project Proposal",
      description: "Template for proposing group projects with objectives, timeline, and resource requirements.",
      type: "Project",
      category: "other",
      googleDocsUrl: "https://docs.google.com/document/d/example11",
    },
    {
      id: "12",
      title: "Peer Review Form",
      description: "Structured form for conducting peer reviews of academic papers or project contributions.",
      type: "Assessment",
      category: "other",
      googleDocsUrl: "https://docs.google.com/document/d/example12",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your templates...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // The useRBAC hook will handle redirection
  }

  const filteredTemplates = templates.filter((template) => {
    // Filter by search term
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.type.toLowerCase().includes(searchTerm.toLowerCase())

    // Filter by category tab
    const matchesCategory =
      activeTab === "all" ||
      (activeTab === "academic" && template.category === "academic") ||
      (activeTab === "research" && template.category === "research") ||
      (activeTab === "planning" && template.category === "planning") ||
      (activeTab === "other" && template.category === "other")

    return matchesSearch && matchesCategory
  })

  return (
    <DashboardLayout navItems={studentNavItems} role="student">
      <AnimatedSection>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Form Templates</h1>
          <Button className="transition-all duration-200 hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
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

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2">
                  <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted">{template.type}</span>
                </div>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button size="sm" className="gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Docs
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="rounded-full bg-muted w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? `No templates match "${searchTerm}". Try a different search term.`
                : "No templates available in this category."}
            </p>
          </div>
        )}
      </AnimatedSection>
    </DashboardLayout>
  )
}


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
  FileCode,
  Calculator,
  Plus,
  Search,
  Filter,
  ExternalLink,
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
    title: "PRD",
    href: "/freelancer-dashboard/prd",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "SRS",
    href: "/freelancer-dashboard/srs",
    icon: <FileCode className="h-5 w-5" />,
  },
  {
    title: "Quotation",
    href: "/freelancer-dashboard/quotation",
    icon: <Calculator className="h-5 w-5" />,
  },
]

interface PRD {
  id: string
  title: string
  project: string
  client: string
  createdDate: string
  lastUpdated: string
  status: "draft" | "in-review" | "approved" | "archived"
  googleDocsUrl: string
}

export default function FreelancerPRDPage() {
  const { isAuthorized, isLoading } = useRBAC(["freelancer"])

  const [prds, setPRDs] = useState<PRD[]>([
    {
      id: "1",
      title: "E-commerce Website PRD",
      project: "E-commerce Website Redesign",
      client: "Fashion Boutique Inc.",
      createdDate: "2023-03-05",
      lastUpdated: "2023-03-15",
      status: "approved",
      googleDocsUrl: "https://docs.google.com/document/d/example1",
    },
    {
      id: "2",
      title: "Health Tracking App PRD",
      project: "Mobile App Development",
      client: "HealthTech Startup",
      createdDate: "2023-02-20",
      lastUpdated: "2023-03-10",
      status: "in-review",
      googleDocsUrl: "https://docs.google.com/document/d/example2",
    },
    {
      id: "3",
      title: "Brand Identity Guidelines PRD",
      project: "Brand Identity Design",
      client: "New Cafe Chain",
      createdDate: "2023-03-22",
      lastUpdated: "2023-03-25",
      status: "draft",
      googleDocsUrl: "https://docs.google.com/document/d/example3",
    },
    {
      id: "4",
      title: "Legal Firm Website PRD",
      project: "Corporate Website Development",
      client: "Legal Firm LLC",
      createdDate: "2023-01-15",
      lastUpdated: "2023-02-10",
      status: "archived",
      googleDocsUrl: "https://docs.google.com/document/d/example4",
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your PRDs...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // The useRBAC hook will handle redirection
  }

  const filteredPRDs = prds.filter(
    (prd) =>
      prd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prd.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prd.client.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-500"
      case "in-review":
        return "bg-blue-500"
      case "approved":
        return "bg-green-500"
      case "archived":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <DashboardLayout navItems={freelancerNavItems} role="freelancer">
      <AnimatedSection>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Product Requirement Documents</h1>
          <Button className="transition-all duration-200 hover:scale-105">
            <Plus className="h-4 w-4 mr-2" />
            New PRD
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search PRDs, projects, or clients..."
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
          {filteredPRDs.map((prd) => (
            <Card key={prd.id} className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{prd.title}</CardTitle>
                  <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(prd.status)}`}>
                    {prd.status.replace("-", " ")}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{prd.project}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Client:</span>
                    <span>{prd.client}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created:</span>
                    <span>{formatDate(prd.createdDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span>{formatDate(prd.lastUpdated)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  View
                </Button>
                <Button size="sm" className="gap-1">
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Docs
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </AnimatedSection>
    </DashboardLayout>
  )
}


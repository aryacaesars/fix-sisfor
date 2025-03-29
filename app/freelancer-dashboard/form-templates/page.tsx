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
  Briefcase,
  LayoutGrid,
  FileText,
  FileCode,
  Calculator,
  Plus,
  Download,
  ExternalLink,
  Search,
  Filter,
  Receipt,
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
    href: "/freelancer-dashboard/accounts",
    icon: <User className="h-5 w-5" />,
  },
]

interface Template {
  id: string
  title: string
  description: string
  type: string
  category: "prd" | "srs" | "quotation" | "invoice"
  googleDocsUrl: string
}

export default function FreelancerFormTemplatesPage() {
  const { isAuthorized, isLoading } = useRBAC(["freelancer"])
  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const templates: Template[] = [
    // PRD Templates
    {
      id: "1",
      title: "Web Development PRD",
      description: "Comprehensive product requirements document template for web development projects.",
      type: "PRD",
      category: "prd",
      googleDocsUrl: "https://docs.google.com/document/d/example1",
    },
    {
      id: "2",
      title: "Mobile App PRD",
      description: "Detailed product requirements document for iOS and Android app development.",
      type: "PRD",
      category: "prd",
      googleDocsUrl: "https://docs.google.com/document/d/example2",
    },
    {
      id: "3",
      title: "E-commerce PRD",
      description: "Product requirements document template specifically for e-commerce platforms.",
      type: "PRD",
      category: "prd",
      googleDocsUrl: "https://docs.google.com/document/d/example3",
    },

    // SRS Templates
    {
      id: "4",
      title: "Web Application SRS",
      description:
        "Software requirements specification template for web applications with detailed functional requirements.",
      type: "SRS",
      category: "srs",
      googleDocsUrl: "https://docs.google.com/document/d/example4",
    },
    {
      id: "5",
      title: "Mobile App SRS",
      description: "Comprehensive software requirements specification for mobile applications.",
      type: "SRS",
      category: "srs",
      googleDocsUrl: "https://docs.google.com/document/d/example5",
    },
    {
      id: "6",
      title: "API Development SRS",
      description: "Software requirements specification template for API development projects.",
      type: "SRS",
      category: "srs",
      googleDocsUrl: "https://docs.google.com/document/d/example6",
    },

    // Quotation Templates
    {
      id: "7",
      title: "Web Development Quotation",
      description: "Comprehensive quotation template for web development projects with detailed cost breakdown.",
      type: "Quotation",
      category: "quotation",
      googleDocsUrl: "https://docs.google.com/document/d/example7",
    },
    {
      id: "8",
      title: "Design Services Quotation",
      description: "Professional quotation template for graphic design, UI/UX, and branding services.",
      type: "Quotation",
      category: "quotation",
      googleDocsUrl: "https://docs.google.com/document/d/example8",
    },
    {
      id: "9",
      title: "Fixed Price Project Agreement",
      description: "Fixed price project quotation and agreement template with milestone payments.",
      type: "Quotation",
      category: "quotation",
      googleDocsUrl: "https://docs.google.com/document/d/example9",
    },

    // Invoice Templates
    {
      id: "10",
      title: "Standard Invoice",
      description: "Professional invoice template with standard payment terms and company details.",
      type: "Invoice",
      category: "invoice",
      googleDocsUrl: "https://docs.google.com/document/d/example10",
    },
    {
      id: "11",
      title: "Detailed Service Invoice",
      description: "Detailed invoice template with itemized services, hourly rates, and quantity breakdowns.",
      type: "Invoice",
      category: "invoice",
      googleDocsUrl: "https://docs.google.com/document/d/example11",
    },
    {
      id: "12",
      title: "Retainer Invoice",
      description: "Monthly retainer invoice template for ongoing client services with recurring payment terms.",
      type: "Invoice",
      category: "invoice",
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
      (activeTab === "prd" && template.category === "prd") ||
      (activeTab === "srs" && template.category === "srs") ||
      (activeTab === "quotation" && template.category === "quotation") ||
      (activeTab === "invoice" && template.category === "invoice")

    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "prd":
        return <FileText className="h-4 w-4 text-primary" />
      case "srs":
        return <FileCode className="h-4 w-4 text-primary" />
      case "quotation":
        return <Calculator className="h-4 w-4 text-primary" />
      case "invoice":
        return <Receipt className="h-4 w-4 text-primary" />
      default:
        return <FileText className="h-4 w-4 text-primary" />
    }
  }

  return (
    <DashboardLayout navItems={freelancerNavItems} role="freelancer">
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
            <TabsTrigger value="prd">PRD</TabsTrigger>
            <TabsTrigger value="srs">SRS</TabsTrigger>
            <TabsTrigger value="quotation">Quotation</TabsTrigger>
            <TabsTrigger value="invoice">Invoice</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">{getCategoryIcon(template.category)}</div>
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


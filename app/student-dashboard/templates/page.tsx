"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedSection } from "@/components/animated-section"
import {
  Home,
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

const studentNavItems = [
  {
    title: "Home",
    href: "/student-dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Form Templates",
    href: "/student-dashboard/form-templates",
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

export default function StudentFormTemplatesPage() {
  const { isAuthorized, isLoading } = useRBAC(["student"])
  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
    link: "",
  })

  type Template = {
    id: string
    title: string
    description: string
    type: string
    category: string
    link: string
  }

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await fetch("/api/templates")
        if (!response.ok) {
          throw new Error("Failed to fetch templates")
        }
        const data = await response.json()
        setTemplates(data)
      } catch (error) {
        console.error("Failed to fetch templates:", error)
      } finally {
        setLoadingTemplates(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to create template")
      }

      const newTemplate = await response.json()
      setTemplates((prev) => [newTemplate, ...prev])
      setIsModalOpen(false)
      setFormData({ title: "", description: "", type: "", category: "", link: "" })
    } catch (error) {
      console.error("Error creating template:", error)
    }
  }

  if (isLoading || loadingTemplates) {
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
    const matchesSearch =
      template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      activeTab === "all" ||
      (activeTab === "assignment" && template.category === "assignment") ||
      (activeTab === "notes" && template.category === "notes") ||
      (activeTab === "project" && template.category === "project")

    return matchesSearch && matchesCategory
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "assignment":
        return <FileText className="h-4 w-4 text-primary" />
      case "notes":
        return <FileCode className="h-4 w-4 text-primary" />
      case "project":
        return <Calculator className="h-4 w-4 text-primary" />
      default:
        return <FileText className="h-4 w-4 text-primary" />
    }
  }

  return (
    <DashboardLayout navItems={studentNavItems} role="student">
      <AnimatedSection>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Form Templates</h1>
          <Button
            className="transition-all duration-200 hover:scale-105"
            onClick={() => setIsModalOpen(true)}
          >
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
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="assignment">Assignment</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="project">Project</TabsTrigger>
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
              <CardFooter className="flex flex-col items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1 w-full">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button variant="default" size="sm" className="gap-1 w-full">
                  <a
                    href={template.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-secondary w-full justify-center"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open in Google Docs
                  </a>
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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Template</h2>
            <div className="space-y-4">
              <Input
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleInputChange}
              />
              <Input
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
              />
              <Input
                name="type"
                placeholder="Type (e.g., document, form)"
                value={formData.type}
                onChange={handleInputChange}
              />
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Category</option>
                <option value="assignment">Assignment</option>
                <option value="notes">Notes</option>
                <option value="project">Project</option>
              </select>
              <Input
                name="link"
                placeholder="Google Docs Link"
                value={formData.link}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex justify-end mt-4 space-x-2">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
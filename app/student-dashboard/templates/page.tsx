"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedSection } from "@/components/animated-section"
import {
  FileText,
  FileCode,
  Calculator,
  Plus,
  Download,
  ExternalLink,
  Search,
  Filter,
  X,
  Trash2,
  Settings,
  Pencil
} from "lucide-react"
import { useRBAC } from "@/hooks/use-rbac"
import { createPortal } from "react-dom"
import { showSuccessNotification, showErrorNotification } from "@/components/ui/notification"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type Template = {
  id: string
  title: string
  description: string
  type: string
  category: string
  link: string
}

// Move Modal to a separate component
const TemplateFormModal = ({ isOpen, onClose, onSubmit }: { isOpen: boolean; onClose: () => void; onSubmit: (data: any) => void }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    link: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    onSubmit(formData)
    setFormData({
      title: "",
      description: "",
      category: "",
      link: "",
    })
  }

  if (!isOpen) return null
  
  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
      <div className="bg-background p-8 rounded-lg shadow-lg w-full max-w-4xl border border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Create Template</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
              <Input
                name="title"
                placeholder="Enter template title"
                value={formData.title}
                onChange={handleInputChange}
                className="bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
              <Input
                name="description"
                placeholder="Enter template description"
                value={formData.description}
                onChange={handleInputChange}
                className="bg-background"
              />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-md bg-background text-foreground"
              >
                <option value="">Select Category</option>
                <option value="assignment">Assignment</option>
                <option value="notes">Notes</option>
                <option value="project">Project</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Google Docs Link</label>
              <Input
                name="link"
                placeholder="Enter Google Docs link"
                value={formData.link}
                onChange={handleInputChange}
                className="bg-background"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6 space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Template
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function StudentFormTemplatesPage() {
  const { isAuthorized, isLoading } = useRBAC(["student"])
  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isManageMode, setIsManageMode] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    link: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    setIsMounted(true)
    
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

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    
    return () => {
      document.body.style.overflow = ""
    }
  }, [isModalOpen])

  // Redirect unauthorized
  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      window.location.replace("/unauthorized")
    }
  }, [isLoading, isAuthorized])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  const handleModalSubmit = async (formData: {
    title: string
    description: string
    category: string
    link: string
  }) => {
    setIsModalOpen(false)
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
      showSuccessNotification("Template created successfully")
    } catch (error) {
      console.error("Error creating template:", error)
      showErrorNotification("Failed to create template", error instanceof Error ? error.message : "An error occurred")
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    setIsDeleteModalOpen(false)
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete template")
      }

      setTemplates((prev) => prev.filter((t) => t.id !== templateId))
      showSuccessNotification("Template deleted successfully")
    } catch (error) {
      console.error("Error deleting template:", error)
      showErrorNotification("Failed to delete template", error instanceof Error ? error.message : "An error occurred")
    }
  }

  const handleUpdate = async () => {
    if (!selectedTemplate) return
    setIsEditModalOpen(false)

    try {
      const response = await fetch(`/api/templates/${selectedTemplate.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to update template")
      }

      const updatedTemplate = await response.json()
      setTemplates((prev) =>
        prev.map((template) =>
          template.id === updatedTemplate.id ? updatedTemplate : template
        )
      )
      setSelectedTemplate(null)
      setFormData({ title: "", description: "", category: "", link: "" })
      showSuccessNotification("Template updated successfully")
    } catch (error) {
      console.error("Error updating template:", error)
      showErrorNotification("Failed to update template", error instanceof Error ? error.message : "An error occurred")
    }
  }

  if (loadingTemplates) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your templates...</p>
        </div>
      </div>
    )
  }

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      (template?.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (template?.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (template?.type?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesCategory =
      activeTab === "all" ||
      (activeTab === "assignment" && template?.category === "assignment") ||
      (activeTab === "notes" && template?.category === "notes") ||
      (activeTab === "project" && template?.category === "project")

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

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template)
    setFormData({
      title: template.title,
      description: template.description,
      category: template.category,
      link: template.link,
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteClick = (template: Template) => {
    setSelectedTemplate(template)
    setIsDeleteModalOpen(true)
  }

  return (
    <AnimatedSection>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Form Templates</h1>
        <div className="flex gap-2">
          <Button
            variant={isManageMode ? "default" : "outline"}
            className="transition-all duration-200 hover:scale-105"
            onClick={() => setIsManageMode(!isManageMode)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isManageMode ? "Done Managing" : "Manage Templates"}
          </Button>
          <Button
            className="transition-all duration-200 hover:scale-105"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">{getCategoryIcon(template.category)}</div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                </div>
                <div className="flex gap-1">
                  {isManageMode ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(template)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(template)}
                      className="h-8 w-8"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2">
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-muted">{template.category}</span>
              </div>
              <p className="text-sm text-muted-foreground">{template.description}</p>
            </CardContent>
            <CardFooter className="flex flex-col items-center gap-2">
              <Button variant="default" size="sm" className="gap-1 w-full">
                <a
                  href={template.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-secondary w-full justify-center"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Template
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

      {/* Edit Modal */}
      {isEditModalOpen && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Edit Template</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="title" className="text-sm font-medium">
                    Title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter template title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Description
                  </label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Enter template description"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="category" className="text-sm font-medium">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md bg-background text-foreground"
                  >
                    <option value="">Select Category</option>
                    <option value="assignment">Assignment</option>
                    <option value="notes">Notes</option>
                    <option value="project">Project</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="link" className="text-sm font-medium">
                    Google Docs Link
                  </label>
                  <Input
                    id="link"
                    name="link"
                    placeholder="Enter Google Docs link"
                    value={formData.link}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Update Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Template</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete the template "{selectedTemplate?.title}"? This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedTemplate && handleDeleteTemplate(selectedTemplate.id)}
              >
                Delete Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {isMounted && (
        <TemplateFormModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleModalSubmit}
        />
      )}
    </AnimatedSection>
  )
}
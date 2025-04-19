"use client"

import { useState, FormEvent, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AnimatedSection } from "@/components/animated-section"
import {
  Plus,
  Search,
  Filter,
  Clock,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react"
import { useRBAC } from "@/hooks/use-rbac"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"; // Make sure Link is imported
import { Dialog as AlertDialog, DialogContent as AlertDialogContent, DialogHeader as AlertDialogHeader, DialogTitle as AlertDialogTitle, DialogFooter as AlertDialogFooter } from "@/components/ui/dialog"

interface Project {
  id: string
  title: string
  clientName: string // Update from client to clientName
  startDate: string
  endDate: string
  budget: number
  status: string
  description: string
  assignedTo: string
  kanbanBoardId?: string  // Reference to the Kanban board
}

export default function FreelancerProjectsPage() {
  const { isAuthorized, isLoading } = useRBAC(["freelancer"])
  const { toast } = useToast()
  
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  
  // Fetch projects from the API
  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
  
      if (!response.ok) {
        throw new Error("Failed to fetch projects")
      }
  
      const data = await response.json()
  
      // Periksa apakah data adalah array
      if (Array.isArray(data)) {
        setProjects(data) // Data langsung berupa array proyek
      } else {
        console.error("Invalid data format:", data)
        setProjects([]) // Fallback ke array kosong jika format data salah
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      setProjects([]) // Fallback ke array kosong jika terjadi error
      toast({
        title: "Error loading projects",
        description: "Failed to load projects. Please try again later.",
        variant: "destructive",
      })
    }
  }

  // Load projects when the component mounts
  useEffect(() => {
    fetchProjects()
  }, [])

  // Form state for new project
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    clientName: "", // Changed from client to clientName to match schema
    startDate: "",
    endDate: "",
    budget: "",
    status: "active" as const,
    assignedTo: "",
  })

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewProject({ ...newProject, [name]: value })
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setNewProject({ ...newProject, [name]: value })
  }

  // Create project and Kanban board
  const handleCreateProject = async (e: FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newProject.title,
          description: newProject.description,
          clientName: newProject.clientName, // Changed from client to clientName
          startDate: newProject.startDate,
          endDate: newProject.endDate,
          budget: parseFloat(newProject.budget) || 0,
          status: newProject.status,
          assignedTo: newProject.assignedTo,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to create project")
      }

      const { project } = await response.json()

      // Update state with new project, including kanbanBoardId
      setProjects((prevProjects) => (Array.isArray(prevProjects) ? [...prevProjects, project] : [project]))

      // Reset form and close modal
      setNewProject({
        title: "",
        description: "",
        clientName: "", // Changed from client to clientName
        startDate: "",
        endDate: "",
        budget: "",
        status: "active" as const,
        assignedTo: "",
      })
      setIsModalOpen(false)

      toast({
        title: "Project created successfully",
        description: "A Kanban board has been created to track this project's progress.",
      })
    } catch (error) {
      console.error("Error creating project:", error)
      toast({
        title: "Error creating project",
        description: "Please try again later",
        variant: "destructive",
      })
    }
  }

  // Handle delete project
  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return
    try {
      const response = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete project")
      setProjects(projects.filter((p) => p.id !== projectToDelete.id))
      setDeleteDialogOpen(false)
      setProjectToDelete(null)
      toast({
        title: "Success",
        description: "Project deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      })
    }
  }

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

  const filteredProjects = (projects || []).filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase()), // Update from client to clientName
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
    <AnimatedSection>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="transition-all duration-200 hover:scale-105">
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the project details. A Kanban board will be automatically created.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">Project Name</Label>
                  <Input
                    id="title"
                    name="title"
                    value={newProject.title}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="clientName" className="text-right">Client Name</Label>
                  <Input
                    id="clientName"
                    name="clientName"
                    value={newProject.clientName}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={newProject.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                    rows={3}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={newProject.startDate}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endDate" className="text-right">Deadline</Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={newProject.endDate}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="budget" className="text-right">Budget ($)</Label>
                  <Input
                    id="budget"
                    name="budget"
                    type="number"
                    value={newProject.budget}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                  <Select 
                    value={newProject.status} 
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="assignedTo" className="text-right">Assigned To</Label>
                  <Input
                    id="assignedTo"
                    name="assignedTo"
                    value={newProject.assignedTo}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Project & Kanban Board</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
          <Card key={project.id} className="transition-all duration-300 hover:shadow-md flex flex-col"> {/* Added flex flex-col */}
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <div className="flex gap-2 items-center">
                  <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.status)}`}>{project.status}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteProject(project)}
                    className="text-red-500 hover:bg-red-50"
                    title="Delete Project"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{project.clientName}</p> {/* Update from client to clientName */}
            </CardHeader>
            <CardContent className="flex-grow"> {/* Added flex-grow */}
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
                <div className="flex items-center gap-1 col-span-2 mt-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Assigned to: {project.assignedTo}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {/* Wrap the Details button with Link */}
              <Link href={`/freelancer-dashboard/projects/${project.id}`} passHref>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </Link>
              <Button 
  variant="secondary" 
  size="sm" 
  onClick={() => {
    if (project.kanbanBoardId) {
      window.location.href = `/freelancer-dashboard/kanban/${project.kanbanBoardId}`;
    } else {
      toast({
        title: "No Kanban board",
        description: "This project doesn't have a Kanban board associated with it.",
        variant: "destructive",
      });
    }
  }}
>
  View Kanban
</Button>
              <Button size="sm" disabled>Manage</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Are you sure you want to delete this project? This action cannot be undone.</p>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteProject}>Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatedSection>
  )
}


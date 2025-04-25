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
import Link from "next/link"
import { Dialog as AlertDialog, DialogContent as AlertDialogContent, DialogHeader as AlertDialogHeader, DialogTitle as AlertDialogTitle, DialogFooter as AlertDialogFooter } from "@/components/ui/dialog"

interface Project {
  id: string
  title: string
  clientName: string
  startDate: string
  endDate: string
  budget: number
  status: string
  description: string
  assignedTo: string
  kanbanBoardId?: string
}

export default function FreelancerProjectsPage() {
  const { isAuthorized, isLoading } = useRBAC(["freelancer"])
  const { toast } = useToast()

  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [isManageMode, setIsManageMode] = useState(false) // State untuk mode Manage

  // Fungsi untuk memformat tanggal dengan handling error
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    
    try {
      const date = new Date(dateString);
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Fungsi untuk memformat mata uang dengan handling error
  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "$0.00";
    }
    
    try {
      return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
    } catch (error) {
      return "$0.00";
    }
  };

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
      if (Array.isArray(data)) {
        setProjects(data)
      } else {
        console.error("Invalid data format:", data)
        setProjects([])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
      setProjects([])
      toast({
        title: "Error loading projects",
        description: "Failed to load projects. Please try again later.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

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
    return null
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      (project.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (project.clientName?.toLowerCase() || '').includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus ? project.status === filterStatus : true

    return matchesSearch && matchesStatus
  })

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

  return (
    <AnimatedSection>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <div className="flex gap-4">
          <Button
            variant={isManageMode ? "secondary" : "outline"}
            onClick={() => setIsManageMode(!isManageMode)}
            className="transition-all duration-200 hover:scale-105"
          >
            {isManageMode ? "Exit Manage Mode" : "Manage"}
          </Button>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="transition-all duration-200 hover:scale-105">
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </DialogTrigger>
            <DialogContent className="w-full max-w-screen-lg">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Fill in the project details. A Kanban board will be automatically created.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={async (e: FormEvent) => {
                e.preventDefault()
                const formData = new FormData(e.target as HTMLFormElement)
                
                // Validate dates
                const startDate = formData.get("startDate") as string;
                const endDate = formData.get("endDate") as string;
                
                // Validate budget
                const budgetStr = formData.get("budget") as string;
                let budget: number;
                try {
                  budget = parseFloat(budgetStr);
                  if (isNaN(budget)) throw new Error("Invalid budget");
                } catch (error) {
                  toast({
                    title: "Invalid budget",
                    description: "Please enter a valid number for budget",
                    variant: "destructive",
                  });
                  return;
                }
                
                const projectData = {
                  title: formData.get("title") as string,
                  description: formData.get("description") as string,
                  clientName: formData.get("clientName") as string,
                  status: formData.get("status") as string,
                  budget: budget,
                  startDate: startDate,
                  endDate: endDate,
                  assignedTo: formData.get("assignedTo") as string,
                }

                try {
                  const response = await fetch("/api/projects", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(projectData),
                  })

                  if (!response.ok) {
                    throw new Error("Failed to create project")
                  }

                  const data = await response.json()
                  setProjects([...projects, data])
                  setIsModalOpen(false)
                  toast({
                    title: "Success",
                    description: "Project created successfully",
                  })
                  
                  // Refresh projects to ensure we have the correct data
                  fetchProjects();
                } catch (error) {
                  console.error("Error creating project:", error)
                  toast({
                    title: "Error",
                    description: "Failed to create project. Please try again.",
                    variant: "destructive",
                  })
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="title" className="text-right">Project Name</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Enter project title"
                      className="col-span-3"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="clientName" className="text-right">Client Name</Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      placeholder="Enter client name"
                      className="col-span-3"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right pt-2">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Enter project details..."
                      className="col-span-3"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="startDate" className="text-right">Start Date</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      className="col-span-3"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="endDate" className="text-right">Deadline</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
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
                      placeholder="Enter budget amount"
                      min="0"
                      step="0.01"
                      className="col-span-3"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select name="status" defaultValue="active">
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem key="active" value="active">Active</SelectItem>
                        <SelectItem key="on-hold" value="on-hold">On Hold</SelectItem>
                        <SelectItem key="completed" value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="assignedTo" className="text-right">Assigned To</Label>
                    <Input
                      id="assignedTo"
                      name="assignedTo"
                      placeholder="Enter name or email of assignee"
                      className="col-span-3"
                      required
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Project</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
        <Select
          value={filterStatus || "all"}
          onValueChange={(value) => setFilterStatus(value === "all" ? null : value)}
        >
          <SelectTrigger className="flex gap-2 w-48">
            <Filter className="h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all" value="all">All</SelectItem>
            <SelectItem key="active" value="active">Active</SelectItem>
            <SelectItem key="on-hold" value="on-hold">On Hold</SelectItem>
            <SelectItem key="completed" value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Card key={project.id} className="transition-all duration-300 hover:shadow-md flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className="flex gap-2 items-center">
                    <div className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(project.status)}`}>
                      {project.status || "Unknown"}
                    </div>
                    {isManageMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProject(project)}
                        className="text-red-500 hover:bg-red-50"
                        title="Delete Project"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{project.clientName || "No client"}</p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm mb-4">{project.description || "No description"}</p>
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
                    <span>Assigned to: {project.assignedTo || "Unassigned"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2 justify-end">
                <Link href={`/freelancer-dashboard/projects/${project.id}`} passHref>
                  <Button variant="outline" size="sm" className="flex-1 md:flex-none">
                    Details
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 md:flex-none"
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
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center col-span-full">
            {searchTerm ? (
              <p className="text-muted-foreground">No projects match your search term.</p>
            ) : filterStatus ? (
              <p className="text-muted-foreground">No projects match the selected filter.</p>
            ) : (
              <p className="text-muted-foreground">No projects available.</p>
            )}
          </div>
        )}
      </div>

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


"use client"

import { useState, FormEvent, useEffect, Fragment } from "react"
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
  Users,
  Eye,
  Kanban,
} from "lucide-react"
import { useRBAC } from "@/hooks/use-rbac"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { showSuccessNotification, showErrorNotification } from "@/components/ui/notification"
import Link from "next/link"
import { Dialog as AlertDialog, DialogContent as AlertDialogContent, DialogHeader as AlertDialogHeader, DialogTitle as AlertDialogTitle, DialogFooter as AlertDialogFooter } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

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
  const router = useRouter()

  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
  const [isManageMode, setIsManageMode] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "Rp 0"
    }
    
    try {
      return new Intl.NumberFormat("id-ID", { 
        style: "currency", 
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    } catch (error) {
      return "Rp 0"
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects")
      
      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.status}`)
      }
      
      const data = await response.json()
      setProjects(Array.isArray(data) ? data : [])
      setIsLoaded(true)
    } catch (error) {
      console.error("Error fetching projects:", error)
      setError("Failed to load projects. Please try again.")
      showErrorNotification(
        "Error Loading Projects",
        "Failed to load your projects. Please try again."
      )
      setIsLoaded(true)
    }
  }

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.push("/unauthorized")
      return
    }
  }, [isLoading, isAuthorized, router])

  useEffect(() => {
    fetchProjects()
  }, [])

  if (isLoading || !isLoaded) {
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

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => fetchProjects()}
          >
            Try Again
          </Button>
        </div>
      </div>
    )
  }

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
      showSuccessNotification(
        "Project Deleted Successfully",
        "Project deleted successfully"
      )
    } catch (error) {
      showErrorNotification(
        "Error Deleting Project",
        "Failed to delete project"
      )
    }
  }

  const handleStatusChange = async (project: Project, newStatus: string) => {
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...project,
          status: newStatus,
        }),
      })

      if (!response.ok) throw new Error("Failed to update project status")

      setProjects(prevProjects => 
        prevProjects.map(p => 
          p.id === project.id 
            ? { ...p, status: newStatus }
            : p
        )
      )

      showSuccessNotification(
        "Project Status Updated Successfully",
        "Project status updated successfully"
      )
    } catch (error) {
      console.error("Error updating project status:", error)
      showErrorNotification(
        "Error Updating Project Status",
        "Failed to update project status"
      )
    }
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
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      case "on-hold":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setIsDetailsModalOpen(true)
  }

  return (
    <AnimatedSection>
      <div className="flex justify-between items-center mb-8">
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
                
                const startDate = formData.get("startDate") as string;
                const endDate = formData.get("endDate") as string;
                
                const budgetStr = formData.get("budget") as string;
                let budget: number;
                try {
                  budget = parseFloat(budgetStr);
                  if (isNaN(budget)) throw new Error("Invalid budget");
                } catch (error) {
                  showErrorNotification(
                    "Invalid Budget",
                    "Please enter a valid number for budget"
                  )
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
                  showSuccessNotification(
                    "Project Created Successfully",
                    `Your project "${projectData.title}" and its kanban board have been created successfully. You can now manage your tasks and track progress.`
                  )
                  
                  fetchProjects();
                } catch (error) {
                  console.error("Error creating project:", error)
                  showErrorNotification(
                    "Error Creating Project",
                    "Failed to create project. Please try again."
                  )
                }
              }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
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
                      rows={4}
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
                    <Label htmlFor="budget" className="text-right">Budget</Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <span className="text-muted-foreground font-medium">Rp</span>
                      <Input
                        id="budget"
                        name="budget"
                        type="number"
                        placeholder="Enter budget amount"
                        min="0"
                        step="0.01"
                        className="w-full"
                        required
                      />
                    </div>
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
                
                <DialogFooter className="mt-4">
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

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects or clients..."
            className="pl-9 h-11"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={filterStatus || "all"}
          onValueChange={(value) => setFilterStatus(value === "all" ? null : value)}
        >
          <SelectTrigger className="flex gap-2 w-48 h-11">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filteredProjects.length > 0 ? (
          <>
            {/* Active Projects Section */}
            {filteredProjects.filter(project => project.status !== "completed").length > 0 && (
              <Fragment key="active-projects-section">
                <h2 className="text-xl font-semibold col-span-full">Active Projects</h2>
                {filteredProjects
                  .filter(project => project.status !== "completed")
                  .map((project) => (
                    <Card key={project.id} className="transition-all duration-300 hover:shadow-lg flex flex-col h-full w-full max-w-full">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-xl truncate">{project.title}</CardTitle>
                          <div className="flex gap-2 items-center shrink-0">
                            <Select 
                              value={project.status} 
                              onValueChange={(value) => handleStatusChange(project, value)}
                            >
                              <SelectTrigger className={`h-7 px-3 py-1 rounded-full text-xs text-white ${getStatusColor(project.status)} whitespace-nowrap border-0 hover:opacity-80 transition-opacity`}>
                                <SelectValue>{project.status || "Unknown"}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem key="active" value="active">Active</SelectItem>
                                <SelectItem key="on-hold" value="on-hold">On Hold</SelectItem>
                                <SelectItem key="completed" value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            {isManageMode && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProject(project)}
                                className="text-red-500 hover:bg-red-50 shrink-0"
                                title="Delete Project"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">{project.clientName || "No client"}</p>
                      </CardHeader>
                      <CardContent className="flex-grow pb-6">
                        <p className="text-sm mb-6 line-clamp-3 break-words">{project.description || "No description"}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">{formatDate(project.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">{formatDate(project.endDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 col-span-2">
                            <span className="text-muted-foreground font-medium shrink-0">Rp</span>
                            <span className="truncate">{formatCurrency(project.budget).replace('Rp', '')}</span>
                          </div>
                          <div className="flex items-center gap-2 col-span-2 mt-2">
                            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">Assigned to: {project.assignedTo || "Unassigned"}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t">
                        <div className="flex gap-3 w-full">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleViewDetails(project)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              if (project.kanbanBoardId) {
                                window.location.href = `/freelancer-dashboard/kanban/${project.kanbanBoardId}`;
                              } else {
                                showErrorNotification(
                                  "No Kanban Board",
                                  "This project doesn't have a Kanban board associated with it."
                                )
                              }
                            }}
                          >
                            <Kanban className="h-3.5 w-3.5 mr-1" />
                            View Kanban
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </Fragment>
            )}

            {/* Completed Projects Section */}
            {filteredProjects.filter(project => project.status === "completed").length > 0 && (
              <Fragment key="completed-projects-section">
                <div className="col-span-full my-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-background px-4 text-xl font-semibold">Completed Projects</span>
                    </div>
                  </div>
                </div>
                {filteredProjects
                  .filter(project => project.status === "completed")
                  .map((project) => (
                    <Card key={project.id} className="transition-all duration-300 hover:shadow-lg flex flex-col h-full w-full max-w-full">
                      <CardHeader className="pb-4">
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-xl truncate">{project.title}</CardTitle>
                          <div className="flex gap-2 items-center shrink-0">
                            <Select 
                              value={project.status} 
                              onValueChange={(value) => handleStatusChange(project, value)}
                            >
                              <SelectTrigger className={`h-7 px-3 py-1 rounded-full text-xs text-white ${getStatusColor(project.status)} whitespace-nowrap border-0 hover:opacity-80 transition-opacity`}>
                                <SelectValue>{project.status || "Unknown"}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem key="active" value="active">Active</SelectItem>
                                <SelectItem key="on-hold" value="on-hold">On Hold</SelectItem>
                                <SelectItem key="completed" value="completed">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                            {isManageMode && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteProject(project)}
                                className="text-red-500 hover:bg-red-50 shrink-0"
                                title="Delete Project"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 truncate">{project.clientName || "No client"}</p>
                      </CardHeader>
                      <CardContent className="flex-grow pb-6">
                        <p className="text-sm mb-6 line-clamp-3 break-words">{project.description || "No description"}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">{formatDate(project.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">{formatDate(project.endDate)}</span>
                          </div>
                          <div className="flex items-center gap-2 col-span-2">
                            <span className="text-muted-foreground font-medium shrink-0">Rp</span>
                            <span className="truncate">{formatCurrency(project.budget).replace('Rp', '')}</span>
                          </div>
                          <div className="flex items-center gap-2 col-span-2 mt-2">
                            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="truncate">Assigned to: {project.assignedTo || "Unassigned"}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-4 border-t">
                        <div className="flex gap-3 w-full">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                            onClick={() => handleViewDetails(project)}
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              if (project.kanbanBoardId) {
                                window.location.href = `/freelancer-dashboard/kanban/${project.kanbanBoardId}`;
                              } else {
                                showErrorNotification(
                                  "No Kanban Board",
                                  "This project doesn't have a Kanban board associated with it."
                                )
                              }
                            }}
                          >
                            <Kanban className="h-3.5 w-3.5 mr-1" />
                            View Kanban
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
              </Fragment>
            )}
          </>
        ) : (
          <div className="text-center col-span-full py-12">
            {searchTerm ? (
              <p className="text-muted-foreground text-lg">No projects match your search term.</p>
            ) : filterStatus ? (
              <p className="text-muted-foreground text-lg">No projects match the selected filter.</p>
            ) : (
              <p className="text-muted-foreground text-lg">No projects available.</p>
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

      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="w-full max-w-screen-lg">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
                  <div className={`px-3 py-1 rounded-full text-sm text-white ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status}
                  </div>
                </div>
                <p className="text-md text-muted-foreground">Client: {selectedProject.clientName}</p>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-md">{selectedProject.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Timeline</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p>{formatDate(selectedProject.startDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Deadline</p>
                          <p>{formatDate(selectedProject.endDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-medium">Rp</span>
                        <div>
                          <p className="text-sm text-muted-foreground">Budget</p>
                          <p>{formatCurrency(selectedProject.budget)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Assigned To</p>
                          <p>{selectedProject.assignedTo}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex flex-wrap gap-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (selectedProject.kanbanBoardId) {
                      window.location.href = `/freelancer-dashboard/kanban/${selectedProject.kanbanBoardId}`;
                    } else {
                      showErrorNotification(
                        "No Kanban Board",
                        "This project doesn't have a Kanban board associated with it."
                      )
                    }
                  }}
                >
                  View Kanban Board
                </Button>
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AnimatedSection>
  )
}


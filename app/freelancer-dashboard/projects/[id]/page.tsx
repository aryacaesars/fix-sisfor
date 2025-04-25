"use client"

import { useState, useEffect, FormEvent } from "react"
import { useParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AnimatedSection } from "@/components/animated-section"
import { Calendar, Clock, DollarSign, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRBAC } from "@/hooks/use-rbac"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"

interface Project {
  id: string
  title: string
  clientName: string // Updated to match schema
  startDate: string
  endDate: string
  budget: number
  status: string
  description: string
  assignedTo: string
  kanbanBoardId?: string
}

export default function ProjectDetailPage() {
  const params = useParams() // Gunakan useParams untuk mendapatkan parameter dinamis
  const projectId = params.id as string // Ambil id dari params
  const { toast } = useToast()
  const { isAuthorized, isLoading } = useRBAC(["freelancer"])
  
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading2, setIsLoading2] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch project details")
        }

        const data = await response.json()
        setProject(data)
      } catch (error) {
        console.error("Error fetching project:", error)
        setError("Failed to load project details. Please try again later.")
        toast({
          title: "Error loading project",
          description: "Failed to load project details. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setIsLoading2(false)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!project) return
    const { name, value } = e.target
    setProject({ ...project, [name]: value })
  }

  const handleUpdateProject = async (e: FormEvent) => {
    e.preventDefault()
    if (!project) return

    setIsSaving(true)

    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
      })

      if (!response.ok) throw new Error("Failed to update project")

      const updatedProject = await response.json()
      setProject(updatedProject)

      toast({
        title: "Success",
        description: "Project updated successfully.",
      })

      setIsEditModalOpen(false) // Tutup modal setelah berhasil menyimpan
    } catch (error) {
      console.error("Error updating project:", error)
      toast({
        title: "Error",
        description: "Failed to update project.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!project) return;
    setIsSaving(true);
    try {
      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete project");
      toast({
        title: "Project deleted",
        description: "The project has been deleted.",
      });
      window.location.href = "/freelancer-dashboard/projects";
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete project.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || isLoading2) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // The useRBAC hook will handle redirection
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <Link href="/freelancer-dashboard/projects" passHref>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p>Project not found</p>
          <Link href="/freelancer-dashboard/projects" passHref>
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)
  }

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
      <div className="mb-6">
        <Link href="/freelancer-dashboard/projects" passHref>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl">{project.title}</CardTitle>
              <div className={`px-3 py-1 rounded-full text-sm text-white ${getStatusColor(project.status)}`}>
                {project.status}
              </div>
            </div>
            <p className="text-md text-muted-foreground">Client: {project.clientName}</p> {/* Updated from client to clientName */}
          </CardHeader>
          
          <CardContent className="pt-4">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <p className="text-md">{project.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Timeline</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Start Date</p>
                      <p>{formatDate(project.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p>{formatDate(project.endDate)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Budget</p>
                      <p>{formatCurrency(project.budget)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned To</p>
                      <p>{project.assignedTo}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-wrap gap-4">
            <Button
              variant="secondary"
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
              View Kanban Board
            </Button>
            <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>Edit Project</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={isSaving}>
                  {isSaving ? "Deleting..." : "Delete Project"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                </AlertDialogHeader>
                <p>Are you sure you want to delete this project? This action cannot be undone.</p>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProject} disabled={isSaving}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
  <DialogContent className="w-full max-w-screen-lg"> {/* Sesuaikan ukuran modal */}
    <DialogHeader>
      <DialogTitle>Edit Project</DialogTitle>
      <DialogDescription>
        Update the project details below. Changes will be saved immediately.
      </DialogDescription>
    </DialogHeader>
    <form onSubmit={handleUpdateProject}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4"> {/* Grid layout untuk form */}
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Project Name</Label>
          <Input
            id="title"
            name="title"
            value={project.title}
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
            value={project.clientName}
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
            value={project.description}
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
            value={project.startDate}
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
            value={project.endDate}
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
            value={project.budget}
            onChange={handleInputChange}
            className="col-span-3"
            required
          />
        </div>
        
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="status" className="text-right">Status</Label>
          <Select 
            value={project.status} 
            onValueChange={(value) => setProject({ ...project, status: value })}
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
            value={project.assignedTo}
            onChange={handleInputChange}
            className="col-span-3"
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  </DialogContent>
</Dialog>
    </AnimatedSection>
  )
}
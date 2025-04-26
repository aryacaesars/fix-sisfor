"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation" // Add useSearchParams
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedSection } from "@/components/animated-section"
import { useToast } from "@/components/ui/use-toast"
import { useRBAC } from "@/hooks/use-rbac"
import { format } from "date-fns"
import { Calendar, Clock, Plus, Edit, Eye, Trash, Kanban, Search, Filter } from "lucide-react"
import { Dialog as AlertDialog, DialogContent as AlertDialogContent, DialogHeader as AlertDialogHeader, DialogTitle as AlertDialogTitle, DialogFooter as AlertDialogFooter } from "@/components/ui/dialog"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Course {
  id: string
  name: string
  code: string
  lecturer: string
  room?: string
  schedule: Array<{
    day: string
    startTime: string
    endTime: string
  }>
}

interface Assignment {
  id: string
  title: string
  description?: string
  course?: string
  status: string
  dueDate?: string
  userId: string
  createdAt: string
  updatedAt: string
  kanbanBoardId?: string
}

export default function AssignmentsPage() {
  const { isAuthorized, isLoading: authLoading } = useRBAC(["Student"])
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams() // Add this to access query parameters
  
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [courses, setCourses] = useState<Course[]>([]) // Add courses state
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Selected assignment for viewing/editing
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Assignment>>({
    title: "",
    description: "",
    course: "",
    status: "",
    dueDate: ""
  })
  
  // New assignment form state
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({
    title: "",
    description: "",
    course: "",
    status: "not-started",
    dueDate: ""
  })
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null)
  const [isManageMode, setIsManageMode] = useState(false)
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all")

  // Check for the openModal query parameter and open the modal if it exists
  useEffect(() => {
    const openModal = searchParams.get('openModal')
    if (openModal === 'true') {
      setIsModalOpen(true)
      
      // Optionally clear the parameter from the URL to prevent reopening on refresh
      const url = new URL(window.location.href)
      url.searchParams.delete('openModal')
      
      // Use replace to avoid adding a new history entry
      window.history.replaceState({}, '', url)
    }
  }, [searchParams])
  
  // Load assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/assignments")
        if (!response.ok) throw new Error("Failed to fetch assignments")
        const data = await response.json() as Assignment[]
        setAssignments(data)
      } catch (error) {
        console.error("Error fetching assignments:", error)
        toast({
          title: "Error",
          description: "Failed to load assignments",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (isAuthorized) {
      fetchAssignments()
    }
  }, [isAuthorized, toast])
  
  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/courses")
        if (!response.ok) throw new Error("Failed to fetch courses")
        const data = await response.json() as Course[]
        setCourses(data)
      } catch (error) {
        console.error("Error fetching courses:", error)
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive"
        })
      }
    }
    
    if (isAuthorized) {
      fetchCourses()
    }
  }, [isAuthorized, toast])
  
  // Filter assignments based on search and filters
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearchTerm = (
      assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const matchesSelectedCourse = selectedCourseFilter === "all" || assignment.course === selectedCourseFilter
    const matchesSelectedStatus = selectedStatusFilter === "all" || assignment.status === selectedStatusFilter
    const isNotCompleted = assignment.status !== "completed"

    return matchesSearchTerm && matchesSelectedCourse && matchesSelectedStatus && isNotCompleted
  })
  
  // Open assignment details
  const viewAssignmentDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setIsEditMode(false)
    setIsDetailsOpen(true)
  }
  
  // Open edit mode
  const editAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    setEditForm({
      title: assignment.title,
      description: assignment.description,
      course: assignment.course,
      status: assignment.status,
      dueDate: assignment.dueDate
    })
    setIsEditMode(true)
    setIsDetailsOpen(true)
  }

  // Handle saving edited assignment
  const handleSaveEdit = async () => {
    if (!selectedAssignment) return

    try {
      // Validation
      if (!editForm.title || !editForm.course || !editForm.dueDate) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }
      
      const response = await fetch(`/api/assignments/${selectedAssignment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })
      
      if (!response.ok) throw new Error('Failed to update assignment')
      
      // Update local state
      setAssignments(assignments.map(item => 
        item.id === selectedAssignment.id ? {...item, ...editForm} : item
      ))
      
      setIsDetailsOpen(false)
      toast({
        title: "Success",
        description: "Assignment updated successfully",
      })
    } catch (error) {
      console.error("Error updating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to update assignment",
        variant: "destructive"
      })
    }
  }

  // Handle adding new assignment
  const handleAddAssignment = async () => {
    try {
      // Validation
      if (!newAssignment.title || !newAssignment.course || !newAssignment.dueDate) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }
      
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAssignment),
      })
      
      if (!response.ok) throw new Error('Failed to create assignment')
      
      const data = await response.json()
      setAssignments([...assignments, data])
      setIsModalOpen(false)
      setNewAssignment({
        title: "",
        description: "",
        course: "",
        status: "not-started",
        dueDate: ""
      })
      
      toast({
        title: "Success",
        description: "Assignment created successfully",
      })
    } catch (error) {
      console.error("Error creating assignment:", error)
      toast({
        title: "Error",
        description: "Failed to create assignment",
        variant: "destructive"
      })
    }
  }

  // Handle delete assignment
  const handleDeleteAssignment = (assignment: Assignment) => {
    setAssignmentToDelete(assignment)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteAssignment = async () => {
    if (!assignmentToDelete) return
    try {
      const response = await fetch(`/api/assignments/${assignmentToDelete.id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete assignment")
      setAssignments(assignments.filter((a) => a.id !== assignmentToDelete.id))
      setDeleteDialogOpen(false)
      setAssignmentToDelete(null)
      setIsDetailsOpen(false)
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      })
    }
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500"
      case "in-progress":
        return "bg-yellow-500"
      case "not-started":
        return "bg-red-500"
      case "overdue":
        return "bg-red-500"
      default:
        return "bg-blue-500"
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No due date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Add useEffect to check deadlines
  useEffect(() => {
    const checkDeadlines = async () => {
      const now = new Date();
      const updatedAssignments = assignments.map(assignment => {
        if (assignment.status === "completed") return assignment;
        
        const dueDate = new Date(assignment.dueDate || "");
        if (dueDate < now && assignment.status !== "overdue") {
          return { ...assignment, status: "overdue" };
        }
        return assignment;
      });

      // Only update if there are changes
      if (JSON.stringify(updatedAssignments) !== JSON.stringify(assignments)) {
        setAssignments(updatedAssignments);
      }

      // Check for overdue assignments to delete
      const overdueAssignments = assignments.filter(assignment => assignment.status === "overdue");
      if (overdueAssignments.length > 0) {
        try {
          // Delete each overdue assignment
          for (const assignment of overdueAssignments) {
            const response = await fetch(`/api/assignments/${assignment.id}`, {
              method: "DELETE",
            });
            if (!response.ok) throw new Error("Failed to delete overdue assignment");
          }
          
          // Update local state by removing overdue assignments
          setAssignments(assignments.filter(assignment => assignment.status !== "overdue"));
          
          toast({
            title: "Overdue Assignments Deleted",
            description: `${overdueAssignments.length} overdue assignment(s) have been automatically deleted.`,
          });
        } catch (error) {
          console.error("Error deleting overdue assignments:", error);
          toast({
            title: "Error",
            description: "Failed to delete overdue assignments",
            variant: "destructive"
          });
        }
      }
    };

    // Check deadlines every minute
    const interval = setInterval(checkDeadlines, 60000);
    checkDeadlines(); // Initial check

    return () => clearInterval(interval);
  }, [assignments, toast]);

  return (
    <AnimatedSection>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <div className="flex gap-2">
          <Link href="/student-dashboard/assignments/completed">
            <Button variant="outline" className="transition-all duration-200 hover:scale-105">
              <Eye className="h-4 w-4 mr-2" />
              View Completed
            </Button>
          </Link>
          <Button
            variant={isManageMode ? "default" : "outline"}
            className="transition-all duration-200 hover:scale-105"
            onClick={() => setIsManageMode(!isManageMode)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Manage
          </Button>
          <Button
            className="transition-all duration-200 hover:scale-105"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Assignment
          </Button>
        </div>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Filter by Course</DropdownMenuLabel>
            <Select
              value={selectedCourseFilter}
              onValueChange={setSelectedCourseFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.name}>
                    {course.name} ({course.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <Select
              value={selectedStatusFilter}
              onValueChange={setSelectedStatusFilter}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not-started">Not Started</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No assignments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className="transition-all duration-200 hover:shadow-md flex flex-col">
              <CardHeader className="pb-1">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg truncate">{assignment.title}</CardTitle>
                  {isManageMode && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAssignment(assignment)}
                      className="text-red-500 hover:bg-red-50 shrink-0"
                      title="Delete Assignment"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <CardDescription className="font-medium">
                  {assignment.course}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2 flex-grow">
                <p className="text-sm line-clamp-2 mb-3">{assignment.description || "No description provided"}</p>
                <div className="flex flex-wrap gap-3 mt-auto">
                  <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(assignment.status)} bg-opacity-10`}>
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(assignment.status)}`}></div>
                    <span className="text-xs capitalize">{assignment.status?.replace("-", " ") || "Not started"}</span>
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">{formatDate(assignment.dueDate)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2 border-t">
                <div className="flex gap-2 w-full">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-1"
                    onClick={() => viewAssignmentDetails(assignment)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    View Details
                  </Button>
                  <Link href={assignment.kanbanBoardId ? `/student-dashboard/kanban/${assignment.kanbanBoardId}` : `/student-dashboard/assignments/${assignment.id}/create-board`} className="flex-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      <Kanban className="h-3.5 w-3.5 mr-1" />
                      {assignment.kanbanBoardId ? 'View Kanban' : 'Create Kanban'}
                    </Button>
                  </Link>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for New Assignment */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Assignment</DialogTitle>
            <DialogDescription>
              Create a new assignment by filling in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input
                id="title"
                placeholder="Enter assignment title"
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course">Course <span className="text-red-500">*</span></Label>
              <Select
                value={newAssignment.course}
                onValueChange={(value) => setNewAssignment({ ...newAssignment, course: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.name}>
                      {course.name} ({course.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter assignment description"
                rows={3}
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={newAssignment.status}
                onValueChange={(value) => setNewAssignment({...newAssignment, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date <span className="text-red-500">*</span></Label>
              <Input
                id="dueDate"
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAssignment}>Create Assignment</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Assignment Details/Edit */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditMode ? "Edit Assignment" : "Assignment Details"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedAssignment && !isEditMode && (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-semibold text-lg">{selectedAssignment.title}</h3>
                <p className="text-sm text-muted-foreground font-medium">{selectedAssignment.course}</p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(selectedAssignment.status)} bg-opacity-10`}>
                  <div className={`h-2 w-2 rounded-full ${getStatusColor(selectedAssignment.status)}`}></div>
                  <span className="text-xs capitalize">{selectedAssignment.status?.replace("-", " ") || "Not started"}</span>
                </Badge>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{formatDate(selectedAssignment.dueDate)}</span>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <div className="mt-2 p-3 bg-secondary/50 rounded-md min-h-[100px]">
                  <p className="text-sm whitespace-pre-wrap">
                    {selectedAssignment.description || "No description provided"}
                  </p>
                </div>
              </div>
              
              <DialogFooter className="gap-2">
                <Link href={selectedAssignment.kanbanBoardId ? `/student-dashboard/kanban/${selectedAssignment.kanbanBoardId}` : `/student-dashboard/assignments/${selectedAssignment.id}/create-board`} className="flex-1 min-w-0">
                  <Button variant="outline" className="w-full">
                    <Kanban className="h-4 w-4 mr-2" />
                    {selectedAssignment.kanbanBoardId ? 'View Kanban' : 'Create Kanban'}
                  </Button>
                </Link>
                <Button onClick={() => editAssignment(selectedAssignment)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Assignment
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteAssignment(selectedAssignment)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogFooter>
            </div>
          )}
          
          {isEditMode && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-course">Course <span className="text-red-500">*</span></Label>
                <Select
                  value={editForm.course}
                  onValueChange={(value) => setEditForm({...editForm, course: value})}
                >
                  <SelectTrigger id="edit-course">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.name}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editForm.status}
                  onValueChange={(value) => setEditForm({...editForm, status: value})}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not-started">Not Started</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-dueDate">Due Date <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({...editForm, dueDate: e.target.value})}
                />
              </div>
              
              <DialogFooter className="gap-2 pt-2">
                <Button variant="outline" onClick={() => {
                  setIsEditMode(false);
                  viewAssignmentDetails(selectedAssignment);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
          </AlertDialogHeader>
          <p>Are you sure you want to delete this assignment? This action cannot be undone.</p>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteAssignment}>Delete</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AnimatedSection>
  )
}


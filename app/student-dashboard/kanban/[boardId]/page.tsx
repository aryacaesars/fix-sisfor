"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { AnimatedSection } from "@/components/animated-section"
import { Plus, Calendar, ArrowLeft } from "lucide-react"
import { useRBAC } from "@/hooks/use-rbac"

interface KanbanBoard {
  id: string
  title: string
  description: string
}

interface KanbanColumn {
  id: string
  title: string
  order: number
  tasks: KanbanTask[]
}

interface KanbanTask {
  id: string
  title: string
  description: string
  priority: string
  dueDate: string | null
  columnId: string
}

export default function KanbanBoardPage() {
  const { boardId } = useParams()
  const router = useRouter()
  const { isAuthorized, isLoading, user } = useRBAC(["Student"])
  const { toast } = useToast()
  
  const [board, setBoard] = useState<KanbanBoard | null>(null)
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false)
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState(false)
  const [activeColumn, setActiveColumn] = useState<string | null>(null)
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: ""
  })
  const [newColumnTitle, setNewColumnTitle] = useState("")
  
  // Improved authorization handling
  useEffect(() => {
    // Only redirect if we've finished checking and user is not authorized
    if (!isLoading && !isAuthorized) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only students can access Kanban boards"
      })
      router.push("/auth/login")
    }
  }, [isLoading, isAuthorized, router, toast])
  
  // Fetch board and columns data
  useEffect(() => {
    if (boardId) {
      fetchBoardData()
    }
  }, [boardId])
  
  const fetchBoardData = async () => {
    try {
      // Fetch board details
      const boardResponse = await fetch(`/api/kanban/boards/${boardId}`)
      if (!boardResponse.ok) {
        console.error("Failed to fetch board:", await boardResponse.text())
        throw new Error("Failed to fetch board data")
      }
      const boardData = await boardResponse.json()
      setBoard(boardData)
      
      // Fetch columns with tasks
      const columnsResponse = await fetch(`/api/kanban/boards/${boardId}/columns`)
      if (!columnsResponse.ok) {
        console.error("Failed to fetch columns:", await columnsResponse.text())
        throw new Error("Failed to fetch columns")
      }
      const columnsData = await columnsResponse.json()
      setColumns(columnsData)
    } catch (error) {
      console.error("Error fetching Kanban data:", error)
      toast({
        title: "Error loading Kanban board",
        description: "Failed to load board data. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeColumn) return
    
    try {
      const response = await fetch("/api/kanban/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...taskFormData,
          columnId: activeColumn,
        }),
      })
      
      if (!response.ok) {
        console.error("Failed to create task:", await response.text())
        throw new Error("Failed to create task")
      }
      
      const newTask = await response.json()
      
      // Update state with new task
      setColumns(columns.map(column => {
        if (column.id === activeColumn) {
          return {
            ...column,
            tasks: [...column.tasks, newTask]
          }
        }
        return column
      }))
      
      // Reset form and close dialog
      setTaskFormData({
        title: "",
        description: "",
        priority: "medium",
        dueDate: ""
      })
      setIsAddTaskDialogOpen(false)
      
      toast({
        title: "Task created",
        description: "New task has been added to the board"
      })
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error creating task",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  const handleAddColumn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newColumnTitle.trim()) return
    
    try {
      console.log(`Sending request to /api/kanban/boards/${boardId}/columns`)
      const response = await fetch(`/api/kanban/boards/${boardId}/columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newColumnTitle,
          order: columns.length + 1
        }),
      })
      
      if (!response.ok) {
        console.error("Failed to create column:", await response.text())
        throw new Error("Failed to create column")
      }
      
      const newColumn = await response.json()
      newColumn.tasks = []
      
      // Update state with new column
      setColumns([...columns, newColumn])
      
      // Reset form and close dialog
      setNewColumnTitle("")
      setIsAddColumnDialogOpen(false)
      
      toast({
        title: "Column created",
        description: "New column has been added to the board"
      })
    } catch (error) {
      console.error("Error creating column:", error)
      toast({
        title: "Error creating column",
        description: "Failed to create column. Please try again.",
        variant: "destructive"
      })
    }
  }
  
  // Handle drag and drop
  const [draggedTask, setDraggedTask] = useState<KanbanTask | null>(null)
  
  const handleDragStart = (task: KanbanTask) => {
    setDraggedTask(task)
  }
  
  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
  }
  
  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()
    
    if (!draggedTask) return
    
    // Only proceed if moving to a different column
    if (draggedTask.columnId === targetColumnId) return
    
    try {
      // Optimistically update UI
      const updatedColumns = columns.map(column => {
        // Remove from source column
        if (column.id === draggedTask.columnId) {
          return {
            ...column,
            tasks: column.tasks.filter(task => task.id !== draggedTask.id)
          }
        }
        // Add to target column
        if (column.id === targetColumnId) {
          const updatedTask = { ...draggedTask, columnId: targetColumnId }
          return {
            ...column,
            tasks: [...column.tasks, updatedTask]
          }
        }
        return column
      })
      
      setColumns(updatedColumns)
      
      // Send update to server
      const response = await fetch(`/api/kanban/tasks/${draggedTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          columnId: targetColumnId
        }),
      })
      
      if (!response.ok) {
        // Revert changes if server update fails
        fetchBoardData()
        throw new Error("Failed to update task column")
      }
    } catch (error) {
      console.error("Error moving task:", error)
      toast({
        title: "Error moving task",
        description: "Failed to update task position. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDraggedTask(null)
    }
  }
  
  // Show loading state while checking authorization
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Prevent rendering anything if not authorized
  if (!isAuthorized) {
    return null
  }
  
  return (
    <AnimatedSection>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/student-dashboard/assignments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Assignments
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">{board?.title || "Kanban Board"}</h1>
        <p className="text-muted-foreground">{board?.description}</p>
      </div>
      
      <div className="flex gap-6 overflow-x-auto pb-8">
        {columns.map(column => (
          <div 
            key={column.id} 
            className="flex-shrink-0 w-80"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <Card>
              <CardHeader className="py-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium">{column.title}</CardTitle>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {column.tasks.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-2">
                {column.tasks.map(task => (
                  <div 
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task)}
                    className="mb-2 cursor-move"
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-sm">{task.title}</h3>
                          <div className={`h-2 w-2 rounded-full ${
                            task.priority === "high" ? "bg-red-500" : 
                            task.priority === "medium" ? "bg-amber-500" : "bg-green-500"
                          }`}></div>
                        </div>
                        
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        {task.dueDate && (
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                ))}
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-muted-foreground hover:text-foreground mt-2"
                  onClick={() => {
                    setActiveColumn(column.id)
                    setIsAddTaskDialogOpen(true)
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Task
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
        
        <div className="flex-shrink-0 w-80">
          <Button 
            variant="outline" 
            className="h-12 w-full border-dashed"
            onClick={() => setIsAddColumnDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Column
          </Button>
        </div>
      </div>
      
      {/* Add Task Dialog */}
      <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddTask}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Task Title</Label>
                <Input 
                  id="title" 
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({...taskFormData, title: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({...taskFormData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select 
                  value={taskFormData.priority}
                  onValueChange={(value) => setTaskFormData({...taskFormData, priority: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date (optional)</Label>
                <Input 
                  id="dueDate" 
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={(e) => setTaskFormData({...taskFormData, dueDate: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Task</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add Column Dialog */}
      <Dialog open={isAddColumnDialogOpen} onOpenChange={setIsAddColumnDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Column</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddColumn}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="columnTitle">Column Title</Label>
                <Input 
                  id="columnTitle" 
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">Add Column</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AnimatedSection>
  )
}
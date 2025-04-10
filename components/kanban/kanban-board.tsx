"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd"
import { Plus, MoreHorizontal, Trash2, Edit, Clock, Tag } from "lucide-react"
import { useKanban } from "@/context/kanban-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function KanbanBoard() {
  const { columns, currentBoard, moveTask, addColumn, addTask, updateTask, deleteTask, updateColumn, deleteColumn } = useKanban()
  const { toast } = useToast()
  
  const [addingColumn, setAddingColumn] = useState(false)
  const [newColumnName, setNewColumnName] = useState("")
  
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    columnId: "",
  })
  
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null)

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result

    // Dropped outside a droppable area
    if (!destination) return

    // Dropped in the same position
    if (source.droppableId === destination.droppableId && source.index === destination.index) return

    // If the task was moved to a different column
    if (source.droppableId !== destination.droppableId) {
      const success = await moveTask(draggableId, destination.droppableId)
      
      if (!success) {
        toast({
          title: "Failed to move task",
          description: "There was an error moving the task. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleAddColumn = async () => {
    if (!newColumnName.trim() || !currentBoard) return
    
    const column = await addColumn({
      title: newColumnName,
      boardId: currentBoard.id,
    })
    
    if (column) {
      setNewColumnName("")
      setAddingColumn(false)
    }
  }
  
  const handleAddTask = async () => {
    if (!taskForm.title.trim() || !activeColumnId) return
    
    const task = await addTask({
      title: taskForm.title,
      description: taskForm.description,
      columnId: activeColumnId,
      priority: taskForm.priority,
      dueDate: taskForm.dueDate || undefined,
    })
    
    if (task) {
      setTaskForm({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        columnId: "",
      })
      setIsAddTaskOpen(false)
    }
  }
  
  const handleEditTask = async (taskId: string) => {
    if (!taskForm.title.trim()) return
    
    const success = await updateTask(taskId, {
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      dueDate: taskForm.dueDate || undefined,
    })
    
    if (success) {
      setEditingTask(null)
      setTaskForm({
        title: "",
        description: "",
        priority: "medium",
        dueDate: "",
        columnId: "",
      })
    }
  }
  
  const prepareTaskEdit = (columnId: string, taskId: string) => {
    const column = columns.find(col => col.id === columnId)
    if (!column) return
    
    const task = column.tasks.find(t => t.id === taskId)
    if (!task) return
    
    setTaskForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: task.dueDate || "",
      columnId: task.columnId,
    })
    
    setEditingTask(taskId)
  }
  
  const handleDeleteTask = async (taskId: string) => {
    const success = await deleteTask(taskId)
    
    if (success) {
      toast({
        title: "Task deleted",
        description: "The task has been successfully deleted.",
      })
    }
  }
  
  const handleEditColumn = async (columnId: string, newTitle: string) => {
    if (!newTitle.trim()) return
    
    const success = await updateColumn(columnId, { title: newTitle })
    
    if (!success) {
      toast({
        title: "Failed to update column",
        description: "There was an error updating the column. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  const handleDeleteColumn = async (columnId: string) => {
    const success = await deleteColumn(columnId)
    
    if (success) {
      toast({
        title: "Column deleted",
        description: "The column has been successfully deleted.",
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  if (!currentBoard) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <h3 className="text-lg font-medium">No board selected</h3>
          <p className="text-muted-foreground mt-1">Select a board from the dropdown to start</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 h-full">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-muted/50 rounded-lg p-3 w-80 flex-shrink-0 h-full flex flex-col"
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-sm">{column.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full">
                        {column.tasks.length}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="xs" className="h-6 w-6 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Column</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="column-name">Column Name</Label>
                                  <Input
                                    id="column-name"
                                    defaultValue={column.title}
                                    onBlur={(e) => handleEditColumn(column.id, e.target.value)}
                                  />
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <DropdownMenuSeparator />
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => e.preventDefault()}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Column</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete this column? All tasks will also be
                                  deleted. This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleDeleteColumn(column.id)}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1 overflow-auto">
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="select-none"
                          >
                            <Card className="bg-card">
                              <CardHeader className="p-3 pb-0">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-medium text-sm">{task.title}</h4>
                                  <div className="flex items-center">
                                    <div
                                      className={`h-2 w-2 rounded-full ${getPriorityColor(
                                        task.priority
                                      )}`}
                                    />
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="xs" className="h-7 w-7 p-0 ml-1">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <DropdownMenuItem
                                              onSelect={(e) => {
                                                e.preventDefault()
                                                prepareTaskEdit(column.id, task.id)
                                              }}
                                            >
                                              <Edit className="h-4 w-4 mr-2" />
                                              Edit
                                            </DropdownMenuItem>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Edit Task</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                              <div className="grid gap-2">
                                                <Label htmlFor="task-title">Title</Label>
                                                <Input
                                                  id="task-title"
                                                  value={taskForm.title}
                                                  onChange={(e) =>
                                                    setTaskForm({
                                                      ...taskForm,
                                                      title: e.target.value,
                                                    })
                                                  }
                                                />
                                              </div>
                                              <div className="grid gap-2">
                                                <Label htmlFor="task-description">Description</Label>
                                                <Textarea
                                                  id="task-description"
                                                  value={taskForm.description}
                                                  onChange={(e) =>
                                                    setTaskForm({
                                                      ...taskForm,
                                                      description: e.target.value,
                                                    })
                                                  }
                                                  rows={3}
                                                />
                                              </div>
                                              <div className="grid gap-2">
                                                <Label htmlFor="task-priority">Priority</Label>
                                                <Select
                                                  value={taskForm.priority}
                                                  onValueChange={(value) =>
                                                    setTaskForm({
                                                      ...taskForm,
                                                      priority: value,
                                                    })
                                                  }
                                                >
                                                  <SelectTrigger id="task-priority">
                                                    <SelectValue placeholder="Select priority" />
                                                  </SelectTrigger>
                                                  <SelectContent>
                                                    <SelectGroup>
                                                      <SelectLabel>Priority</SelectLabel>
                                                      <SelectItem value="low">Low</SelectItem>
                                                      <SelectItem value="medium">Medium</SelectItem>
                                                      <SelectItem value="high">High</SelectItem>
                                                    </SelectGroup>
                                                  </SelectContent>
                                                </Select>
                                              </div>
                                              <div className="grid gap-2">
                                                <Label htmlFor="task-due-date">Due Date</Label>
                                                <Input
                                                  id="task-due-date"
                                                  type="date"
                                                  value={taskForm.dueDate}
                                                  onChange={(e) =>
                                                    setTaskForm({
                                                      ...taskForm,
                                                      dueDate: e.target.value,
                                                    })
                                                  }
                                                />
                                              </div>
                                            </div>
                                            <DialogFooter>
                                              <Button onClick={() => handleEditTask(task.id)}>
                                                Save Changes
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                        <DropdownMenuSeparator />
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <DropdownMenuItem
                                              onSelect={(e) => e.preventDefault()}
                                              className="text-red-600"
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DialogTrigger>
                                          <DialogContent>
                                            <DialogHeader>
                                              <DialogTitle>Delete Task</DialogTitle>
                                              <DialogDescription>
                                                Are you sure you want to delete this task? This action
                                                cannot be undone.
                                              </DialogDescription>
                                            </DialogHeader>
                                            <DialogFooter>
                                              <Button variant="outline">Cancel</Button>
                                              <Button
                                                variant="destructive"
                                                onClick={() => handleDeleteTask(task.id)}
                                              >
                                                Delete
                                              </Button>
                                            </DialogFooter>
                                          </DialogContent>
                                        </Dialog>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="p-3 pt-1">
                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                    {task.description}
                                  </p>
                                )}
                              </CardContent>
                              {(task.dueDate || task.labels?.length > 0) && (
                                <CardFooter className="p-3 pt-0 flex gap-2">
                                  {task.dueDate && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      <span>{formatDate(task.dueDate)}</span>
                                    </div>
                                  )}
                                  {task.labels && task.labels.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Tag className="h-3 w-3" />
                                      <span>{task.labels.length} labels</span>
                                    </div>
                                  )}
                                </CardFooter>
                              )}
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>

                  <Dialog open={isAddTaskOpen && activeColumnId === column.id} onOpenChange={(open) => {
                    if (!open) setActiveColumnId(null);
                    setIsAddTaskOpen(open);
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-muted-foreground mt-2"
                        onClick={() => {
                          setActiveColumnId(column.id);
                          setIsAddTaskOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="new-task-title">Title</Label>
                          <Input
                            id="new-task-title"
                            value={taskForm.title}
                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            placeholder="Task title"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-task-description">Description</Label>
                          <Textarea
                            id="new-task-description"
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            placeholder="Task description"
                            rows={3}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-task-priority">Priority</Label>
                          <Select
                            value={taskForm.priority}
                            onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}
                          >
                            <SelectTrigger id="new-task-priority">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Priority</SelectLabel>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="new-task-due-date">Due Date (optional)</Label>
                          <Input
                            id="new-task-due-date"
                            type="date"
                            value={taskForm.dueDate}
                            onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleAddTask}>Add Task</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </Droppable>
          ))}

          <div className="w-80 flex-shrink-0">
            {addingColumn ? (
              <Card>
                <CardContent className="p-3">
                  <div className="grid gap-3">
                    <Input
                      placeholder="Column name"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      autoFocus
                    />
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAddingColumn(false)
                          setNewColumnName("")
                        }}
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleAddColumn}>
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="outline"
                className="h-12 w-full border-dashed"
                onClick={() => setAddingColumn(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
            )}
          </div>
        </div>
      </DragDropContext>
    </div>
  )
}
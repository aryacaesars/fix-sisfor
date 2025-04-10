"use client"

import React, { createContext, useState, useContext, useEffect, ReactNode } from "react"
import { useToast } from "@/components/ui/use-toast"

// Define interfaces for our Kanban data structure
interface KanbanTask {
  id: string
  title: string
  description?: string
  priority: string
  dueDate?: string
  columnId: string
  labels?: string[]
  createdById: string
}

interface KanbanColumn {
  id: string
  title: string
  order: number
  boardId: string
  tasks: KanbanTask[]
}

interface KanbanBoard {
  id: string
  title: string
  description?: string
  createdById: string
  createdAt: string
  updatedAt: string
}

interface KanbanContextType {
  boards: KanbanBoard[]
  currentBoard: KanbanBoard | null
  columns: KanbanColumn[]
  setCurrentBoardId: (boardId: string | null) => void
  addBoard: (board: { title: string; description?: string }) => Promise<KanbanBoard | null>
  updateBoard: (boardId: string, data: { title?: string; description?: string }) => Promise<boolean>
  deleteBoard: (boardId: string) => Promise<boolean>
  addColumn: (column: { title: string; boardId: string }) => Promise<KanbanColumn | null>
  updateColumn: (columnId: string, data: { title?: string }) => Promise<boolean>
  deleteColumn: (columnId: string) => Promise<boolean>
  addTask: (task: {
    title: string
    description?: string
    columnId: string
    priority?: string
    dueDate?: string
    labels?: string[]
  }) => Promise<KanbanTask | null>
  updateTask: (
    taskId: string,
    data: {
      title?: string
      description?: string
      columnId?: string
      priority?: string
      dueDate?: string
      labels?: string[]
    }
  ) => Promise<boolean>
  deleteTask: (taskId: string) => Promise<boolean>
  moveTask: (taskId: string, newColumnId: string) => Promise<boolean>
  isLoading: boolean
  refetchBoards: () => Promise<void>
  refetchCurrentBoard: () => Promise<void>
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined)

export const useKanban = () => {
  const context = useContext(KanbanContext)
  if (!context) {
    throw new Error("useKanban must be used within a KanbanProvider")
  }
  return context
}

interface KanbanProviderProps {
  children: ReactNode
}

export const KanbanProvider = ({ children }: KanbanProviderProps) => {
  const [boards, setBoards] = useState<KanbanBoard[]>([])
  const [currentBoard, setCurrentBoard] = useState<KanbanBoard | null>(null)
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null)
  const [columns, setColumns] = useState<KanbanColumn[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Fetch all boards
  const fetchBoards = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/kanban/boards")
      if (!response.ok) {
        throw new Error("Failed to fetch Kanban boards")
      }
      const data = await response.json()
      setBoards(data)
      return data
    } catch (error) {
      console.error("Error fetching Kanban boards:", error)
      toast({
        title: "Error",
        description: "Failed to load Kanban boards",
        variant: "destructive",
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch a specific board with its columns and tasks
  const fetchBoard = async (boardId: string) => {
    try {
      setIsLoading(true)
      // Fetch board details
      const boardResponse = await fetch(`/api/kanban/boards/${boardId}`)
      if (!boardResponse.ok) {
        throw new Error("Failed to fetch Kanban board")
      }
      const boardData = await boardResponse.json()
      setCurrentBoard(boardData)

      // Fetch columns with tasks
      const columnsResponse = await fetch(`/api/kanban/boards/${boardId}/columns`)
      if (!columnsResponse.ok) {
        throw new Error("Failed to fetch Kanban columns")
      }
      const columnsData = await columnsResponse.json()
      setColumns(columnsData)
      
      return { board: boardData, columns: columnsData }
    } catch (error) {
      console.error("Error fetching Kanban board:", error)
      toast({
        title: "Error",
        description: "Failed to load Kanban board",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Load boards when the component mounts
  useEffect(() => {
    fetchBoards()
  }, [])

  // Load board details when currentBoardId changes
  useEffect(() => {
    if (currentBoardId) {
      fetchBoard(currentBoardId)
    } else {
      setCurrentBoard(null)
      setColumns([])
    }
  }, [currentBoardId])

  // Add a new board
  const addBoard = async (board: { title: string; description?: string }): Promise<KanbanBoard | null> => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/kanban/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(board),
      })

      if (!response.ok) {
        throw new Error("Failed to create Kanban board")
      }

      const newBoard = await response.json()
      setBoards((prev) => [...prev, newBoard])
      
      toast({
        title: "Success",
        description: "Kanban board created successfully",
      })
      
      return newBoard
    } catch (error) {
      console.error("Error creating Kanban board:", error)
      toast({
        title: "Error",
        description: "Failed to create Kanban board",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Update a board
  const updateBoard = async (
    boardId: string,
    data: { title?: string; description?: string }
  ): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/kanban/boards/${boardId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update Kanban board")
      }

      const updatedBoard = await response.json()
      
      // Update boards list
      setBoards((prev) =>
        prev.map((board) => (board.id === boardId ? updatedBoard : board))
      )
      
      // Update current board if needed
      if (currentBoard?.id === boardId) {
        setCurrentBoard(updatedBoard)
      }
      
      toast({
        title: "Success",
        description: "Kanban board updated successfully",
      })
      
      return true
    } catch (error) {
      console.error("Error updating Kanban board:", error)
      toast({
        title: "Error",
        description: "Failed to update Kanban board",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a board
  const deleteBoard = async (boardId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/kanban/boards/${boardId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete Kanban board")
      }

      // Remove from boards list
      setBoards((prev) => prev.filter((board) => board.id !== boardId))
      
      // Clear current board if it was deleted
      if (currentBoardId === boardId) {
        setCurrentBoardId(null)
      }
      
      toast({
        title: "Success",
        description: "Kanban board deleted successfully",
      })
      
      return true
    } catch (error) {
      console.error("Error deleting Kanban board:", error)
      toast({
        title: "Error",
        description: "Failed to delete Kanban board",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new column
  const addColumn = async (column: { title: string; boardId: string }): Promise<KanbanColumn | null> => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/kanban/boards/${column.boardId}/columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: column.title }),
      })

      if (!response.ok) {
        throw new Error("Failed to create column")
      }

      const newColumn = await response.json()
      newColumn.tasks = [] // Initialize with empty tasks array
      
      setColumns((prev) => [...prev, newColumn])
      
      toast({
        title: "Success",
        description: "Column created successfully",
      })
      
      return newColumn
    } catch (error) {
      console.error("Error creating column:", error)
      toast({
        title: "Error",
        description: "Failed to create column",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Update a column
  const updateColumn = async (columnId: string, data: { title?: string }): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/kanban/columns/${columnId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update column")
      }

      const updatedColumn = await response.json()
      
      // Update columns state, preserving tasks
      setColumns((prev) =>
        prev.map((column) => {
          if (column.id === columnId) {
            return { ...updatedColumn, tasks: column.tasks }
          }
          return column
        })
      )
      
      toast({
        title: "Success",
        description: "Column updated successfully",
      })
      
      return true
    } catch (error) {
      console.error("Error updating column:", error)
      toast({
        title: "Error",
        description: "Failed to update column",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a column
  const deleteColumn = async (columnId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/kanban/columns/${columnId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete column")
      }

      // Remove from columns list
      setColumns((prev) => prev.filter((column) => column.id !== columnId))
      
      toast({
        title: "Success",
        description: "Column deleted successfully",
      })
      
      return true
    } catch (error) {
      console.error("Error deleting column:", error)
      toast({
        title: "Error",
        description: "Failed to delete column",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Add a new task
  const addTask = async (task: {
    title: string
    description?: string
    columnId: string
    priority?: string
    dueDate?: string
    labels?: string[]
  }): Promise<KanbanTask | null> => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/kanban/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(task),
      })

      if (!response.ok) {
        throw new Error("Failed to create task")
      }

      const newTask = await response.json()
      
      // Add task to the correct column
      setColumns((prev) =>
        prev.map((column) => {
          if (column.id === task.columnId) {
            return {
              ...column,
              tasks: [...column.tasks, newTask],
            }
          }
          return column
        })
      )
      
      toast({
        title: "Success",
        description: "Task created successfully",
      })
      
      return newTask
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }

  // Update a task
  const updateTask = async (
    taskId: string,
    data: {
      title?: string
      description?: string
      columnId?: string
      priority?: string
      dueDate?: string
      labels?: string[]
    }
  ): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Find the current task to get its columnId
      let currentTask: KanbanTask | null = null
      let currentColumnId: string | null = null
      
      for (const column of columns) {
        const task = column.tasks.find((t) => t.id === taskId)
        if (task) {
          currentTask = task
          currentColumnId = column.id
          break
        }
      }
      
      if (!currentTask || !currentColumnId) {
        throw new Error("Task not found")
      }
      
      const response = await fetch(`/api/kanban/tasks/${taskId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      const updatedTask = await response.json()
      
      // Handle column change (task moving)
      if (data.columnId && data.columnId !== currentColumnId) {
        setColumns((prev) =>
          prev.map((column) => {
            // Remove task from old column
            if (column.id === currentColumnId) {
              return {
                ...column,
                tasks: column.tasks.filter((t) => t.id !== taskId),
              }
            }
            // Add task to new column
            if (column.id === data.columnId) {
              return {
                ...column,
                tasks: [...column.tasks, updatedTask],
              }
            }
            return column
          })
        )
      } else {
        // Update task in the same column
        setColumns((prev) =>
          prev.map((column) => {
            if (column.id === currentColumnId) {
              return {
                ...column,
                tasks: column.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
              }
            }
            return column
          })
        )
      }
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      })
      
      return true
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Delete a task
  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      // Find which column contains the task
      let columnWithTask: KanbanColumn | null = null
      
      for (const column of columns) {
        if (column.tasks.some((t) => t.id === taskId)) {
          columnWithTask = column
          break
        }
      }
      
      if (!columnWithTask) {
        throw new Error("Task not found")
      }
      
      const response = await fetch(`/api/kanban/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      // Remove task from column
      setColumns((prev) =>
        prev.map((column) => {
          if (column.id === columnWithTask?.id) {
            return {
              ...column,
              tasks: column.tasks.filter((t) => t.id !== taskId),
            }
          }
          return column
        })
      )
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
      
      return true
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Move a task between columns
  const moveTask = async (taskId: string, newColumnId: string): Promise<boolean> => {
    return updateTask(taskId, { columnId: newColumnId })
  }

  // Refetch boards
  const refetchBoards = async () => {
    await fetchBoards()
  }

  // Refetch current board
  const refetchCurrentBoard = async () => {
    if (currentBoardId) {
      await fetchBoard(currentBoardId)
    }
  }

  return (
    <KanbanContext.Provider
      value={{
        boards,
        currentBoard,
        columns,
        setCurrentBoardId,
        addBoard,
        updateBoard,
        deleteBoard,
        addColumn,
        updateColumn,
        deleteColumn,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        isLoading,
        refetchBoards,
        refetchCurrentBoard,
      }}
    >
      {children}
    </KanbanContext.Provider>
  )
}
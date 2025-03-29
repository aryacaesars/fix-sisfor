"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/context/auth-context"

export function useKanban() {
  const [boards, setBoards] = useState([])
  const [currentBoard, setCurrentBoard] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { toast } = useToast()
  const { user } = useAuth()

  // Fetch boards
  const fetchBoards = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/boards")

      if (!response.ok) {
        throw new Error("Failed to fetch boards")
      }

      const data = await response.json()
      setBoards(data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching boards:", error)
      setError("Failed to load boards")
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to load boards. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Fetch a specific board
  const fetchBoard = async (boardId) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/boards/${boardId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch board")
      }

      const data = await response.json()
      setCurrentBoard(data)
      setIsLoading(false)
      return data
    } catch (error) {
      console.error("Error fetching board:", error)
      setError("Failed to load board")
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to load board. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Create a new board
  const createBoard = async (title, description) => {
    try {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      })

      if (!response.ok) {
        throw new Error("Failed to create board")
      }

      const newBoard = await response.json()
      setBoards([...boards, newBoard])
      setCurrentBoard(newBoard)

      toast({
        title: "Success",
        description: "Board created successfully",
      })

      return newBoard
    } catch (error) {
      console.error("Error creating board:", error)
      toast({
        title: "Error",
        description: "Failed to create board. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Update a board
  const updateBoard = async (boardId, data) => {
    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update board")
      }

      const updatedBoard = await response.json()

      // Update boards list
      setBoards(boards.map((board) => (board.id === boardId ? updatedBoard : board)))

      // Update current board if it's the one being edited
      if (currentBoard?.id === boardId) {
        setCurrentBoard(updatedBoard)
      }

      toast({
        title: "Success",
        description: "Board updated successfully",
      })

      return updatedBoard
    } catch (error) {
      console.error("Error updating board:", error)
      toast({
        title: "Error",
        description: "Failed to update board. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Delete a board
  const deleteBoard = async (boardId) => {
    try {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete board")
      }

      // Update boards list
      setBoards(boards.filter((board) => board.id !== boardId))

      // Clear current board if it's the one being deleted
      if (currentBoard?.id === boardId) {
        setCurrentBoard(null)
      }

      toast({
        title: "Success",
        description: "Board deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting board:", error)
      toast({
        title: "Error",
        description: "Failed to delete board. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  // Add a column to a board
  const addColumn = async (boardId, title) => {
    try {
      const response = await fetch(`/api/boards/${boardId}/columns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error("Failed to add column")
      }

      const newColumn = await response.json()

      // Update current board if it's the one being edited
      if (currentBoard?.id === boardId) {
        setCurrentBoard({
          ...currentBoard,
          columns: [...currentBoard.columns, newColumn],
        })
      }

      // Refresh the board to get the updated data
      await fetchBoard(boardId)

      toast({
        title: "Success",
        description: "Column added successfully",
      })

      return newColumn
    } catch (error) {
      console.error("Error adding column:", error)
      toast({
        title: "Error",
        description: "Failed to add column. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Update a column
  const updateColumn = async (boardId, columnId, title) => {
    try {
      const response = await fetch(`/api/columns/${columnId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error("Failed to update column")
      }

      const updatedColumn = await response.json()

      // Update current board if it's the one being edited
      if (currentBoard?.id === boardId) {
        setCurrentBoard({
          ...currentBoard,
          columns: currentBoard.columns.map((column) => (column.id === columnId ? updatedColumn : column)),
        })
      }

      toast({
        title: "Success",
        description: "Column updated successfully",
      })

      return updatedColumn
    } catch (error) {
      console.error("Error updating column:", error)
      toast({
        title: "Error",
        description: "Failed to update column. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Delete a column
  const deleteColumn = async (boardId, columnId) => {
    try {
      const response = await fetch(`/api/columns/${columnId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete column")
      }

      // Update current board if it's the one being edited
      if (currentBoard?.id === boardId) {
        setCurrentBoard({
          ...currentBoard,
          columns: currentBoard.columns.filter((column) => column.id !== columnId),
        })
      }

      toast({
        title: "Success",
        description: "Column deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting column:", error)
      toast({
        title: "Error",
        description: "Failed to delete column. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  // Add a task to a column
  const addTask = async (boardId, columnId, taskData) => {
    try {
      const response = await fetch(`/api/columns/${columnId}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error("Failed to add task")
      }

      const newTask = await response.json()

      // Update current board if it's the one being edited
      if (currentBoard?.id === boardId) {
        setCurrentBoard({
          ...currentBoard,
          columns: currentBoard.columns.map((column) => {
            if (column.id === columnId) {
              return {
                ...column,
                tasks: [...column.tasks, newTask],
              }
            }
            return column
          }),
        })
      }

      toast({
        title: "Success",
        description: "Task added successfully",
      })

      return newTask
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Update a task
  const updateTask = async (boardId, columnId, taskId, data) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update task")
      }

      const updatedTask = await response.json()

      // Update current board if it's the one being edited
      if (currentBoard?.id === boardId) {
        setCurrentBoard({
          ...currentBoard,
          columns: currentBoard.columns.map((column) => {
            if (column.id === columnId) {
              return {
                ...column,
                tasks: column.tasks.map((task) => (task.id === taskId ? updatedTask : task)),
              }
            }
            return column
          }),
        })
      }

      toast({
        title: "Success",
        description: "Task updated successfully",
      })

      return updatedTask
    } catch (error) {
      console.error("Error updating task:", error)
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Delete a task
  const deleteTask = async (boardId, columnId, taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete task")
      }

      // Update current board if it's the one being edited
      if (currentBoard?.id === boardId) {
        setCurrentBoard({
          ...currentBoard,
          columns: currentBoard.columns.map((column) => {
            if (column.id === columnId) {
              return {
                ...column,
                tasks: column.tasks.filter((task) => task.id !== taskId),
              }
            }
            return column
          }),
        })
      }

      toast({
        title: "Success",
        description: "Task deleted successfully",
      })

      return true
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      })
      return false
    }
  }

  // Move a task to a different column
  const moveTask = async (boardId, sourceColumnId, destinationColumnId, taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ destinationColumnId }),
      })

      if (!response.ok) {
        throw new Error("Failed to move task")
      }

      const movedTask = await response.json()

      // Update current board if it's the one being edited
      if (currentBoard?.id === boardId) {
        // Find the task in the source column
        const sourceColumn = currentBoard.columns.find((col) => col.id === sourceColumnId)
        if (!sourceColumn) return

        const taskToMove = sourceColumn.tasks.find((task) => task.id === taskId)
        if (!taskToMove) return

        setCurrentBoard({
          ...currentBoard,
          columns: currentBoard.columns.map((column) => {
            // Remove task from source column
            if (column.id === sourceColumnId) {
              return {
                ...column,
                tasks: column.tasks.filter((task) => task.id !== taskId),
              }
            }
            // Add task to destination column
            if (column.id === destinationColumnId) {
              return {
                ...column,
                tasks: [...column.tasks, movedTask],
              }
            }
            return column
          }),
        })
      }

      toast({
        title: "Success",
        description: "Task moved successfully",
      })

      return movedTask
    } catch (error) {
      console.error("Error moving task:", error)
      toast({
        title: "Error",
        description: "Failed to move task. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Add a comment to a task
  const addComment = async (boardId, columnId, taskId, content, parentId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, parentId }),
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      const newComment = await response.json()

      // Update current board if it's the one being edited
      if (currentBoard?.id === boardId) {
        setCurrentBoard({
          ...currentBoard,
          columns: currentBoard.columns.map((column) => {
            if (column.id === columnId) {
              return {
                ...column,
                tasks: column.tasks.map((task) => {
                  if (task.id === taskId) {
                    return {
                      ...task,
                      comments: task.comments ? [...task.comments, newComment] : [newComment],
                    }
                  }
                  return task
                }),
              }
            }
            return column
          }),
        })
      }

      return newComment
    } catch (error) {
      console.error("Error adding comment:", error)
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      })
      return null
    }
  }

  // Check if user has permission for an action
  const hasPermission = (action) => {
    if (!currentBoard || !user) return false

    // Find user's role in the board
    const member = currentBoard.members.find((m) => m.userId === user.id)
    const userRole = member ? member.role : null

    // Board creator has all permissions
    if (currentBoard.createdById === user.id) return true

    // Check permission based on role
    switch (action) {
      case "VIEW_BOARD":
        return !!userRole // Any role can view
      case "EDIT_BOARD":
        return userRole === "admin"
      case "ADD_TASK":
      case "EDIT_TASK":
      case "DELETE_TASK":
      case "MOVE_TASK":
        return userRole === "admin" || userRole === "editor"
      case "ADD_COMMENT":
        return !!userRole // Any role can comment
      case "EDIT_COMMENT":
      case "DELETE_COMMENT":
        return userRole === "admin" || userRole === "editor"
      case "ADD_ATTACHMENT":
      case "DELETE_ATTACHMENT":
        return userRole === "admin" || userRole === "editor"
      case "INVITE_MEMBER":
      case "CHANGE_ROLE":
      case "REMOVE_MEMBER":
        return userRole === "admin"
      default:
        return false
    }
  }

  // Load boards on component mount
  useEffect(() => {
    if (user) {
      fetchBoards()
    }
  }, [user])

  return {
    boards,
    currentBoard,
    isLoading,
    error,
    fetchBoards,
    fetchBoard,
    setCurrentBoard,
    createBoard,
    updateBoard,
    deleteBoard,
    addColumn,
    updateColumn,
    deleteColumn,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addComment,
    hasPermission,
  }
}


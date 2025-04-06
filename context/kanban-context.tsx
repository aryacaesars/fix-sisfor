"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import { useAuth } from "./auth-context"
import {
  type KanbanBoard,
  type KanbanColumn,
  type KanbanTask,
  type KanbanComment,
  type KanbanAttachment,
  type KanbanUser,
  type UserRole,
  KanbanPermissions,
} from "@/types/kanban"

interface KanbanContextType {
  boards: KanbanBoard[]
  currentBoard: KanbanBoard | null
  users: KanbanUser[]
  loading: boolean
  error: string | null
  hasPermission: (action: string) => boolean
  createBoard: (title: string, description?: string) => void
  updateBoard: (boardId: string, data: Partial<KanbanBoard>) => void
  deleteBoard: (boardId: string) => void
  setCurrentBoard: (boardId: string) => void
  addColumn: (boardId: string, title: string) => void
  updateColumn: (boardId: string, columnId: string, title: string) => void
  deleteColumn: (boardId: string, columnId: string) => void
  addTask: (boardId: string, columnId: string, task: Partial<KanbanTask>) => void
  updateTask: (boardId: string, columnId: string, taskId: string, data: Partial<KanbanTask>) => void
  deleteTask: (boardId: string, columnId: string, taskId: string) => void
  moveTask: (boardId: string, sourceColumnId: string, destinationColumnId: string, taskId: string) => void
  addComment: (boardId: string, columnId: string, taskId: string, content: string, parentId?: string) => void
  updateComment: (boardId: string, columnId: string, taskId: string, commentId: string, content: string) => void
  deleteComment: (boardId: string, columnId: string, taskId: string, commentId: string) => void
  addAttachment: (boardId: string, columnId: string, taskId: string, file: File) => Promise<void>
  deleteAttachment: (boardId: string, columnId: string, taskId: string, attachmentId: string) => void
  inviteUser: (boardId: string, email: string, role: UserRole) => void
  updateUserRole: (boardId: string, userId: string, role: UserRole) => void
  removeUser: (boardId: string, userId: string) => void
}

const KanbanContext = createContext<KanbanContextType | undefined>(undefined)

export function KanbanProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [boards, setBoards] = useState<KanbanBoard[]>([])
  const [currentBoard, setCurrentBoardState] = useState<KanbanBoard | null>(null)
  const [users, setUsers] = useState<KanbanUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const storedBoards = localStorage.getItem("kanban-boards")
        const storedUsers = localStorage.getItem("kanban-users")

        if (storedBoards) {
          const allBoards = JSON.parse(storedBoards)
          // Filter boards to only include those created by the current user
          const userBoards = allBoards.filter((board: KanbanBoard) => board.createdBy === user?.email)
          setBoards(userBoards)
        }

        if (storedUsers) {
          setUsers(JSON.parse(storedUsers))
        } else {
          // Initialize with current user if no users exist
          if (user) {
            const initialUser: KanbanUser = {
              id: user.email,
              email: user.email,
              name: user.name || user.email,
              role: "admin",
            }
            setUsers([initialUser])
            localStorage.setItem("kanban-users", JSON.stringify([initialUser]))
          }
        }
      } catch (err) {
        console.error("Error loading Kanban data:", err)
        setError("Failed to load Kanban data")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user])

  // Save boards to localStorage whenever they change
  useEffect(() => {
    if (boards.length > 0) {
      localStorage.setItem("kanban-boards", JSON.stringify(boards))
    }
  }, [boards])

  // Save users to localStorage whenever they change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem("kanban-users", JSON.stringify(users))
    }
  }, [users])

  // Set current board
  const setCurrentBoard = (boardId: string) => {
    const board = boards.find((b) => b.id === boardId) || null
    setCurrentBoardState(board)
  }

  // Check if current user has permission for an action
  const hasPermission = (action: string) => {
    if (!user || !currentBoard) return false

    const userMembership = currentBoard.members.find((m) => m.userId === user.email)
    if (!userMembership) return false

    const permission = KanbanPermissions[action]
    if (!permission) return false

    return permission.roles.includes(userMembership.role)
  }

  // Board operations
  const createBoard = (title: string, description?: string) => {
    if (!user) return

    const newBoard: KanbanBoard = {
      id: uuidv4(),
      title,
      description,
      columns: [
        { id: uuidv4(), title: "To Do", tasks: [] },
        { id: uuidv4(), title: "In Progress", tasks: [] },
        { id: uuidv4(), title: "Done", tasks: [] },
      ],
      createdBy: user.email,
      createdAt: new Date().toISOString(),
      members: [{ userId: user.email, role: "admin" }],
    }

    setBoards([...boards, newBoard])
    setCurrentBoardState(newBoard)
  }

  const updateBoard = (boardId: string, data: Partial<KanbanBoard>) => {
    if (!hasPermission("EDIT_BOARD")) return

    setBoards(
      boards.map((board) =>
        board.id === boardId ? { ...board, ...data, updatedAt: new Date().toISOString() } : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) => (prev ? { ...prev, ...data, updatedAt: new Date().toISOString() } : null))
    }
  }

  const deleteBoard = (boardId: string) => {
    if (!hasPermission("EDIT_BOARD")) return

    setBoards(boards.filter((board) => board.id !== boardId))
    if (currentBoard?.id === boardId) {
      setCurrentBoardState(null)
    }
  }

  // Column operations
  const addColumn = (boardId: string, title: string) => {
    if (!hasPermission("EDIT_BOARD")) return

    const newColumn: KanbanColumn = {
      id: uuidv4(),
      title,
      tasks: [],
    }

    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              columns: [...board.columns, newColumn],
              updatedAt: new Date().toISOString(),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              columns: [...prev.columns, newColumn],
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }
  }

  const updateColumn = (boardId: string, columnId: string, title: string) => {
    if (!hasPermission("EDIT_BOARD")) return

    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map((column) => (column.id === columnId ? { ...column, title } : column)),
              updatedAt: new Date().toISOString(),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((column) => (column.id === columnId ? { ...column, title } : column)),
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }
  }

  const deleteColumn = (boardId: string, columnId: string) => {
    if (!hasPermission("EDIT_BOARD")) return

    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.filter((column) => column.id !== columnId),
              updatedAt: new Date().toISOString(),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.filter((column) => column.id !== columnId),
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }
  }

  // Task operations
  const addTask = (boardId: string, columnId: string, taskData: Partial<KanbanTask>) => {
    if (!hasPermission("ADD_TASK") || !user) return

    const newTask: KanbanTask = {
      id: uuidv4(),
      title: taskData.title || "New Task",
      description: taskData.description || "",
      priority: taskData.priority || "medium",
      createdBy: user.email,
      createdAt: new Date().toISOString(),
      assignedTo: taskData.assignedTo || [],
      comments: [],
      attachments: [],
      labels: taskData.labels || [],
      client: taskData.client,
    }

    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map((column) =>
                column.id === columnId ? { ...column, tasks: [...column.tasks, newTask] } : column,
              ),
              updatedAt: new Date().toISOString(),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((column) =>
                column.id === columnId ? { ...column, tasks: [...column.tasks, newTask] } : column,
              ),
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }
  }

  const updateTask = (boardId: string, columnId: string, taskId: string, data: Partial<KanbanTask>) => {
    if (!hasPermission("EDIT_TASK")) return

    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      tasks: column.tasks.map((task) =>
                        task.id === taskId ? { ...task, ...data, updatedAt: new Date().toISOString() } : task,
                      ),
                    }
                  : column,
              ),
              updatedAt: new Date().toISOString(),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      tasks: column.tasks.map((task) =>
                        task.id === taskId ? { ...task, ...data, updatedAt: new Date().toISOString() } : task,
                      ),
                    }
                  : column,
              ),
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }
  }

  const deleteTask = (boardId: string, columnId: string, taskId: string) => {
    if (!hasPermission("DELETE_TASK")) return

    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      tasks: column.tasks.filter((task) => task.id !== taskId),
                    }
                  : column,
              ),
              updatedAt: new Date().toISOString(),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      tasks: column.tasks.filter((task) => task.id !== taskId),
                    }
                  : column,
              ),
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }
  }

  const moveTask = (boardId: string, sourceColumnId: string, destinationColumnId: string, taskId: string) => {
    if (!hasPermission("MOVE_TASK")) return

    // Find the task in the source column
    const board = boards.find((b) => b.id === boardId)
    if (!board) return

    const sourceColumn = board.columns.find((c) => c.id === sourceColumnId)
    if (!sourceColumn) return

    const taskIndex = sourceColumn.tasks.findIndex((t) => t.id === taskId)
    if (taskIndex === -1) return

    const task = sourceColumn.tasks[taskIndex]

    // Remove from source and add to destination
    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map((column) => {
                if (column.id === sourceColumnId) {
                  return {
                    ...column,
                    tasks: column.tasks.filter((t) => t.id !== taskId),
                  }
                }
                if (column.id === destinationColumnId) {
                  return {
                    ...column,
                    tasks: [...column.tasks, task],
                  }
                }
                return column
              }),
              updatedAt: new Date().toISOString(),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((column) => {
                if (column.id === sourceColumnId) {
                  return {
                    ...column,
                    tasks: column.tasks.filter((t) => t.id !== taskId),
                  }
                }
                if (column.id === destinationColumnId) {
                  return {
                    ...column,
                    tasks: [...column.tasks, task],
                  }
                }
                return column
              }),
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }
  }

  // Comment operations
  const addComment = (boardId: string, columnId: string, taskId: string, content: string, parentId?: string) => {
    if (!hasPermission("ADD_COMMENT") || !user) return

    const newComment: KanbanComment = {
      id: uuidv4(),
      taskId,
      userId: user.email,
      content,
      createdAt: new Date().toISOString(),
      parentId,
    }

    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      tasks: column.tasks.map((task) =>
                        task.id === taskId
                          ? {
                              ...task,
                              comments: task.comments ? [...task.comments, newComment] : [newComment],
                            }
                          : task,
                      ),
                    }
                  : column,
              ),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      tasks: column.tasks.map((task) =>
                        task.id === taskId
                          ? {
                              ...task,
                              comments: task.comments ? [...task.comments, newComment] : [newComment],
                            }
                          : task,
                      ),
                    }
                  : column,
              ),
            }
          : null,
      )
    }
  }

  const updateComment = (boardId: string, columnId: string, taskId: string, commentId: string, content: string) => {
    if (!user) return

    // Find the comment to check ownership
    const board = boards.find((b) => b.id === boardId)
    if (!board) return

    const column = board.columns.find((c) => c.id === columnId)
    if (!column) return

    const task = column.tasks.find((t) => t.id === taskId)
    if (!task || !task.comments) return

    const comment = task.comments.find((c) => c.id === commentId)
    if (!comment) return

    // Check if user is admin or the comment owner
    const isAdmin = hasPermission("EDIT_COMMENT")
    const isOwner = comment.userId === user.email

    if (!isAdmin && !isOwner) return

    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      tasks: column.tasks.map((task) =>
                        task.id === taskId
                          ? {
                              ...task,
                              comments: task.comments?.map((comment) =>
                                comment.id === commentId
                                  ? {
                                      ...comment,
                                      content,
                                      updatedAt: new Date().toISOString(),
                                    }
                                  : comment,
                              ),
                            }
                          : task,
                      ),
                    }
                  : column,
              ),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      tasks: column.tasks.map((task) =>
                        task.id === taskId
                          ? {
                              ...task,
                              comments: task.comments?.map((comment) =>
                                comment.id === commentId
                                  ? {
                                      ...comment,
                                      content,
                                      updatedAt: new Date().toISOString(),
                                    }
                                  : comment,
                              ),
                            }
                          : task,
                      ),
                    }
                  : column,
              ),
            }
          : null,
      )
    }
  }

  const deleteComment = (boardId: string, columnId: string, taskId: string, commentId: string) => {
    if (!user) return

    // Find the comment to check ownership
    const board = boards.find((b) => b.id === boardId)
    if (!board) return

    const column = board.columns.find((c) => c.id === columnId)
    if (!column) return

    const task = column.tasks.find((t) => t.id === taskId)
    if (!task || !task.comments) return

    const comment = task.comments.find((c) => c.id === commentId)
    if (!comment) return

    // Check if user is admin or the comment owner
    const isAdmin = hasPermission("DELETE_COMMENT")
    const isOwner = comment.userId === user.email

    if (!isAdmin && !isOwner) return

    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      tasks: column.tasks.map((task) =>
                        task.id === taskId
                          ? {
                              ...task,
                              comments: task.comments?.filter((comment) => comment.id !== commentId),
                            }
                          : task,
                      ),
                    }
                  : column,
              ),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      tasks: column.tasks.map((task) =>
                        task.id === taskId
                          ? {
                              ...task,
                              comments: task.comments?.filter((comment) => comment.id !== commentId),
                            }
                          : task,
                      ),
                    }
                  : column,
              ),
            }
          : null,
      )
    }
  }

  // Attachment operations
  const addAttachment = async (boardId: string, columnId: string, taskId: string, file: File) => {
    if (!hasPermission("ADD_ATTACHMENT") || !user) return

    // In a real app, we would upload the file to a storage service
    // For this demo, we'll create a data URL
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          if (!e.target || typeof e.target.result !== "string") {
            reject(new Error("Failed to read file"))
            return
          }

          const newAttachment: KanbanAttachment = {
            id: uuidv4(),
            taskId,
            userId: user.email,
            name: file.name,
            type: file.type,
            size: file.size,
            url: e.target.result,
            uploadedAt: new Date().toISOString(),
          }

          setBoards(
            boards.map((board) =>
              board.id === boardId
                ? {
                    ...board,
                    columns: board.columns.map((column) =>
                      column.id === columnId
                        ? {
                            ...column,
                            tasks: column.tasks.map((task) =>
                              task.id === taskId
                                ? {
                                    ...task,
                                    attachments: task.attachments
                                      ? [...task.attachments, newAttachment]
                                      : [newAttachment],
                                  }
                                : task,
                            ),
                          }
                        : column,
                    ),
                  }
                : board,
            ),
          )

          if (currentBoard?.id === boardId) {
            setCurrentBoardState((prev) =>
              prev
                ? {
                    ...prev,
                    columns: prev.columns.map((column) =>
                      column.id === columnId
                        ? {
                            ...column,
                            tasks: column.tasks.map((task) =>
                              task.id === taskId
                                ? {
                                    ...task,
                                    attachments: task.attachments
                                      ? [...task.attachments, newAttachment]
                                      : [newAttachment],
                                  }
                                : task,
                            ),
                          }
                        : column,
                    ),
                  }
                : null,
            )
          }

          resolve()
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => {
        reject(new Error("Failed to read file"))
      }
      reader.readAsDataURL(file)
    })
  }

  const deleteAttachment = (boardId: string, columnId: string, taskId: string, attachmentId: string) => {
    if (!user) return

    // Find the attachment to check ownership
    const board = boards.find((b) => b.id === boardId)
    if (!board) return

    const column = board.columns.find((c) => c.id === columnId)
    if (!column) return

    const task = column.tasks.find((t) => t.id === taskId)
    if (!task || !task.attachments) return

    const attachment = task.attachments.find((a) => a.id === attachmentId)
    if (!attachment) return

    // Check if user is admin or the attachment owner
    const isAdmin = hasPermission("DELETE_ATTACHMENT")
    const isOwner = attachment.userId === user.email

    if (!isAdmin && !isOwner) return

    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              columns: board.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      tasks: column.tasks.map((task) =>
                        task.id === taskId
                          ? {
                              ...task,
                              attachments: task.attachments?.filter((attachment) => attachment.id !== attachmentId),
                            }
                          : task,
                      ),
                    }
                  : column,
              ),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              columns: prev.columns.map((column) =>
                column.id === columnId
                  ? {
                      ...column,
                      tasks: column.tasks.map((task) =>
                        task.id === taskId
                          ? {
                              ...task,
                              attachments: task.attachments?.filter((attachment) => attachment.id !== attachmentId),
                            }
                          : task,
                      ),
                    }
                  : column,
              ),
            }
          : null,
      )
    }
  }

  // User management operations
  const inviteUser = (boardId: string, email: string, role: UserRole) => {
    if (!hasPermission("INVITE_MEMBER")) return

    // Check if user exists
    let userToInvite = users.find((u) => u.email === email)

    // If user doesn't exist, create a new one
    if (!userToInvite) {
      userToInvite = {
        id: email,
        email,
        name: email.split("@")[0],
        role: "viewer", // Default role for new users
      }
      setUsers([...users, userToInvite])
    }

    // Check if user is already a member
    const board = boards.find((b) => b.id === boardId)
    if (!board) return

    const isMember = board.members.some((m) => m.userId === email)
    if (isMember) {
      // Update role if already a member
      setBoards(
        boards.map((board) =>
          board.id === boardId
            ? {
                ...board,
                members: board.members.map((member) => (member.userId === email ? { ...member, role } : member)),
                updatedAt: new Date().toISOString(),
              }
            : board,
        ),
      )
    } else {
      // Add as new member
      setBoards(
        boards.map((board) =>
          board.id === boardId
            ? {
                ...board,
                members: [...board.members, { userId: email, role }],
                updatedAt: new Date().toISOString(),
              }
            : board,
        ),
      )
    }

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) => {
        if (!prev) return null

        const isMember = prev.members.some((m) => m.userId === email)
        if (isMember) {
          return {
            ...prev,
            members: prev.members.map((member) => (member.userId === email ? { ...member, role } : member)),
            updatedAt: new Date().toISOString(),
          }
        } else {
          return {
            ...prev,
            members: [...prev.members, { userId: email, role }],
            updatedAt: new Date().toISOString(),
          }
        }
      })
    }
  }

  const updateUserRole = (boardId: string, userId: string, role: UserRole) => {
    if (!hasPermission("CHANGE_ROLE")) return

    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              members: board.members.map((member) => (member.userId === userId ? { ...member, role } : member)),
              updatedAt: new Date().toISOString(),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.map((member) => (member.userId === userId ? { ...member, role } : member)),
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }
  }

  const removeUser = (boardId: string, userId: string) => {
    if (!hasPermission("REMOVE_MEMBER")) return

    // Cannot remove the board creator
    const board = boards.find((b) => b.id === boardId)
    if (!board || board.createdBy === userId) return

    setBoards(
      boards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              members: board.members.filter((member) => member.userId !== userId),
              updatedAt: new Date().toISOString(),
            }
          : board,
      ),
    )

    if (currentBoard?.id === boardId) {
      setCurrentBoardState((prev) =>
        prev
          ? {
              ...prev,
              members: prev.members.filter((member) => member.userId !== userId),
              updatedAt: new Date().toISOString(),
            }
          : null,
      )
    }
  }

  return (
    <KanbanContext.Provider
      value={{
        boards,
        currentBoard,
        users,
        loading,
        error,
        hasPermission,
        createBoard,
        updateBoard,
        deleteBoard,
        setCurrentBoard,
        addColumn,
        updateColumn,
        deleteColumn,
        addTask,
        updateTask,
        deleteTask,
        moveTask,
        addComment,
        updateComment,
        deleteComment,
        addAttachment,
        deleteAttachment,
        inviteUser,
        updateUserRole,
        removeUser,
      }}
    >
      {children}
    </KanbanContext.Provider>
  )
}

export function useKanban() {
  const context = useContext(KanbanContext)
  if (context === undefined) {
    throw new Error("useKanban must be used within a KanbanProvider")
  }
  return context
}


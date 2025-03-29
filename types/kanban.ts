export type KanbanPriority = "low" | "medium" | "high"
export type UserRole = "admin" | "editor" | "viewer"

export interface KanbanUser {
  id: string
  email: string
  name: string
  avatar?: string
  role: UserRole
}

export interface KanbanComment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  updatedAt?: string
  parentId?: string // For threaded comments
  replies?: KanbanComment[]
}

export interface KanbanAttachment {
  id: string
  taskId: string
  userId: string
  name: string
  type: string
  size: number
  url: string
  uploadedAt: string
}

export interface KanbanTask {
  id: string
  title: string
  description: string
  priority: KanbanPriority
  assignedTo?: string[]
  createdBy: string
  createdAt: string
  updatedAt?: string
  dueDate?: string
  comments?: KanbanComment[]
  attachments?: KanbanAttachment[]
  labels?: string[]
  client?: string // For freelancer tasks
}

export interface KanbanColumn {
  id: string
  title: string
  tasks: KanbanTask[]
}

export interface KanbanBoard {
  id: string
  title: string
  description?: string
  columns: KanbanColumn[]
  createdBy: string
  createdAt: string
  updatedAt?: string
  members: {
    userId: string
    role: UserRole
  }[]
}

export interface KanbanPermission {
  action: string
  roles: UserRole[]
}

export const KanbanPermissions: Record<string, KanbanPermission> = {
  VIEW_BOARD: { action: "view_board", roles: ["admin", "editor", "viewer"] },
  EDIT_BOARD: { action: "edit_board", roles: ["admin"] },
  ADD_TASK: { action: "add_task", roles: ["admin", "editor"] },
  EDIT_TASK: { action: "edit_task", roles: ["admin", "editor"] },
  DELETE_TASK: { action: "delete_task", roles: ["admin", "editor"] },
  MOVE_TASK: { action: "move_task", roles: ["admin", "editor"] },
  ADD_COMMENT: { action: "add_comment", roles: ["admin", "editor", "viewer"] },
  EDIT_COMMENT: { action: "edit_comment", roles: ["admin", "editor"] }, // Users can edit their own comments
  DELETE_COMMENT: { action: "delete_comment", roles: ["admin"] }, // Admins can delete any comment
  ADD_ATTACHMENT: { action: "add_attachment", roles: ["admin", "editor"] },
  DELETE_ATTACHMENT: { action: "delete_attachment", roles: ["admin", "editor"] }, // Users can delete their own attachments
  INVITE_MEMBER: { action: "invite_member", roles: ["admin"] },
  CHANGE_ROLE: { action: "change_role", roles: ["admin"] },
  REMOVE_MEMBER: { action: "remove_member", roles: ["admin"] },
}


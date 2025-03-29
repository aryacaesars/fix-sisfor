"use client"

import type { KanbanTask, KanbanPriority } from "@/types/kanban"
import { useKanban } from "@/context/kanban-context"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Paperclip, MessageSquare } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface TaskCardProps {
  task: KanbanTask
  columnId: string
  onDragStart: (taskId: string, columnId: string) => void
  onClick: () => void
}

export function TaskCard({ task, columnId, onDragStart, onClick }: TaskCardProps) {
  const { users } = useKanban()

  const priorityColors: Record<KanbanPriority, string> = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  const assignedUsers = task.assignedTo ? users.filter((user) => task.assignedTo?.includes(user.id)) : []

  const commentCount = task.comments?.length || 0
  const attachmentCount = task.attachments?.length || 0

  return (
    <div
      className="bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      draggable
      onDragStart={() => onDragStart(task.id, columnId)}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-sm truncate mr-2">{task.title}</h4>
        <Badge className={`${priorityColors[task.priority]} shrink-0`}>{task.priority}</Badge>
      </div>

      {task.description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2 break-words">{task.description}</p>
      )}

      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map((label) => (
            <Badge key={label} variant="outline" className="text-xs truncate max-w-full">
              {label}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-2">
        <div className="flex -space-x-2 overflow-hidden">
          {assignedUsers.slice(0, 3).map((user) => (
            <Avatar key={user.id} className="h-6 w-6 border-2 border-white dark:border-gray-700">
              <AvatarFallback className="text-xs">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          ))}
          {assignedUsers.length > 3 && (
            <Avatar className="h-6 w-6 border-2 border-white dark:border-gray-700">
              <AvatarFallback className="text-xs">+{assignedUsers.length - 3}</AvatarFallback>
            </Avatar>
          )}
        </div>

        <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400 shrink-0">
          {commentCount > 0 && (
            <div className="flex items-center text-xs">
              <MessageSquare className="h-3 w-3 mr-1" />
              {commentCount}
            </div>
          )}
          {attachmentCount > 0 && (
            <div className="flex items-center text-xs">
              <Paperclip className="h-3 w-3 mr-1" />
              {attachmentCount}
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2 truncate">
        {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
      </div>
    </div>
  )
}


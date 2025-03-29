"use client"

import type React from "react"

import { useState } from "react"
import { useKanban } from "@/context/kanban-context"
import type { KanbanColumn as ColumnType, KanbanTask } from "@/types/kanban"
import { TaskCard } from "./task-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MoreHorizontal, Plus, X, Edit, Check } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { AddTaskModal } from "./add-task-modal"

interface KanbanColumnProps {
  column: ColumnType
  onDragStart: (taskId: string, columnId: string) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDrop: () => void
  onTaskClick: (task: KanbanTask, columnId: string) => void
  onAddTask: (columnId: string, taskData: Partial<KanbanTask>) => void
  maxVisibleTasks?: number
}

export function KanbanColumn({
  column,
  onDragStart,
  onDragOver,
  onDrop,
  onTaskClick,
  onAddTask,
  maxVisibleTasks = 3,
}: KanbanColumnProps) {
  const { currentBoard, updateColumn, deleteColumn, hasPermission } = useKanban()
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(column.title)
  const [showAddTaskModal, setShowAddTaskModal] = useState(false)
  const visibleTasks = column.tasks.slice(0, maxVisibleTasks)
  const { toast } = useToast()

  const handleUpdateColumn = () => {
    if (editedTitle.trim() && currentBoard) {
      updateColumn(currentBoard.id, column.id, editedTitle)
      setIsEditing(false)
    }
  }

  const handleDeleteColumn = () => {
    if (currentBoard) {
      deleteColumn(currentBoard.id, column.id)
    }
  }

  const hasMoreTasks = column.tasks.length > maxVisibleTasks

  return (
    <div
      className="flex-shrink-0 w-[272px] bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col h-fit max-h-[calc(100vh-250px)]"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-gray-100 dark:bg-gray-800 z-10">
        {isEditing ? (
          <div className="flex items-center space-x-2 w-full">
            <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} className="flex-1" autoFocus />
            <Button size="sm" onClick={handleUpdateColumn}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <h3 className="font-medium truncate">{column.title}</h3>
            <div className="flex items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">{column.tasks.length}</span>
              {hasPermission("EDIT_BOARD") && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDeleteColumn}>
                      <X className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[100px]">
        {visibleTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            columnId={column.id}
            onDragStart={onDragStart}
            onClick={() => onTaskClick(task, column.id)}
          />
        ))}
      </div>

      {hasPermission("ADD_TASK") && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-gray-100 dark:bg-gray-800">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={() => {
              if (column.tasks.length >= 3) {
                toast({
                  title: "Maximum tasks reached",
                  description: "A column can have a maximum of 3 tasks. Please complete or move existing tasks first.",
                  variant: "destructive",
                })
                return
              }
              setShowAddTaskModal(true)
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      )}

      {showAddTaskModal && (
        <AddTaskModal columnId={column.id} onClose={() => setShowAddTaskModal(false)} onAddTask={onAddTask} />
      )}
    </div>
  )
}


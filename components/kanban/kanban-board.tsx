"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useKanban } from "@/context/kanban-context"
import type { KanbanTask } from "@/types/kanban"
import { KanbanColumn as ColumnComponent } from "./kanban-column"
import { TaskDetailModal } from "./task-detail-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function KanbanBoard() {
  const { currentBoard, addColumn, hasPermission, addTask, moveTask } = useKanban()
  const [newColumnTitle, setNewColumnTitle] = useState("")
  const [selectedTask, setSelectedTask] = useState<{
    task: KanbanTask
    columnId: string
  } | null>(null)
  const [scrollPosition, setScrollPosition] = useState(0)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const draggedItem = useRef<{ taskId: string; columnId: string } | null>(null)
  const { toast } = useToast()

  if (!currentBoard) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <h2 className="text-xl font-semibold mb-4">No board selected</h2>
        <p className="text-gray-500 mb-4">Select a board or create a new one to get started</p>
      </div>
    )
  }

  const handleDragStart = (taskId: string, columnId: string) => {
    draggedItem.current = { taskId, columnId }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (columnId: string) => {
    if (draggedItem.current && draggedItem.current.columnId !== columnId && currentBoard) {
      const { taskId, columnId: sourceColumnId } = draggedItem.current

      // Check if target column already has 3 tasks
      const targetColumn = currentBoard.columns.find((col) => col.id === columnId)
      if (targetColumn && targetColumn.tasks.length >= 3) {
        toast({
          title: "Maximum tasks reached",
          description: "A column can have a maximum of 3 tasks. Please complete or move existing tasks first.",
          variant: "destructive",
        })
        draggedItem.current = null
        return
      }

      moveTask(currentBoard.id, sourceColumnId, columnId, taskId)
      draggedItem.current = null
    }
  }

  const handleAddColumn = () => {
    if (newColumnTitle.trim() && currentBoard) {
      addColumn(currentBoard.id, newColumnTitle.trim())
      setNewColumnTitle("")
    }
  }

  // Update the handleAddTask function to accept full task data
  const handleAddTask = (columnId: string, taskData: Partial<KanbanTask>) => {
    if (taskData.title?.trim() && currentBoard) {
      // Find the column
      const column = currentBoard.columns.find((col) => col.id === columnId)

      // Only add the task if the column has fewer than 3 tasks
      if (column && column.tasks.length < 3) {
        addTask(currentBoard.id, columnId, taskData)
      } else {
        // Show toast alert
        toast({
          title: "Maximum tasks reached",
          description: "A column can have a maximum of 3 tasks. Please complete or move existing tasks first.",
          variant: "destructive",
        })
      }
    }
  }

  const handleTaskClick = (task: KanbanTask, columnId: string) => {
    setSelectedTask({ task, columnId })
  }

  const handleCloseTaskModal = () => {
    setSelectedTask(null)
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const newPosition = Math.max(0, scrollPosition - 1)
      setScrollPosition(newPosition)
      scrollContainerRef.current.scrollTo({
        left: newPosition * 288, // 288px = column width (272px) + gap (16px)
        behavior: "smooth",
      })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current && currentBoard) {
      const maxScroll = Math.max(0, currentBoard.columns.length - 3)
      const newPosition = Math.min(maxScroll, scrollPosition + 1)
      setScrollPosition(newPosition)
      scrollContainerRef.current.scrollTo({
        left: newPosition * 288, // 288px = column width (272px) + gap (16px)
        behavior: "smooth",
      })
    }
  }

  const showLeftScroll = scrollPosition > 0
  const showRightScroll = currentBoard.columns.length > 3 && scrollPosition < currentBoard.columns.length - 3

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold">{currentBoard.title}</h2>
          {currentBoard.description && <p className="text-gray-500 mt-1 text-sm">{currentBoard.description}</p>}
        </div>
      </div>

      <div className="relative">
        {showLeftScroll && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {showRightScroll && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto pb-6 space-x-4 min-h-[calc(100vh-250px)] scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            maxWidth: "calc(272px * 3 + 16px * 2)", // 3 columns + 2 gaps
          }}
        >
          {currentBoard.columns.map((column) => (
            <ColumnComponent
              key={column.id}
              column={column}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTask}
              maxVisibleTasks={3}
            />
          ))}

          {hasPermission("EDIT_BOARD") && (
            <div className="flex-shrink-0 w-[272px] bg-gray-100 dark:bg-gray-800 rounded-lg p-3 h-fit">
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Add new column"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  className="flex-1"
                />
                <Button size="sm" onClick={handleAddColumn} disabled={!newColumnTitle.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal task={selectedTask.task} columnId={selectedTask.columnId} onClose={handleCloseTaskModal} />
      )}
    </div>
  )
}


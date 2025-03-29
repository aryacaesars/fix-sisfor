"use client"

import { useState } from "react"
import { useKanban } from "@/context/kanban-context"
import type { KanbanPriority, KanbanTask } from "@/types/kanban"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserSelect } from "./user-select"
import { X, Save, Plus } from "lucide-react"

interface AddTaskModalProps {
  columnId: string
  onClose: () => void
  onAddTask: (columnId: string, taskData: Partial<KanbanTask>) => void
}

export function AddTaskModal({ columnId, onClose, onAddTask }: AddTaskModalProps) {
  const { currentBoard } = useKanban()
  const [taskData, setTaskData] = useState<Partial<KanbanTask>>({
    title: "",
    description: "",
    priority: "medium" as KanbanPriority,
    assignedTo: [],
    labels: [],
  })
  const [newLabel, setNewLabel] = useState("")
  const [dueDate, setDueDate] = useState("")

  const handleSave = () => {
    if (!taskData.title?.trim()) return

    const finalTaskData = { ...taskData }

    // Add due date if provided
    if (dueDate) {
      finalTaskData.dueDate = new Date(dueDate).toISOString()
    }

    onAddTask(columnId, finalTaskData)
    onClose()
  }

  const handleAddLabel = () => {
    if (newLabel.trim()) {
      setTaskData({
        ...taskData,
        labels: [...(taskData.labels || []), newLabel.trim()],
      })
      setNewLabel("")
    }
  }

  const handleRemoveLabel = (label: string) => {
    setTaskData({
      ...taskData,
      labels: taskData.labels?.filter((l) => l !== label),
    })
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={taskData.title || ""}
              onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
              placeholder="Task title"
              autoFocus
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={taskData.description || ""}
              onChange={(e) => setTaskData({ ...taskData, description: e.target.value })}
              placeholder="Task description"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={taskData.priority}
                onValueChange={(value) => setTaskData({ ...taskData, priority: value as KanbanPriority })}
              >
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Assigned To</Label>
            <UserSelect
              selectedUserIds={taskData.assignedTo || []}
              onChange={(userIds) => setTaskData({ ...taskData, assignedTo: userIds })}
            />
          </div>

          <div>
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {taskData.labels?.map((label) => (
                <div
                  key={label}
                  className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-sm flex items-center"
                >
                  {label}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleRemoveLabel(label)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Add new label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleAddLabel} disabled={!newLabel.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!taskData.title?.trim()}>
            <Save className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


"use client"

import { useState, useRef } from "react"
import { useKanban } from "@/context/kanban-context"
import type { KanbanTask, KanbanPriority } from "@/types/kanban"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CommentSection } from "./comment-section"
import { AttachmentSection } from "./attachment-section"
import { UserSelect } from "./user-select"
import { X, Save, Trash } from "lucide-react"
import { format } from "date-fns"

interface TaskDetailModalProps {
  task: KanbanTask
  columnId: string
  onClose: () => void
}

export function TaskDetailModal({ task, columnId, onClose }: TaskDetailModalProps) {
  const { currentBoard, updateTask, deleteTask, hasPermission } = useKanban()
  const [editedTask, setEditedTask] = useState<Partial<KanbanTask>>({
    title: task.title,
    description: task.description,
    priority: task.priority,
    dueDate: task.dueDate,
    assignedTo: task.assignedTo || [],
    labels: task.labels || [],
  })
  const [newLabel, setNewLabel] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = () => {
    if (currentBoard && editedTask.title) {
      updateTask(currentBoard.id, columnId, task.id, editedTask)
      onClose()
    }
  }

  const handleDelete = () => {
    if (currentBoard) {
      deleteTask(currentBoard.id, columnId, task.id)
      onClose()
    }
  }

  const handleAddLabel = () => {
    if (newLabel.trim()) {
      setEditedTask({
        ...editedTask,
        labels: [...(editedTask.labels || []), newLabel.trim()],
      })
      setNewLabel("")
    }
  }

  const handleRemoveLabel = (label: string) => {
    setEditedTask({
      ...editedTask,
      labels: editedTask.labels?.filter((l) => l !== label),
    })
  }

  const canEdit = hasPermission("EDIT_TASK")
  const canDelete = hasPermission("DELETE_TASK")

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="flex-1 overflow-hidden">
          <TabsList className="sticky top-0 z-10 bg-background mb-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments">Comments ({task.comments?.length || 0})</TabsTrigger>
            <TabsTrigger value="attachments">Attachments ({task.attachments?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="overflow-auto p-4 max-h-[60vh]">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  disabled={!canEdit}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editedTask.description}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={4}
                  disabled={!canEdit}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={editedTask.priority}
                    onValueChange={(value) =>
                      setEditedTask({
                        ...editedTask,
                        priority: value as KanbanPriority,
                      })
                    }
                    disabled={!canEdit}
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
                  <Input
                    id="dueDate"
                    type="date"
                    value={editedTask.dueDate ? format(new Date(editedTask.dueDate), "yyyy-MM-dd") : ""}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        dueDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                      })
                    }
                    disabled={!canEdit}
                  />
                </div>
              </div>

              <div>
                <Label>Assigned To</Label>
                <UserSelect
                  selectedUserIds={editedTask.assignedTo || []}
                  onChange={(userIds) => setEditedTask({ ...editedTask, assignedTo: userIds })}
                  disabled={!canEdit}
                />
              </div>

              <div>
                <Label>Labels</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editedTask.labels?.map((label) => (
                    <div
                      key={label}
                      className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md text-sm flex items-center"
                    >
                      {label}
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => handleRemoveLabel(label)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {canEdit && (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add new label"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleAddLabel} disabled={!newLabel.trim()}>
                      Add
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500 dark:text-gray-400">
                <p>Created: {format(new Date(task.createdAt), "PPP p")}</p>
                {task.updatedAt && <p>Updated: {format(new Date(task.updatedAt), "PPP p")}</p>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="comments" className="overflow-auto max-h-[60vh]">
            <CommentSection task={task} columnId={columnId} />
          </TabsContent>

          <TabsContent value="attachments" className="overflow-auto max-h-[60vh]">
            <AttachmentSection task={task} columnId={columnId} />
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t mt-auto">
          <div>
            {canDelete && (
              <Button variant="destructive" onClick={handleDelete}>
                <Trash className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {canEdit && (
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


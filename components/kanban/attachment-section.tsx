"use client"

import type React from "react"

import { useRef } from "react"
import { useKanban } from "@/context/kanban-context"
import { useAuth } from "@/context/auth-context"
import type { KanbanTask } from "@/types/kanban"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { Download, Trash, Upload, File, Image, FileText, Film, Music } from "lucide-react"
import { formatBytes } from "@/lib/utils"

interface AttachmentSectionProps {
  task: KanbanTask
  columnId: string
}

export function AttachmentSection({ task, columnId }: AttachmentSectionProps) {
  const { currentBoard, addAttachment, deleteAttachment, users, hasPermission } = useKanban()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files.length || !currentBoard) return

    const file = e.target.files[0]
    try {
      await addAttachment(currentBoard.id, columnId, task.id, file)
      e.target.value = "" // Reset the input
    } catch (error) {
      console.error("Error uploading file:", error)
      // Handle error (show toast, etc.)
    }
  }

  const handleDeleteAttachment = (attachmentId: string) => {
    if (currentBoard) {
      deleteAttachment(currentBoard.id, columnId, task.id, attachmentId)
    }
  }

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name : userId
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-5 w-5" />
    if (type.startsWith("video/")) return <Film className="h-5 w-5" />
    if (type.startsWith("audio/")) return <Music className="h-5 w-5" />
    if (type.includes("pdf")) return <FileText className="h-5 w-5" />
    return <File className="h-5 w-5" />
  }

  const canAddAttachment = hasPermission("ADD_ATTACHMENT")

  return (
    <div className="p-4">
      {!task.attachments || task.attachments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No attachments yet.</div>
      ) : (
        <div className="space-y-3">
          {task.attachments.map((attachment) => {
            const isOwner = user?.email === attachment.userId
            const canDelete = isOwner || hasPermission("DELETE_ATTACHMENT")

            return (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center">
                  {getFileIcon(attachment.type)}
                  <div className="ml-3">
                    <div className="font-medium text-sm">{attachment.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatBytes(attachment.size)} • Uploaded by {getUserName(attachment.userId)}{" "}
                      {formatDistanceToNow(new Date(attachment.uploadedAt), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" onClick={() => window.open(attachment.url, "_blank")}>
                    <Download className="h-4 w-4" />
                  </Button>
                  {canDelete && (
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteAttachment(attachment.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {canAddAttachment && (
        <div className="mt-6">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          <Button onClick={() => fileInputRef.current?.click()} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Upload Attachment
          </Button>
        </div>
      )}
    </div>
  )
}


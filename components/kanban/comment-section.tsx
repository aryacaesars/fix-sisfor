"use client"

import { useState } from "react"
import { useKanban } from "@/context/kanban-context"
import { useAuth } from "@/context/auth-context"
import type { KanbanTask, KanbanComment } from "@/types/kanban"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { Edit, Trash, Reply, Check, X } from "lucide-react"

interface CommentSectionProps {
  task: KanbanTask
  columnId: string
}

export function CommentSection({ task, columnId }: CommentSectionProps) {
  const { currentBoard, addComment, updateComment, deleteComment, users, hasPermission } = useKanban()
  const { user } = useAuth()
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [editedContent, setEditedContent] = useState("")

  const handleAddComment = () => {
    if (currentBoard && newComment.trim()) {
      addComment(currentBoard.id, columnId, task.id, newComment.trim(), replyTo || undefined)
      setNewComment("")
      setReplyTo(null)
    }
  }

  const handleUpdateComment = (commentId: string) => {
    if (currentBoard && editedContent.trim()) {
      updateComment(currentBoard.id, columnId, task.id, commentId, editedContent.trim())
      setEditingComment(null)
      setEditedContent("")
    }
  }

  const handleDeleteComment = (commentId: string) => {
    if (currentBoard) {
      deleteComment(currentBoard.id, columnId, task.id, commentId)
    }
  }

  const startEditing = (comment: KanbanComment) => {
    setEditingComment(comment.id)
    setEditedContent(comment.content)
  }

  const cancelEditing = () => {
    setEditingComment(null)
    setEditedContent("")
  }

  const startReplying = (commentId: string) => {
    setReplyTo(commentId)
    setNewComment("")
  }

  const cancelReplying = () => {
    setReplyTo(null)
  }

  // Group comments by parent/child relationship
  const topLevelComments = task.comments?.filter((c) => !c.parentId) || []
  const commentReplies = task.comments?.filter((c) => c.parentId) || []

  const getCommentReplies = (commentId: string) => {
    return commentReplies.filter((reply) => reply.parentId === commentId)
  }

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user ? user.name : userId
  }

  const canAddComment = hasPermission("ADD_COMMENT")

  const renderComment = (comment: KanbanComment, isReply = false) => {
    const isEditing = editingComment === comment.id
    const isCurrentUser = user?.email === comment.userId
    const canEdit = isCurrentUser || hasPermission("EDIT_COMMENT")
    const canDelete = isCurrentUser || hasPermission("DELETE_COMMENT")

    return (
      <div key={comment.id} className={`${isReply ? "ml-8 mt-2" : "mt-4"} bg-gray-50 dark:bg-gray-800 rounded-lg p-3`}>
        <div className="flex items-start">
          <Avatar className="h-8 w-8 mr-3">
            <AvatarFallback>{getUserName(comment.userId).substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div className="font-medium text-sm">{getUserName(comment.userId)}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                {comment.updatedAt && " (edited)"}
              </div>
            </div>

            {isEditing ? (
              <div className="mt-2">
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={3}
                  className="mb-2"
                />
                <div className="flex justify-end space-x-2">
                  <Button size="sm" onClick={() => handleUpdateComment(comment.id)}>
                    <Check className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                  <Button size="sm" variant="ghost" onClick={cancelEditing}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-1 text-sm">{comment.content}</div>
                <div className="flex mt-2 space-x-2">
                  {!isReply && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => startReplying(comment.id)}>
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  )}
                  {canEdit && (
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => startEditing(comment)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      <Trash className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {replyTo === comment.id && (
          <div className="ml-8 mt-3">
            <Textarea
              placeholder="Write a reply..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              className="mb-2"
            />
            <div className="flex justify-end space-x-2">
              <Button size="sm" onClick={handleAddComment}>
                Reply
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelReplying}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {getCommentReplies(comment.id).map((reply) => renderComment(reply, true))}
      </div>
    )
  }

  return (
    <div className="p-4">
      {topLevelComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div>{topLevelComments.map((comment) => renderComment(comment))}</div>
      )}

      {canAddComment && !replyTo && (
        <div className="mt-6">
          <h4 className="text-sm font-medium mb-2">Add a comment</h4>
          <Textarea
            placeholder="Write your comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="mb-2"
          />
          <div className="flex justify-end">
            <Button onClick={handleAddComment} disabled={!newComment.trim()}>
              Comment
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


"use client"

import { useState } from "react"
import { useKanban } from "@/context/kanban-context"
import type { KanbanBoard, UserRole } from "@/types/kanban"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Save, Trash, UserPlus, X } from "lucide-react"

interface BoardSettingsProps {
  board: KanbanBoard
  onClose: () => void
}

export function BoardSettings({ board, onClose }: BoardSettingsProps) {
  const { updateBoard, deleteBoard, users, inviteUser, updateUserRole, removeUser } = useKanban()
  const [boardData, setBoardData] = useState({
    title: board.title,
    description: board.description || "",
  })
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [newMemberRole, setNewMemberRole] = useState<UserRole>("viewer")

  const handleSave = () => {
    if (boardData.title.trim()) {
      updateBoard(board.id, {
        title: boardData.title.trim(),
        description: boardData.description.trim() || undefined,
      })
      onClose()
    }
  }

  const handleDelete = () => {
    deleteBoard(board.id)
    onClose()
  }

  const handleInviteUser = () => {
    if (newMemberEmail.trim()) {
      inviteUser(board.id, newMemberEmail.trim(), newMemberRole)
      setNewMemberEmail("")
    }
  }

  const handleUpdateUserRole = (userId: string, role: UserRole) => {
    updateUserRole(board.id, userId, role)
  }

  const handleRemoveUser = (userId: string) => {
    removeUser(board.id, userId)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Board Settings</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 overflow-hidden">
          <TabsList className="sticky top-0 z-10 bg-background">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="overflow-auto p-4 max-h-[60vh]">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Board Title</Label>
                <Input
                  id="title"
                  value={boardData.title}
                  onChange={(e) => setBoardData({ ...boardData, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={boardData.description}
                  onChange={(e) => setBoardData({ ...boardData, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Once you delete a board, there is no going back. Please be certain.
                </p>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Board
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="members" className="overflow-auto p-4 max-h-[60vh]">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Invite Members</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Email address"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={newMemberRole} onValueChange={(value) => setNewMemberRole(value as UserRole)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={handleInviteUser} disabled={!newMemberEmail.trim()}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Board Members</h3>
                <div className="space-y-2">
                  {board.members.map((member) => {
                    const user = users.find((u) => u.id === member.userId)
                    const isCreator = board.createdBy === member.userId

                    return (
                      <div
                        key={member.userId}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-3">
                            <AvatarFallback>
                              {user
                                ? user.name.substring(0, 2).toUpperCase()
                                : member.userId.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {user ? user.name : member.userId}
                              {isCreator && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                                  Creator
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{member.userId}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={member.role}
                            onValueChange={(value) => handleUpdateUserRole(member.userId, value as UserRole)}
                            disabled={isCreator}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                          {!isCreator && (
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveUser(member.userId)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t mt-auto">
          <div className="flex space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}


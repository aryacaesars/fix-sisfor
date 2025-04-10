"use client"

import { useState } from "react"
import { Settings, Trash2 } from "lucide-react"
import { useKanban } from "@/context/kanban-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

export default function BoardSettings() {
  const { currentBoard, updateBoard, deleteBoard } = useKanban()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  
  const [editForm, setEditForm] = useState({
    title: currentBoard?.title || "",
    description: currentBoard?.description || "",
  })
  
  const handleUpdateBoard = async () => {
    if (!currentBoard || !editForm.title.trim()) return
    
    const success = await updateBoard(currentBoard.id, {
      title: editForm.title,
      description: editForm.description,
    })
    
    if (success) {
      setIsEditDialogOpen(false)
      toast({
        title: "Board updated",
        description: "The board has been successfully updated.",
      })
    }
  }
  
  const handleDeleteBoard = async () => {
    if (!currentBoard) return
    
    const success = await deleteBoard(currentBoard.id)
    
    if (success) {
      setIsDeleteDialogOpen(false)
      router.push("/student-dashboard/kanban")
      toast({
        title: "Board deleted",
        description: "The board has been successfully deleted.",
      })
    }
  }
  
  if (!currentBoard) return null
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Board settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              Edit Board Details
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Board</DialogTitle>
              <DialogDescription>
                Update your board's name and description.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-board-title">Board Name</Label>
                <Input
                  id="edit-board-title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Enter board name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-board-description">Description</Label>
                <Textarea
                  id="edit-board-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Enter board description (optional)"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateBoard}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <DropdownMenuSeparator />
        
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogTrigger asChild>
            <DropdownMenuItem className="text-red-600" onSelect={(e) => e.preventDefault()}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Board
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Board</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this board? This will permanently remove all columns and tasks
                associated with this board. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteBoard}>
                Delete Board
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
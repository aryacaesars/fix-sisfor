"use client"

import { useState } from "react"
import { useKanban } from "@/context/kanban-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function BoardSelector() {
  const { boards, currentBoard, setCurrentBoard, createBoard } = useKanban()
  const [isCreating, setIsCreating] = useState(false)
  const [newBoardData, setNewBoardData] = useState({
    title: "",
    description: "",
  })

  const handleSelectBoard = (boardId: string) => {
    setCurrentBoard(boardId)
  }

  const handleCreateBoard = () => {
    if (newBoardData.title.trim()) {
      createBoard(newBoardData.title.trim(), newBoardData.description.trim() || undefined)
      setNewBoardData({ title: "", description: "" })
      setIsCreating(false)
    }
  }

  return (
    <div className="flex items-center space-x-2 mb-6">
      <Select value={currentBoard?.id || ""} onValueChange={handleSelectBoard}>
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select a board" />
        </SelectTrigger>
        <SelectContent>
          {boards.map((board) => (
            <SelectItem key={board.id} value={board.id}>
              {board.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button onClick={() => setIsCreating(true)}>
        <Plus className="h-4 w-4 mr-2" />
        New Board
      </Button>

      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Board Title</Label>
              <Input
                id="title"
                value={newBoardData.title}
                onChange={(e) => setNewBoardData({ ...newBoardData, title: e.target.value })}
                placeholder="My New Board"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={newBoardData.description}
                onChange={(e) => setNewBoardData({ ...newBoardData, description: e.target.value })}
                placeholder="Describe the purpose of this board"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBoard} disabled={!newBoardData.title.trim()}>
              Create Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


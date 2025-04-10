"use client"

import { useState } from "react"
import { CaretSortIcon, PlusCircledIcon } from "@radix-ui/react-icons"
import { useKanban } from "@/context/kanban-context"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"

export default function BoardSelector() {
  const { boards, currentBoard, setCurrentBoardId, addBoard } = useKanban()
  const [open, setOpen] = useState(false)
  const [showNewBoardDialog, setShowNewBoardDialog] = useState(false)
  const [newBoardData, setNewBoardData] = useState({
    title: "",
    description: "",
  })

  const handleCreateBoard = async () => {
    if (!newBoardData.title.trim()) return

    const board = await addBoard({
      title: newBoardData.title,
      description: newBoardData.description,
    })

    if (board) {
      setCurrentBoardId(board.id)
      setNewBoardData({ title: "", description: "" })
      setShowNewBoardDialog(false)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-[260px] justify-between">
            {currentBoard ? currentBoard.title : "Select a board..."}
            <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[260px] p-0">
          <Command>
            <CommandInput placeholder="Search boards..." className="h-9" />
            <CommandList>
              <CommandEmpty>No boards found.</CommandEmpty>
              <CommandGroup>
                {boards.map((board) => (
                  <CommandItem
                    key={board.id}
                    onSelect={() => {
                      setCurrentBoardId(board.id)
                      setOpen(false)
                    }}
                    className="text-sm"
                  >
                    {board.title}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <DialogTrigger asChild>
                  <CommandItem
                    onSelect={() => {
                      setOpen(false)
                      setShowNewBoardDialog(true)
                    }}
                  >
                    <PlusCircledIcon className="mr-2 h-4 w-4" />
                    Create New Board
                  </CommandItem>
                </DialogTrigger>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={showNewBoardDialog} onOpenChange={setShowNewBoardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
            <DialogDescription>Add a new Kanban board to manage your tasks.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="board-title">Board Name</Label>
              <Input
                id="board-title"
                placeholder="Enter board name"
                value={newBoardData.title}
                onChange={(e) => setNewBoardData({ ...newBoardData, title: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="board-description">Description</Label>
              <Textarea
                id="board-description"
                placeholder="Enter board description (optional)"
                value={newBoardData.description}
                onChange={(e) => setNewBoardData({ ...newBoardData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewBoardDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateBoard}>Create Board</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
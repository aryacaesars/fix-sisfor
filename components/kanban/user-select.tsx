"use client"

import type React from "react"

import { useState } from "react"
import { useKanban } from "@/context/kanban-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"

interface UserSelectProps {
  selectedUserIds: string[]
  onChange: (userIds: string[]) => void
  disabled?: boolean
}

export function UserSelect({ selectedUserIds, onChange, disabled = false }: UserSelectProps) {
  const { users, currentBoard } = useKanban()
  const [open, setOpen] = useState(false)

  // Filter users to only include board members
  const boardMembers = currentBoard
    ? users.filter((user) => currentBoard.members.some((member) => member.userId === user.id))
    : users

  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter((id) => id !== userId))
    } else {
      onChange([...selectedUserIds, userId])
    }
  }

  const removeUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(selectedUserIds.filter((id) => id !== userId))
  }

  return (
    <div>
      <Popover open={open && !disabled} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedUserIds.length > 0
                ? `${selectedUserIds.length} user${selectedUserIds.length > 1 ? "s" : ""} assigned`
                : "Assign users"}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Search users..." />
            <CommandList>
              <CommandEmpty>No users found.</CommandEmpty>
              <CommandGroup>
                {boardMembers.map((user) => (
                  <CommandItem key={user.id} value={user.id} onSelect={() => toggleUser(user.id)}>
                    <Check
                      className={`mr-2 h-4 w-4 ${selectedUserIds.includes(user.id) ? "opacity-100" : "opacity-0"}`}
                    />
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span>{user.name}</span>
                    <span className="ml-2 text-gray-500 dark:text-gray-400 text-xs">({user.role})</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedUserIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedUserIds.map((userId) => {
            const user = users.find((u) => u.id === userId)
            if (!user) return null

            return (
              <div key={userId} className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full pl-1 pr-2 py-1">
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarFallback className="text-xs">{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm">{user.name}</span>
                {!disabled && (
                  <Button variant="ghost" size="sm" className="h-4 w-4 p-0 ml-1" onClick={(e) => removeUser(userId, e)}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}


"use client"

import { useEffect } from "react"
import { KanbanProvider } from "@/context/kanban-context"
import KanbanBoard from "@/components/kanban/kanban-board"
import BoardSelector from "@/components/kanban/board-selector"
import BoardSettings from "@/components/kanban/board-settings"
import { AnimatedSection } from "@/components/animated-section"
import { useRBAC } from "@/hooks/use-rbac"

export default function StudentKanbanPage() {
  const { isAuthorized, isLoading } = useRBAC(["student"])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // The useRBAC hook will handle redirection
  }

  return (
    <KanbanProvider>
      <AnimatedSection>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Kanban Board</h1>
          <div className="flex items-center gap-3">
            <BoardSelector />
            <BoardSettings />
          </div>
        </div>
        <KanbanBoard />
      </AnimatedSection>
    </KanbanProvider>
  )
}


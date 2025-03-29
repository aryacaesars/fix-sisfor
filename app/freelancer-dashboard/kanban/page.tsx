"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { KanbanProvider } from "@/context/kanban-context"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { BoardSelector } from "@/components/kanban/board-selector"
import { useRBAC } from "@/hooks/use-rbac"
import { Home, Briefcase, LayoutGrid, FileText, Settings, User } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"
import { Button } from "@/components/ui/button"
import { BoardSettings } from "@/components/kanban/board-settings"
import { useKanban } from "@/context/kanban-context"

const freelancerNavItems = [
  {
    title: "Home",
    href: "/freelancer-dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Kanban Board",
    href: "/freelancer-dashboard/kanban",
    icon: <LayoutGrid className="h-5 w-5" />,
  },
  {
    title: "Projects",
    href: "/freelancer-dashboard/projects",
    icon: <Briefcase className="h-5 w-5" />,
  },
  {
    title: "Form Templates",
    href: "/freelancer-dashboard/form-templates",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/freelancer-dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    title: "Account",
    href: "/freelancer-dashboard/accounts",
    icon: <User className="h-5 w-5" />,
  },
]

// Wrapper component to access Kanban context
function KanbanBoardWithSettings() {
  const { currentBoard, hasPermission } = useKanban()
  const [showBoardSettings, setShowBoardSettings] = useState(false)

  return (
    <>
      <div className="relative mb-6">
        <h1 className="text-3xl font-bold">Project Board</h1>
        {currentBoard && hasPermission("EDIT_BOARD") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBoardSettings(true)}
            className="absolute right-0 top-0"
          >
            <Settings className="h-4 w-4 mr-2" />
            Board Settings
          </Button>
        )}
      </div>

      <div className="h-[calc(100vh-200px)] overflow-hidden">
        <BoardSelector />
        <KanbanBoard />
      </div>

      {currentBoard && showBoardSettings && (
        <BoardSettings board={currentBoard} onClose={() => setShowBoardSettings(false)} />
      )}
    </>
  )
}

export default function FreelancerKanbanPage() {
  const { isAuthorized, isLoading } = useRBAC(["freelancer"])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // The useRBAC hook will handle redirection
  }

  return (
    <DashboardLayout navItems={freelancerNavItems} role="freelancer">
      <AnimatedSection className="h-full">
        <KanbanProvider>
          <KanbanBoardWithSettings />
        </KanbanProvider>
      </AnimatedSection>
    </DashboardLayout>
  )
}


"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Kanban } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { useRBAC } from "@/hooks/use-rbac"
import { AnimatedSection } from "@/components/animated-section"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useAssignment } from "@/hooks/use-assignment"

interface KanbanBoard {
  id: string
  title: string
  description?: string
  assignmentId: string
  status: string
  createdAt: string
  updatedAt: string
  columns: Array<{
    id: string
    title: string
    tasks: Array<{
      id: string
      title: string
      description?: string
      status: string
      createdAt: string
      updatedAt: string
    }>
  }>
}

export default function CompletedKanbanPage() {
  const { isAuthorized, isLoading: authLoading } = useRBAC(["Student"])
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const { assignments, getAssignmentsWithKanbanBoards } = useAssignment()

  // Get completed assignments with kanban boards
  const completedBoards = getAssignmentsWithKanbanBoards()
    .filter(assignment => assignment.status === "completed")

  useEffect(() => {
    if (isAuthorized) {
      setLoading(false)
    }
  }, [isAuthorized])

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <AnimatedSection>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/student-dashboard/kanban">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Kanban Boards
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold">Completed Kanban Boards</h1>
        <p className="text-muted-foreground mt-2">View your completed kanban boards history</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      ) : completedBoards.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No completed kanban boards found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {completedBoards.map((board) => (
            <Card key={board.id} className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-lg truncate">{board.title}</CardTitle>
                <CardDescription className="font-medium">
                  {board.course}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-3 mb-3">
                  <Badge variant="outline" className="flex items-center gap-1 bg-green-500 bg-opacity-10">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-xs capitalize">Completed</span>
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Completed on: {formatDate(board.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Kanban className="h-4 w-4" />
                  <span>Kanban Board ID: {board.kanbanBoardId}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AnimatedSection>
  )
} 
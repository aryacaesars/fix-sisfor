"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { format } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { useRBAC } from "@/hooks/use-rbac"
import { AnimatedSection } from "@/components/animated-section"

interface Assignment {
  id: string
  title: string
  description?: string
  course?: string
  status: string
  dueDate?: string
  userId: string
  createdAt: string
  updatedAt: string
  kanbanBoardId?: string
}

export default function CompletedAssignmentsPage() {
  const { isAuthorized, isLoading: authLoading } = useRBAC(["Student"])
  const { toast } = useToast()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  // Load completed assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/assignments")
        if (!response.ok) throw new Error("Failed to fetch assignments")
        const data = await response.json() as Assignment[]
        // Filter only completed assignments
        const completedAssignments = data.filter(assignment => assignment.status === "completed")
        setAssignments(completedAssignments)
      } catch (error) {
        console.error("Error fetching assignments:", error)
        toast({
          title: "Error",
          description: "Failed to load completed assignments",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (isAuthorized) {
      fetchAssignments()
    }
  }, [isAuthorized, toast])

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No due date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <AnimatedSection>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Completed Assignments</h1>
        <p className="text-muted-foreground mt-2">View your completed assignments history</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No completed assignments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="transition-all duration-200 hover:shadow-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-lg truncate">{assignment.title}</CardTitle>
                <CardDescription className="font-medium">
                  {assignment.course}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm line-clamp-2 mb-3">{assignment.description || "No description provided"}</p>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="outline" className="flex items-center gap-1 bg-green-500 bg-opacity-10">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-xs capitalize">Completed</span>
                  </Badge>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-medium">Completed on: {formatDate(assignment.updatedAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AnimatedSection>
  )
} 
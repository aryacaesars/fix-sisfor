import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

// Match database schema
interface Assignment {
  id: string
  title: string
  description?: string
  course?: string
  status: string
  dueDate?: string | null
  userId: string
  createdAt: string
  updatedAt: string
  kanbanBoardId?: string | null
}

interface KanbanBoard {
  id: string
  title: string
  description?: string
  createdById: string
  createdAt: string
  updatedAt: string
}

// Combined type for UI display
interface AssignmentWithBoard {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  kanbanBoardId?: string
  board?: KanbanBoard
  status: string
  course?: string
  dueDate?: string
}

export function useAssignment() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [recentAssignments, setRecentAssignments] = useState<Assignment[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem("favoriteAssignments")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }
    
    fetchAssignments()
  }, [])
  
  const fetchAssignments = async () => {
    try {
      setIsLoading(true)
      
      // Check if user is logged in first
      const sessionRes = await fetch("/api/auth/session")
      const session = await sessionRes.json()
      
      if (!session?.user) {
        console.error("User not authenticated")
        toast({
          title: "Authentication required",
          description: "Please log in to view your assignments",
          variant: "destructive"
        })
        return
      }
      
      // Fetch assignments
      const response = await fetch("/api/assignments")
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error("Server response:", errorData)
        throw new Error(`Failed to fetch assignments: ${response.status}${errorData.details ? ` - ${errorData.details}` : ''}`)
      }
      
      const data = await response.json()
      console.log("Fetched assignments:", data)
      setAssignments(data || [])
      
      // Set recent assignments (last 5 updated)
      const recent = Array.isArray(data) ? [...data]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5) : [];
      
      setRecentAssignments(recent)
    } catch (error) {
      console.error("Error fetching assignments:", error)
      toast({
        title: "Error loading assignments",
        description: error instanceof Error ? error.message : "Failed to load your assignments. Please try again.",
        variant: "destructive"
      })
      setAssignments([])
      setRecentAssignments([])
    } finally {
      setIsLoading(false)
    }
  }
  
  const toggleFavorite = (assignmentId: string) => {
    let newFavorites: string[]
    if (favorites.includes(assignmentId)) {
      newFavorites = favorites.filter(id => id !== assignmentId)
    } else {
      newFavorites = [...favorites, assignmentId]
    }
    
    setFavorites(newFavorites)
    localStorage.setItem("favoriteAssignments", JSON.stringify(newFavorites))
  }
  
  const getFavoriteAssignments = () => {
    return assignments.filter(assignment => favorites.includes(assignment.id))
  }
  
  const filterAssignments = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      // If no search term, return assignments with Kanban boards
      return getAssignmentsWithKanbanBoards()
    }
    
    return assignments.filter(assignment => 
      (assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       assignment.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       assignment.status?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      // Only include assignments with Kanban boards
      assignment.kanbanBoardId
    )
  }

  const getAssignmentsWithKanbanBoards = () => {
    return assignments.filter(assignment => assignment.kanbanBoardId)
  }

  // Helper functions
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
    
    return date.toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "in-progress":
        return "bg-green-500 text-white"
      case "completed":
      case "submitted":
        return "bg-blue-500 text-white"
      case "on-hold":
      case "paused":
        return "bg-yellow-500 text-white"
      case "not-started":
        return "bg-gray-400 text-white"
      case "overdue":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return {
    assignments,
    recentAssignments,
    favorites,
    isLoading,
    fetchAssignments,
    toggleFavorite,
    getFavoriteAssignments,
    filterAssignments,
    getAssignmentsWithKanbanBoards,
    getRelativeTime,
    getStatusColor
  }
}
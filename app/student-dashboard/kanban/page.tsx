"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnimatedSection } from "@/components/animated-section"
import { useToast } from "@/components/ui/use-toast"
import { useRBAC } from "@/hooks/use-rbac"
import { useAssignment } from "@/hooks/use-assignment"
import { Search, Calendar, Star, StarOff, Kanban, Clock, ArrowRight, Eye } from "lucide-react"

export default function StudentKanbanPage() {
  const { isAuthorized, isLoading: authLoading, user } = useRBAC(["Student"])
  const { toast } = useToast()
  const router = useRouter()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("all")
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all")
  
  const {
    assignments,
    recentAssignments,
    favorites,
    isLoading,
    toggleFavorite,
    getFavoriteAssignments,
    filterAssignments,
    getAssignmentsWithKanbanBoards,
    getRelativeTime,
    getStatusColor
  } = useAssignment()
  
  const assignmentsWithBoards = getAssignmentsWithKanbanBoards()
  const favoriteAssignments = getFavoriteAssignments().filter(a => a.kanbanBoardId)
  
  // Improved authorization handling
  useEffect(() => {
    // Only redirect if we've finished checking and user is not authorized
    if (!authLoading && !isAuthorized) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only students can access this page."
      })
      // Make sure this path is correct
      router.push("/auth/login")
    }
  }, [authLoading, isAuthorized, router, toast])
  
  // Overall loading state
  const isPageLoading = authLoading || isLoading
  
  // Filter assignments with boards
  const filteredAssignments = assignmentsWithBoards.filter(assignment => {
    const matchesSearchTerm = (
      assignment.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.course?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const matchesSelectedCourse = selectedCourseFilter === "all" || assignment.course === selectedCourseFilter
    const matchesSelectedStatus = selectedStatusFilter === "all" || assignment.status === selectedStatusFilter
    const isNotCompleted = assignment.status !== "completed"

    return matchesSearchTerm && matchesSelectedCourse && matchesSelectedStatus && isNotCompleted
  })
  
  if (isPageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  // Prevent rendering anything if not authorized
  if (!isAuthorized) {
    return null
  }
  
  return (
    <AnimatedSection>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Assignment Kanban Boards</h1>
        <div className="flex gap-2">
          <Link href="/student-dashboard/kanban/completed">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View Completed
            </Button>
          </Link>
          <Link href="/student-dashboard/assignments">
            <Button variant="outline">Back to Assignments</Button>
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/student-dashboard/assignments?openModal=true">
          <Button className="flex gap-2">
            <Kanban className="h-4 w-4 mr-1" />
            Create New Assignment with Board
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Boards</TabsTrigger>
          <TabsTrigger value="recent">Recently Updated</TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites
            {favoriteAssignments.length > 0 && (
              <Badge variant="secondary" className="ml-2">{favoriteAssignments.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <AssignmentCard 
                  key={assignment.id}
                  assignment={assignment}
                  isFavorite={favorites.includes(assignment.id)}
                  onToggleFavorite={toggleFavorite}
                  getRelativeTime={getRelativeTime}
                  getStatusColor={getStatusColor}
                />
              ))
            ) : (
              <div className="col-span-3 text-center p-8">
                <Kanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No assignments with Kanban boards found</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  {searchTerm ? "Try a different search term" : "Create an assignment with a Kanban board to get started"}
                </p>
                <Link href="/student-dashboard/assignments/new">
                  <Button>
                    Create New Assignment
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="recent" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentAssignments.filter(a => a.kanbanBoardId && a.status !== "completed").length > 0 ? (
              recentAssignments
                .filter(a => a.kanbanBoardId && a.status !== "completed")
                .map((assignment) => (
                  <AssignmentCard 
                    key={assignment.id}
                    assignment={assignment}
                    isFavorite={favorites.includes(assignment.id)}
                    onToggleFavorite={toggleFavorite}
                    getRelativeTime={getRelativeTime}
                    getStatusColor={getStatusColor}
                  />
                ))
            ) : (
              <div className="col-span-3 text-center p-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No recent assignments with Kanban boards</h3>
                <p className="text-muted-foreground mt-1">Your recently updated assignments will appear here</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteAssignments.length > 0 ? (
              favoriteAssignments.map((assignment) => (
                <AssignmentCard 
                  key={assignment.id}
                  assignment={assignment}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  getRelativeTime={getRelativeTime}
                  getStatusColor={getStatusColor}
                />
              ))
            ) : (
              <div className="col-span-3 text-center p-8">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No favorite assignments</h3>
                <p className="text-muted-foreground mt-1">Star assignments to add them to your favorites</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Quick access section with updated data structure */}
    </AnimatedSection>
  )
}

interface AssignmentCardProps {
  assignment: any; // Using 'any' temporarily, should be AssignmentWithBoard
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  getRelativeTime: (dateString: string) => string;
  getStatusColor: (status: string) => string;
}

const AssignmentCard = ({ 
  assignment, 
  isFavorite, 
  onToggleFavorite, 
  getRelativeTime,
  getStatusColor
}: AssignmentCardProps) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-md h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg truncate">{assignment.title}</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite(assignment.id)
            }}
            className="h-8 w-8"
          >
            {isFavorite ? (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription className="truncate">
          {assignment.description || "Kanban board for this assignment"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Badge className={`${getStatusColor(assignment.status)}`}>
              {assignment.status}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{getRelativeTime(assignment.updatedAt)}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 mt-1">
            {assignment.course && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Course:</span> {assignment.course}
              </div>
            )}
            {assignment.dueDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        {assignment.kanbanBoardId ? (
          <Link href={`/student-dashboard/kanban/${assignment.kanbanBoardId}`} className="w-full">
            <Button variant="default" size="sm" className="w-full">
              View Kanban Board
            </Button>
          </Link>
        ) : (
          <Link href={`/student-dashboard/assignments/${assignment.id}/create-board`} className="w-full">
            <Button variant="outline" size="sm" className="w-full">
              Create Kanban Board
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
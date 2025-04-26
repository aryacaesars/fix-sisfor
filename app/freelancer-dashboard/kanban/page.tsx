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
import { Search, Calendar, Star, StarOff, Kanban, Clock, ArrowRight } from "lucide-react"

interface ProjectBoard {
  id: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
  project: {
    id: string
    title: string
    status: string
    clientName?: string
    endDate?: string
  }
}

export default function KanbanDashboardPage() {
  const { isAuthorized, isLoading } = useRBAC(["freelancer"])
  const { toast } = useToast()
  const router = useRouter()
  
  const [projectBoards, setProjectBoards] = useState<ProjectBoard[]>([])
  const [recentBoards, setRecentBoards] = useState<ProjectBoard[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    // Load favorites from localStorage
    const storedFavorites = localStorage.getItem("favoriteKanbanBoards")
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    }
    
    fetchProjectBoards()
  }, [])
  
  const fetchProjectBoards = async () => {
    try {
      const response = await fetch("/api/kanban/boards")
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server response:", errorText);
        throw new Error(`Failed to fetch Kanban boards: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("Fetched boards:", data);
      setProjectBoards(data || [])
      
      // Set recent boards (last 5 accessed)
      const recent = Array.isArray(data) ? [...data].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ).slice(0, 5) : [];
      
      setRecentBoards(recent)
      setIsLoaded(true)
    } catch (error) {
      console.error("Error fetching boards:", error)
      toast({
        title: "Error loading boards",
        description: "Failed to load your Kanban boards. Please try again.",
        variant: "destructive"
      })
      setIsLoaded(true)
      setProjectBoards([])
      setRecentBoards([])
    }
  }
  
  const toggleFavorite = (boardId: string) => {
    let newFavorites: string[]
    if (favorites.includes(boardId)) {
      newFavorites = favorites.filter(id => id !== boardId)
    } else {
      newFavorites = [...favorites, boardId]
    }
    
    setFavorites(newFavorites)
    localStorage.setItem("favoriteKanbanBoards", JSON.stringify(newFavorites))
  }
  
  const filteredBoards = projectBoards.filter(board => 
    board.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    board.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    board.project?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    board.project?.clientName?.toLowerCase().includes(searchTerm.toLowerCase())
  )
  
  const favoriteBoards = projectBoards.filter(board => favorites.includes(board.id))
  
  // Function to get relative time (e.g., "2 days ago")
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
        return "bg-yellow-500 text-white"
      case "completed":
        return "bg-green-500 text-white"
      case "on-hold":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }
  
  if (isLoading || !isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your Kanban boards...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null // The useRBAC hook will handle redirection
  }
  
  return (
    <AnimatedSection>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Kanban Boards</h1>
        <Link href="/freelancer-dashboard/projects">
          <Button variant="outline">Back to Projects</Button>
        </Link>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search project boards..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link href="/freelancer-dashboard/projects">
          <Button className="flex gap-2">
            <Kanban className="h-4 w-4 mr-1" />
            Create New Project with Board
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Boards</TabsTrigger>
          <TabsTrigger value="recent">Recently Updated</TabsTrigger>
          <TabsTrigger value="favorites">
            Favorites
            {favoriteBoards.length > 0 && (
              <Badge variant="secondary" className="ml-2">{favoriteBoards.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBoards.length > 0 ? (
              filteredBoards.map((board) => (
                <ProjectBoardCard 
                  key={board.id}
                  board={board}
                  isFavorite={favorites.includes(board.id)}
                  onToggleFavorite={toggleFavorite}
                  getRelativeTime={getRelativeTime}
                  getStatusColor={getStatusColor}
                />
              ))
            ) : (
              <div className="col-span-3 text-center p-8">
                <Kanban className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No project boards found</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  {searchTerm ? "Try a different search term" : "Create a project with a Kanban board to get started"}
                </p>
                <Link href="/freelancer-dashboard/projects">
                  <Button>
                    Create New Project
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="recent" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBoards.length > 0 ? (
              recentBoards.map((board) => (
                <ProjectBoardCard 
                  key={board.id}
                  board={board}
                  isFavorite={favorites.includes(board.id)}
                  onToggleFavorite={toggleFavorite}
                  getRelativeTime={getRelativeTime}
                  getStatusColor={getStatusColor}
                />
              ))
            ) : (
              <div className="col-span-3 text-center p-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No recent boards</h3>
                <p className="text-muted-foreground mt-1">Use project boards to track progress and they'll appear here</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="favorites" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteBoards.length > 0 ? (
              favoriteBoards.map((board) => (
                <ProjectBoardCard 
                  key={board.id}
                  board={board}
                  isFavorite={true}
                  onToggleFavorite={toggleFavorite}
                  getRelativeTime={getRelativeTime}
                  getStatusColor={getStatusColor}
                />
              ))
            ) : (
              <div className="col-span-3 text-center p-8">
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No favorite boards</h3>
                <p className="text-muted-foreground mt-1">Star boards to add them to your favorites</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {projectBoards.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {projectBoards.slice(0, 8).map((board) => (
              <Link 
                key={board.id} 
                href={`/freelancer-dashboard/kanban/${board.id}`}
                className="group"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary group-hover:border-primary">
                  <CardContent className="p-4 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                      <Kanban className="h-4 w-4 text-primary" />
                      <Badge className={`text-xs ${getStatusColor(board.project.status)}`}>
                        {board.project.status || "Active"}
                      </Badge>
                    </div>
                    <h3 className="font-medium truncate">{board.project.title}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-1 mb-auto">
                      {board.project.clientName || 'No client'}
                    </p>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="text-muted-foreground">{getRelativeTime(board.updatedAt)}</span>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </AnimatedSection>
  )
}

interface ProjectBoardCardProps {
  board: ProjectBoard
  isFavorite: boolean
  onToggleFavorite: (boardId: string) => void
  getRelativeTime: (dateString: string) => string
  getStatusColor: (status: string) => string
}

const ProjectBoardCard = ({ 
  board, 
  isFavorite, 
  onToggleFavorite, 
  getRelativeTime,
  getStatusColor
}: ProjectBoardCardProps) => {
  return (
    <Card className="transition-all duration-300 hover:shadow-md h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg truncate">{board.project.title}</CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.preventDefault()
              onToggleFavorite(board.id)
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
          {board.description || "Kanban board for this project"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <Badge className={`${getStatusColor(board.project.status)}`}>
              {board.project.status}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{getRelativeTime(board.updatedAt)}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1 mt-1">
            {board.project.clientName && (
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Client:</span> {board.project.clientName}
              </div>
            )}
            {board.project.endDate && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Due: {new Date(board.project.endDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/freelancer-dashboard/kanban/${board.id}`} className="w-full">
          <Button variant="default" size="sm" className="w-full">
            View Kanban Board
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
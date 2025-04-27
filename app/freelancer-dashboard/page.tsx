"use client"

import { useState, useEffect } from "react"
import { Home, Briefcase, LayoutGrid, FileText, Settings, User, Calculator, ExternalLink, Calendar as CalendarIcon, ArrowLeft, ArrowRight, Search, Star, StarOff, Kanban, Clock, Calendar, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import { useRBAC } from "@/hooks/use-rbac"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RoleBasedCalendar } from "@/components/role-based-calendar"
import { useToast } from "@/components/ui/use-toast"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { showSuccessNotification, showErrorNotification } from "@/components/ui/notification"

interface Project {
  id: string
  title: string
  clientName: string
  startDate: string
  endDate: string
  budget: number
  status: string
  description: string
  assignedTo: string
  kanbanBoardId?: string
}

export default function FreelancerDashboard() {
  const { isAuthorized, isLoading, user } = useRBAC(["freelancer"])
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [kanbanBoards, setKanbanBoards] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.push("/unauthorized")
      return
    }
  }, [isLoading, isAuthorized, router])

  useEffect(() => {
    if (user?.id) {
      const fetchData = async () => {
        setIsDataLoading(true)
        try {
          const [projectsData, kanbanBoardsData, templatesData] = await Promise.all([
            fetch("/api/projects").then(res => res.ok ? res.json() : []),
            fetch("/api/kanban/boards").then(res => res.ok ? res.json() : []),
            fetch("/api/templates").then(res => res.ok ? res.json() : [])
          ])

          setProjects(Array.isArray(projectsData) ? projectsData : [])
          setKanbanBoards(Array.isArray(kanbanBoardsData) ? kanbanBoardsData : [])
          setTemplates(Array.isArray(templatesData) ? templatesData : [])
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
          toast({
            title: "Error loading data",
            description: "Failed to load dashboard data. Please try again.",
            variant: "destructive"
          })
        } finally {
          setIsDataLoading(false)
        }
      }

      fetchData()
    }
  }, [user, toast])

  useEffect(() => {
    if (!isDataLoading && projects.length > 0 && user?.id) {
      const today = new Date("2025-04-19"); // gunakan tanggal context
      projects.forEach((project: Project) => {
        if (!project.endDate) return;
        const endDate = new Date(project.endDate);
        const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          const notifKey = `notif-project-h1-${user.id}-${project.id}`;
          if (!localStorage.getItem(notifKey)) {
            toast({
              title: `Deadline besok: ${project.title}`,
              description: `Project untuk klien ${project.clientName || ''} akan deadline besok (${endDate.toLocaleDateString('id-ID')})`,
              variant: "default"
            });
            localStorage.setItem(notifKey, "1");
          }
        }
      });
    }
  }, [isDataLoading, projects, user, toast]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return "Rp 0"
    }
    
    try {
      return new Intl.NumberFormat("id-ID", { 
        style: "currency", 
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount)
    } catch (error) {
      return "Rp 0"
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-yellow-500"
      case "completed":
        return "bg-green-500"
      case "on-hold":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  };

  const handleViewDetails = (project: Project) => {
    setSelectedProject(project)
    setIsDetailsModalOpen(true)
  }

  // Filter and sort projects for cards
  const activeProjects = projects.filter(p => p.status === 'active');
  const upcomingDeadlines = projects
    .filter(p => p.endDate && new Date(p.endDate) >= new Date())
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

  // Function to open template link safely
  const openTemplateLink = (link: string | null | undefined) => {
    if (!link) return;
    try {
      // Ensure it's an absolute URL, add https:// if it looks like a domain without protocol
      let url = link;
      if (!url.startsWith('http://') && !url.startsWith('https://') && url.includes('.')) {
        url = `https://${url}`;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error("Failed to open link:", e);
      // Optionally show an error message to the user
    }
  }

  return (
    <AnimatedSection>
      <h1 className="text-3xl font-bold mb-6">Freelancer Dashboard</h1>

      {/* First grid of cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Active Projects Card */}
        <Card className="transition-all duration-300 hover:shadow-md flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Kanban Boards</CardTitle>
            <CardDescription>Your active project boards</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isDataLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading boards...</p>
              </div>
            ) : activeProjects.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {activeProjects.slice(0, 3).map((project) => (
                  <li key={project.id} className="p-2 rounded hover:bg-accent transition-colors">
                    <div className="flex justify-between items-center w-full">
                      <span className="truncate font-medium">{project.title}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => {
                          if (project.kanbanBoardId) {
                            window.location.href = `/freelancer-dashboard/kanban/${project.kanbanBoardId}`;
                          } else {
                            showErrorNotification(
                              "No Kanban Board",
                              "This project doesn't have a Kanban board associated with it."
                            )
                          }
                        }}
                      >
                        <Kanban className="h-4 w-4 mr-1" />
                        View Board
                      </Button>
                    </div>
                  </li>
                ))}
                {activeProjects.length > 3 && <li className="text-xs text-muted-foreground px-2 pt-1">...and {activeProjects.length - 3} more</li>}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-sm text-muted-foreground">No active projects found.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/freelancer-dashboard/kanban" className="w-full">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <span>View All Kanban Boards</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Recent Templates Card */}
        <Card className="transition-all duration-300 hover:shadow-md flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Recent Templates</CardTitle>
            <CardDescription>Your recently used templates</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isDataLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading templates...</p>
              </div>
            ) : templates.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {templates.slice(0, 3).map((template) => (
                  <li key={template.id} className="p-2 rounded hover:bg-accent transition-colors">
                    <div className="flex justify-between items-center w-full cursor-pointer" onClick={() => openTemplateLink(template.link)}>
                      <span className="truncate font-medium">{template.title}</span>
                      <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">
                        Last used {formatDate(template.lastUsed)}
                      </span>
                    </div>
                  </li>
                ))}
                {templates.length > 3 && <li className="text-xs text-muted-foreground px-2 pt-1">...and {templates.length - 3} more</li>}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-sm text-muted-foreground">No templates found.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/freelancer-dashboard/templates" className="w-full">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <span>View All Templates</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Upcoming Deadlines Card */}
        <Card className="transition-all duration-300 hover:shadow-md flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>Your nearest project milestones</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isDataLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading deadlines...</p>
              </div>
            ) : projects.length > 0 && projects.every(p => p.status === 'completed') ? (
              <div className="flex flex-col items-center justify-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-muted-foreground">All projects completed!</p>
              </div>
            ) : upcomingDeadlines.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {upcomingDeadlines.slice(0, 3).map((project) => (
                  <li
                    key={project.id}
                    className="flex justify-between items-center p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleViewDetails(project)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                      <span className="truncate font-medium">{project.title}</span>
                    </div>
                    <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">
                      {formatDate(project.endDate)}
                    </span>
                  </li>
                ))}
                {upcomingDeadlines.length > 3 && <li className="text-xs text-muted-foreground px-2 pt-1">...and {upcomingDeadlines.length - 3} more</li>}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/freelancer-dashboard/projects" className="w-full">
              <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                <span>View All Deadlines</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Project Summary and Recent Templates cards */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
         {/* Project Summary Card */}
         <Card className="transition-all duration-300 hover:shadow-md flex flex-col">
           <CardHeader className="pb-2">
             <CardTitle>Project Summary</CardTitle>
             <CardDescription>Overview of your project status</CardDescription>
           </CardHeader>
           <CardContent className="flex-grow p-4">
              {isDataLoading ? (
                <div className="flex items-center justify-center flex-grow">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : projects.length > 0 ? (
                <div className="flex flex-col justify-center h-full">
                  <div className="relative" style={{ height: "220px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#16a34a' },
                            { name: 'Active', value: projects.filter(p => p.status === 'active').length, color: '#eab308' },
                            { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, color: '#ef4444' }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[
                            { name: 'Completed', color: '#16a34a' },
                            { name: 'Active', color: '#eab308' },
                            { name: 'On Hold', color: '#ef4444' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center w-28">
                      <p className="text-[10px] text-muted-foreground mb-0.5">Total Earnings</p>
                      <p className="font-semibold text-green-600 text-xs">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(
                          projects
                            .filter(p => p.status === 'completed')
                            .reduce((total, project) => total + (project.budget || 0), 0)
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="border-t pt-3 mt-auto">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Average per Project:</span> 
                      <span className="font-medium">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          minimumFractionDigits: 0
                        }).format(
                          projects.filter(p => p.status === 'completed').length > 0
                            ? projects
                                .filter(p => p.status === 'completed')
                                .reduce((total, project) => total + (project.budget || 0), 0) /
                                projects.filter(p => p.status === 'completed').length
                            : 0
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center flex-grow">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-sm text-muted-foreground">No project data available.</p>
                </div>
              )}
           </CardContent>
         </Card>

         {/* Project Status Card */}
         <Card className="transition-all duration-300 hover:shadow-md flex flex-col">
           <CardHeader>
             <CardTitle>Project Status</CardTitle>
             <CardDescription>Overview of your project progress</CardDescription>
           </CardHeader>
           <CardContent className="flex-grow">
              {isDataLoading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                  <p className="text-sm text-muted-foreground">Loading status...</p>
                </div>
              ) : projects.length > 0 ? (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-foreground font-medium flex items-center">
                        <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                        Completed
                      </span>
                      <span className="text-foreground font-medium">
                        {projects.filter(p => p.status === 'completed').length}/{projects.length}
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600 rounded-full transition-all duration-500" 
                        style={{ 
                          width: projects.length ? 
                            `${(projects.filter(p => p.status === 'completed').length / projects.length) * 100}%` : 
                            "0%" 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-foreground font-medium flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        Active
                      </span>
                      <span className="text-foreground font-medium">
                        {projects.filter(p => p.status === 'active').length}/{projects.length}
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full transition-all duration-500" 
                        style={{ 
                          width: projects.length ? 
                            `${(projects.filter(p => p.status === 'active').length / projects.length) * 100}%` : 
                            "0%" 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-foreground font-medium flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        On Hold
                      </span>
                      <span className="text-foreground font-medium">
                        {projects.filter(p => p.status === 'on-hold').length}/{projects.length}
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full transition-all duration-500" 
                        style={{ 
                          width: projects.length ? 
                            `${(projects.filter(p => p.status === 'on-hold').length / projects.length) * 100}%` : 
                            "0%" 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-sm text-muted-foreground">No project data available.</p>
                </div>
              )}
           </CardContent>
           <CardFooter>
             <Link href="/freelancer-dashboard/projects" className="w-full">
               <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                 <span>View All Projects</span>
                 <ArrowRight className="h-4 w-4" />
               </Button>
             </Link>
           </CardFooter>
         </Card>
      </div>

      {/* Calendar Card */}
      <div className="mt-8">
      <Card className="transition-all duration-300 hover:shadow-md">
  <CardHeader>
    <CardTitle className="flex items-center">
      <CalendarIcon className="h-5 w-5 mr-2" />
      Project Deadlines Calendar
    </CardTitle>
    <CardDescription>View and manage your project deadlines</CardDescription>
  </CardHeader>
  <CardContent>
    <RoleBasedCalendar 
      items={projects}
      isLoading={isDataLoading}
    />
  </CardContent>
</Card>
      </div>
       {/* Dialog for Upcoming Deadlines Card */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="w-full max-w-screen-lg">
          {selectedProject && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-2xl">{selectedProject.title}</DialogTitle>
                  <div className={`px-3 py-1 rounded-full text-sm text-white ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status}
                  </div>
                </div>
                <p className="text-md text-muted-foreground">Client: {selectedProject.clientName}</p>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-md">{selectedProject.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Timeline</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p>{formatDate(selectedProject.startDate)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Deadline</p>
                          <p>{formatDate(selectedProject.endDate)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Details</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-medium">Rp</span>
                        <div>
                          <p className="text-sm text-muted-foreground">Budget</p>
                          <p>{formatCurrency(selectedProject.budget)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Assigned To</p>
                          <p>{selectedProject.assignedTo}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex flex-wrap gap-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    if (selectedProject.kanbanBoardId) {
                      window.location.href = `/freelancer-dashboard/kanban/${selectedProject.kanbanBoardId}`;
                    } else {
                      showErrorNotification(
                        "No Kanban Board",
                        "This project doesn't have a Kanban board associated with it."
                      )
                    }
                  }}
                >
                  View Kanban Board
                </Button>
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

    </AnimatedSection>
  )
}


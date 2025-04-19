"use client"

import { useState, useEffect } from "react"
import { Home, Briefcase, LayoutGrid, FileText, Settings, User, Calculator, ExternalLink, Calendar as CalendarIcon, ArrowLeft, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import { useRBAC } from "@/hooks/use-rbac"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RoleBasedCalendar } from "@/components/role-based-calendar"
import { useToast } from "@/hooks/use-toast"

export default function FreelancerDashboard() {
  const { isAuthorized, isLoading, user } = useRBAC(["freelancer"])
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([]) // Add type annotation
  const [kanbanBoards, setKanbanBoards] = useState<any[]>([]) // Add type annotation
  const [templates, setTemplates] = useState<any[]>([]) // Add type annotation
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [selectedProjectForDialog, setSelectedProjectForDialog] = useState<any>(null); // State for Upcoming Deadlines dialog
  const { toast } = useToast();

  useEffect(() => {
    // Check authorization as before
    if (!isLoading && !isAuthorized && localStorage.getItem("auth-status") === "authenticated") {
      router.push("/unauthorized")
    }
  }, [isLoading, isAuthorized, router])

  // Fetch data when component mounts and user is available
  useEffect(() => {
    if (user?.id) {
      const fetchData = async () => {
        setIsDataLoading(true)
        try {
          // Fetch all the required data in parallel
          const [projectsData, kanbanBoardsData, templatesData] = await Promise.all([
            fetch("/api/projects").then(res => res.ok ? res.json() : []), // Handle potential errors
            fetch("/api/kanban/boards").then(res => res.ok ? res.json() : []),
            fetch("/api/templates").then(res => res.ok ? res.json() : [])
          ])

          setProjects(Array.isArray(projectsData) ? projectsData : [])
          setKanbanBoards(Array.isArray(kanbanBoardsData) ? kanbanBoardsData : [])
          setTemplates(Array.isArray(templatesData) ? templatesData : [])
        } catch (error) {
          console.error("Error fetching dashboard data:", error)
          // Set empty arrays on error to prevent crashes
          setProjects([])
          setKanbanBoards([])
          setTemplates([])
        } finally {
          setIsDataLoading(false)
        }
      }

      fetchData()
    }
  }, [user]) // Dependency array includes user

  useEffect(() => {
    if (!isDataLoading && projects.length > 0 && user?.id) {
      const today = new Date("2025-04-19"); // gunakan tanggal context
      projects.forEach((project: any) => {
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

  // Loading and Unauthorized states remain the same

  // Helper function to format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Invalid Date';
    }
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
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>Your current client projects</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {isDataLoading ? (
              <p className="text-sm text-muted-foreground">Loading projects...</p>
            ) : activeProjects.length > 0 ? (
              <ul className="space-y-1 text-sm">
                {activeProjects.slice(0, 3).map((project) => (
                  <li key={project.id} className="p-2 rounded hover:bg-accent transition-colors">
                    <Link href={`/freelancer-dashboard/projects/${project.id}`} className="flex justify-between items-center w-full">
                      <span className="truncate font-medium">{project.title}</span>
                      <span className="text-muted-foreground text-xs capitalize flex-shrink-0 ml-2">
                        Due {formatDate(project.endDate)}
                      </span>
                    </Link>
                  </li>
                ))}
                {activeProjects.length > 3 && <li className="text-xs text-muted-foreground px-2 pt-1">...and {activeProjects.length - 3} more</li>}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No active projects found.</p>
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

        {/* Kanban Boards Card */}
         <Card className="transition-all duration-300 hover:shadow-md flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle>Kanban Boards</CardTitle>
            <CardDescription>Your project management boards</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
             {isDataLoading ? (
               <p className="text-sm text-muted-foreground">Loading boards...</p>
             ) : kanbanBoards.length > 0 ? (
               <ul className="space-y-1 text-sm">
                 {kanbanBoards.slice(0, 3).map((board) => (
                   <li key={board.id} className="p-2 rounded hover:bg-accent transition-colors">
                     <Link href={`/freelancer-dashboard/kanban/${board.id}`} className="flex justify-between items-center w-full">
                       <span className="truncate font-medium">{board.title}</span>
                       <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">
                         Updated {formatDate(board.updatedAt)}
                       </span>
                     </Link>
                   </li>
                 ))}
                 {kanbanBoards.length > 3 && <li className="text-xs text-muted-foreground px-2 pt-1">...and {kanbanBoards.length - 3} more</li>}
               </ul>
             ) : (
               <p className="text-sm text-muted-foreground text-center py-4">No Kanban boards found.</p>
             )}
          </CardContent>
           <CardFooter>
             <Link href="/freelancer-dashboard/kanban" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <span>View All Boards</span>
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
               <p className="text-sm text-muted-foreground">Loading deadlines...</p>
             ) : upcomingDeadlines.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {upcomingDeadlines
                    .slice(0, 3)
                    .map((project) => (
                      <li
                        key={project.id}
                        className="flex justify-between items-center p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => setSelectedProjectForDialog(project)} // Open dialog on click
                      >
                        <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${
                            project.status === 'completed' ? 'bg-green-600' :
                            project.status === 'active' ? 'bg-primary' :
                            'bg-yellow-500'
                          }`}></div>
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
               <p className="text-sm text-muted-foreground text-center py-4">No upcoming deadlines.</p>
             )}
          </CardContent>
           <CardFooter>
             {/* Optionally add a link or button here, e.g., to view all deadlines */}
             <Button variant="outline" className="w-full" disabled>View All Deadlines (Soon)</Button>
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

      {/* Project Summary and Recent Templates cards */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
         {/* Project Summary Card */}
         <Card className="transition-all duration-300 hover:shadow-md flex flex-col">
           <CardHeader>
             <CardTitle>Project Summary</CardTitle>
             <CardDescription>Overview of your projects</CardDescription>
           </CardHeader>
           <CardContent className="flex-grow">
              {isDataLoading ? (
                <p className="text-sm text-muted-foreground">Loading summary...</p>
              ) : projects.length > 0 ? (
                <div className="text-sm space-y-2">
                   <div className="flex justify-between"><span>Total Projects:</span> <span className="font-medium">{projects.length}</span></div>
                   <div className="flex justify-between"><span>Active:</span> <span className="font-medium text-primary">{activeProjects.length}</span></div>
                   <div className="flex justify-between"><span>Completed:</span> <span className="font-medium text-green-600">{projects.filter(p => p.status === 'completed').length}</span></div>
                   <div className="flex justify-between"><span>On Hold:</span> <span className="font-medium text-yellow-600">{projects.filter(p => p.status === 'on-hold').length}</span></div>
                </div>
              ) : (
                 <p className="text-sm text-muted-foreground text-center py-4">No project data available.</p>
              )}
           </CardContent>
           {/* Optional Footer */}
         </Card>

         {/* Recent Templates Card */}
         <Card className="transition-all duration-300 hover:shadow-md flex flex-col">
           <CardHeader>
             <CardTitle>Recent Templates</CardTitle>
             <CardDescription>Your most recent form templates</CardDescription>
           </CardHeader>
           <CardContent className="flex-grow">
              {isDataLoading ? (
                <p className="text-sm text-muted-foreground">Loading templates...</p>
              ) : templates.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {templates.slice(0, 3).map((template) => (
                     <li
                       key={template.id}
                       className="flex items-center justify-between p-2 rounded hover:bg-accent cursor-pointer transition-colors"
                       onClick={() => openTemplateLink(template.link)} // Use safe link opener
                     >
                       <div className="flex items-center gap-2">
                         <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                         <span className="truncate font-medium">{template.title}</span>
                       </div>
                       <span className="text-muted-foreground text-xs flex-shrink-0 ml-2">{template.category}</span>
                     </li>
                  ))}
                  {templates.length > 3 && <li className="text-xs text-muted-foreground px-2 pt-1">...and {templates.length - 3} more</li>}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent templates found.</p>
              )}
           </CardContent>
            <CardFooter>
             <Link href="/freelancer-dashboard/form-templates" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <span>View All Templates</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
          </CardFooter>
         </Card>
      </div>

       {/* Dialog for Upcoming Deadlines Card */}
      <Dialog open={selectedProjectForDialog !== null} onOpenChange={(open) => !open && setSelectedProjectForDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Project Deadline</DialogTitle>
            <DialogDescription>
              Project details and deadline information.
            </DialogDescription>
          </DialogHeader>
          {selectedProjectForDialog && (
             <div className="mt-4 space-y-4">
              <div>
                <h3 className="text-lg font-bold">{selectedProjectForDialog.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedProjectForDialog.clientName || 'Client Project'}</p>
              </div>
              {/* ... (rest of the dialog content is the same as in DeadlineCalendar) ... */}
               <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="font-medium">Deadline</p>
                  <p>
                    {new Date(selectedProjectForDialog.endDate).toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      selectedProjectForDialog.status === 'completed' ? 'bg-green-600' :
                      selectedProjectForDialog.status === 'active' ? 'bg-primary' :
                      'bg-yellow-500'
                    }`}></div>
                    <p className="capitalize">{selectedProjectForDialog.status?.replace('-', ' ') || 'Unknown'}</p>
                  </div>
                </div>
              </div>
              {selectedProjectForDialog.description && (
                <div>
                  <p className="font-medium">Description</p>
                  <p className="text-sm">{selectedProjectForDialog.description}</p>
                </div>
              )}
              <div className="flex justify-end mt-4">
                <Button
                  variant="outline" className="mr-2"
                  onClick={() => {
                    router.push(`/freelancer-dashboard/projects/${selectedProjectForDialog.id}`);
                    setSelectedProjectForDialog(null);
                  }}
                >
                  View Project Details
                </Button>
                <DialogClose asChild>
                  <Button onClick={() => setSelectedProjectForDialog(null)}>Close</Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </AnimatedSection>
  )
}


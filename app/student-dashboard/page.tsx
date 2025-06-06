"use client"

import { 
  Home, BookOpen, LayoutGrid, FileText, Settings, User, 
  Calendar, ArrowRight, ArrowLeft, ExternalLink, X, Info, AlertCircle, FileCode, Calculator,
  CheckCircle2, XCircle
} from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import { useRBAC } from "@/hooks/use-rbac"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
// Removed unused import
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { RoleBasedCalendar } from "@/components/role-based-calendar"
import { useToast } from "@/hooks/use-toast"
import { 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Create a client-side only pie chart component
const AssignmentPieChart = dynamic(
  () => import('@/components/assignment-pie-chart'),
  { ssr: false }
)

// Type definitions
interface Assignment {
  id: string;
  title: string;
  description?: string;
  course?: string;
  status: 'completed' | 'in-progress' | 'not-started';
  dueDate?: string;
  kanbanBoardId?: string;
}

interface Course {
  id: string;
  name: string;
  description?: string;
  schedule: Array<{
    day: string;
    startTime: string;
    endTime: string;
  }>;
  room: string;
}

interface Template {
  id: string;
  title: string;
  description?: string;
  category: string;
  link?: string;
}

interface KanbanData {
  boards?: {
    id: string;
    title: string;
    columns?: KanbanColumn[];
  }[];
}

interface KanbanColumn {
  id: string;
  title: string;
  tasks: {
    id: string;
    title: string;
    dueDate?: string;
  }[];
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

// Fetch assignment data
async function getAssignments(userId: string): Promise<Assignment[]> {
  try {
    const response = await fetch(`/api/assignments/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch assignments');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
}

// Fetch kanban boards and tasks
async function getKanbanData(userId: string): Promise<KanbanData> {
  try {
    const response = await fetch(`/api/kanban/boards/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch kanban data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching kanban data:', error);
    return { boards: [] };
  }
}

// Add this function to fetch courses
async function getCourses(userId: string): Promise<Course[]> {
  try {
    const response = await fetch('/api/courses');
    if (!response.ok) throw new Error('Failed to fetch courses');
    return await response.json();
  } catch (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
}

// Simple Kanban Board Component
const KanbanBoard = ({ columns = [] }: { columns: KanbanColumn[] }) => {
  if (columns.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No kanban data available</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((column) => (
        <div key={column.id} className="bg-muted rounded-lg p-4">
          <h3 className="font-medium mb-4">{column.title}</h3>
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <div key={task.id} className="bg-background p-3 rounded-md shadow-sm">
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {task.dueDate ? formatDate(task.dueDate) : 'No deadline'}
                </p>
              </div>
            ))}
            {column.tasks.length === 0 && (
              <div className="text-center py-4 text-xs text-muted-foreground">No tasks in this column</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function StudentDashboard() {
  const { isAuthorized, isLoading, user } = useRBAC(["student"])
  const { toast } = useToast();
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [kanbanData, setKanbanData] = useState<{
    boardId?: string;
    boardTitle?: string;
    columns: KanbanColumn[];
  }>({ columns: [] })
  const [isDataLoading, setIsDataLoading] = useState(true)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [courses, setCourses] = useState<Course[]>([])

  // Fetch data when the component mounts and user is available
  useEffect(() => {
    if (user?.id) {
      const fetchData = async () => {
        setIsDataLoading(true);
        const [assignmentsData, kanbanBoardsData, templatesData, coursesData] = await Promise.all([
          getAssignments(user.id),
          getKanbanData(user.id),
          getTemplates(),
          getCourses(user.id)
        ]);
        
        setAssignments(assignmentsData as Assignment[]);
        setTemplates(templatesData as Template[]);
        setCourses(coursesData as Course[]);
        
        // Process kanban data for the first board if available
        if (kanbanBoardsData.boards && kanbanBoardsData.boards.length > 0) {
          const firstBoard = kanbanBoardsData.boards[0];
          setKanbanData({ 
            boardId: firstBoard.id,
            boardTitle: firstBoard.title,
            columns: firstBoard.columns || []
          });
        }
        
        setIsDataLoading(false);
      };
      
      fetchData();
    }
  }, [user]);

  // Add this function to fetch templates
  async function getTemplates(): Promise<Template[]> {
    try {
      const response = await fetch('/api/templates');
      if (!response.ok) throw new Error('Failed to fetch templates');
      return await response.json();
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  // Format assignment stats for pie chart
  const getAssignmentStats = (): ChartData[] => {
    if (!assignments.length) return [];
    
    const completed = assignments.filter(a => a.status === 'completed').length;
    const inProgress = assignments.filter(a => a.status === 'in-progress').length;
    const notStarted = assignments.filter(a => a.status === 'not-started').length;
    
    const stats = [
      { name: "Completed", value: completed, color: "#16a34a" },
      { name: "In Progress", value: inProgress, color: "#eab308" },
      { name: "Not Started", value: notStarted, color: "#ef4444" },
    ];

    console.log('Assignment Stats:', stats);
    return stats;
  };

  // Get upcoming assignments (sorted by due date)
  const getUpcomingAssignments = () => {
    if (!assignments.length) return [];
    
    const now = new Date();
    return assignments
      .filter(a => a.dueDate && a.status !== 'completed')
      .sort((a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dateA - dateB;
      })
      .slice(0, 3);
  };

  useEffect(() => {
    if (!isDataLoading && assignments.length > 0 && user?.id) {
      const today = new Date("2025-04-19"); // gunakan tanggal context
      assignments.forEach((assignment: any) => {
        if (!assignment.dueDate) return;
        const dueDate = new Date(assignment.dueDate);
        const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diff === 1) {
          const notifKey = `notif-assignment-h1-${user.id}-${assignment.id}`;
          if (!localStorage.getItem(notifKey)) {
            toast({
              title: `Deadline besok: ${assignment.title}`,
              description: `Assignment untuk ${assignment.course || 'mata kuliah'} akan deadline besok (${dueDate.toLocaleDateString('id-ID')})`,
              variant: "default"
            });
            localStorage.setItem(notifKey, "1");
          }
        }
      });
    }
  }, [isDataLoading, assignments, user, toast]);

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

  const assignmentStats = getAssignmentStats();
  const upcomingAssignments = getUpcomingAssignments();

  return (
      <AnimatedSection>
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="transition-all duration-300 hover:shadow-md flex flex-col">
            <CardHeader className="pb-2">
              <div>
                <CardTitle>Upcoming Classes</CardTitle>
                <CardDescription>Your classes for today</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {isDataLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : courses.length > 0 ? (
                <ul className="space-y-2">
                  {courses
                    .filter(course => {
                      const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
                      return course.schedule.some(sched => sched.day.toLowerCase() === today)
                    })
                    .map(course => (
                      <li key={course.id} className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{course.name}</span>
                          <p className="text-sm text-muted-foreground">{course.room}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {course.schedule
                            .filter(sched => sched.day.toLowerCase() === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase())
                            .map(sched => `${sched.startTime}-${sched.endTime}`)
                            .join(', ')}
                        </span>
                      </li>
                    ))}
                  {courses.filter(course => {
                    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
                    return course.schedule.some(sched => sched.day.toLowerCase() === today)
                  }).length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[180px] text-muted-foreground">
                      <XCircle className="h-10 w-10 text-red-500 mb-3" />
                      <p>No classes scheduled for today</p>
                    </div>
                  )}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[180px] text-muted-foreground">
                  <XCircle className="h-10 w-10 text-red-500 mb-3" />
                  <p>No courses available</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-background p-3">
              <Link href="/student-dashboard/courses" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>View All Classes</span>
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Your assignments due soon</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {isDataLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : upcomingAssignments.length > 0 ? (
                <ul className="space-y-2">
                  {upcomingAssignments.map(assignment => (
                    <li 
                      key={assignment.id} 
                      className="flex justify-between items-center p-2 rounded hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedAssignment(assignment)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          assignment.status === 'completed' ? 'bg-green-600' :
                          assignment.status === 'in-progress' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}></div>
                        <span className="font-medium">{assignment.title}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {assignment.dueDate ? formatDate(assignment.dueDate) : 'No due date'}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : assignments.length > 0 && assignments.every(a => a.status === 'completed') ? (
                <div className="flex flex-col items-center justify-center min-h-[180px] text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
                  <p>All assignments complete</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[180px] text-muted-foreground">
                  <XCircle className="h-10 w-10 text-red-500 mb-3" />
                  <p>No upcoming assignments</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-background p-3">
              <Link href="/student-dashboard/assignments" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <span>View All Assignments</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>Template Shortcuts</CardTitle>
              <CardDescription>Quick access to your templates</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {isDataLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : templates.length > 0 ? (
                <ul className="space-y-2">
                  {templates.slice(0, 3).map(template => (
                    <li 
                      key={template.id} 
                      className="flex justify-between items-center p-2 rounded hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={(e) => {
                        e.preventDefault();
                        if (template.link) {
                          const url = template.link.startsWith('http') ? template.link : `https://${template.link}`;
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded-full bg-primary/10 p-1">
                          {template.category === "assignment" ? (
                            <FileText className="h-3 w-3 text-primary" />
                          ) : template.category === "notes" ? (
                            <FileCode className="h-3 w-3 text-primary" />
                          ) : (
                            <Calculator className="h-3 w-3 text-primary" />
                          )}
                        </div>
                        <span className="font-medium">{template.title}</span>
                      </div>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[180px] text-muted-foreground">
                  <XCircle className="h-10 w-10 text-red-500 mb-3" />
                  <p>No templates available</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-background p-3">
              <Link href="/student-dashboard/templates" className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <span>View All Templates</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Improved Assignment Progress Card with Pie Chart */}
        <div className="grid gap-6 mt-8 md:grid-cols-2">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Assignment Progress</CardTitle>
              <CardDescription>Your overall progress this semester</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {isDataLoading ? (
                <div className="flex items-center justify-center h-[220px]">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : (
                <AssignmentPieChart data={assignmentStats} />
              )}
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-md flex flex-col">
            <CardHeader>
              <CardTitle>Assignment Status</CardTitle>
              <CardDescription>Detailed progress breakdown</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {isDataLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-foreground font-medium flex items-center">
                        <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                        Completed
                      </span>
                      <span className="text-foreground font-medium">
                        {assignmentStats[0]?.value || 0}/{assignments.length}
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-600 rounded-full transition-all duration-500" 
                        style={{ 
                          width: assignments.length ? 
                            `${(assignmentStats[0]?.value || 0) / assignments.length * 100}%` : 
                            "0%" 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-foreground font-medium flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        In Progress
                      </span>
                      <span className="text-foreground font-medium">
                        {assignmentStats[1]?.value || 0}/{assignments.length}
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500 rounded-full transition-all duration-500" 
                        style={{ 
                          width: assignments.length ? 
                            `${(assignmentStats[1]?.value || 0) / assignments.length * 100}%` : 
                            "0%" 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-foreground font-medium flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        Not Started
                      </span>
                      <span className="text-foreground font-medium">
                        {assignmentStats[2]?.value || 0}/{assignments.length}
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-red-500 rounded-full transition-all duration-500" 
                        style={{ 
                          width: assignments.length ? 
                            `${(assignmentStats[2]?.value || 0) / assignments.length * 100}%` : 
                            "0%" 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t bg-background p-3">
              <Link href={kanbanData.boardId ? `/student-dashboard/kanban/${kanbanData.boardId}` : "/student-dashboard/kanban"} className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <span>Go to Assignment Board</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Calendar section using the role-based calendar component */}
        <div className="mt-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Assignment Deadlines</CardTitle>
                <CardDescription>Track your upcoming assignment due dates</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <Calendar className="h-4 w-4" />
                <span>View Full Calendar</span>
              </Button>
            </CardHeader>
            <CardContent>
              <RoleBasedCalendar 
                items={assignments} 
                isLoading={isDataLoading} 
                boardId={kanbanData.boardId} 
              />
            </CardContent>
          </Card>
        </div>

        {/* Assignment Detail Dialog */}
        <Dialog open={selectedAssignment !== null} onOpenChange={(open) => !open && setSelectedAssignment(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assignment Details</DialogTitle>
              <DialogDescription>
                View your assignment details
              </DialogDescription>
            </DialogHeader>
            
            {selectedAssignment && (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-lg font-bold">{selectedAssignment.title}</h3>
                  <p className="text-sm text-muted-foreground">{selectedAssignment.course || 'General Assignment'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-medium">Due Date</p>
                    <p>
                      {selectedAssignment.dueDate ? formatDate(selectedAssignment.dueDate) : 'No due date'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="font-medium">Status</p>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        selectedAssignment.status === 'completed' ? 'bg-green-600' :
                        selectedAssignment.status === 'in-progress' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <p className="capitalize">{selectedAssignment.status.replace('-', ' ')}</p>
                    </div>
                  </div>
                </div>
                
                {selectedAssignment.description && (
                  <div>
                    <p className="font-medium">Description</p>
                    <p className="text-sm">{selectedAssignment.description}</p>
                  </div>
                )}
                
                <div className="flex justify-end mt-4">
                  <Link href={selectedAssignment.kanbanBoardId ? 
                    `/student-dashboard/kanban/${selectedAssignment.kanbanBoardId}` : 
                    `/student-dashboard/assignments/${selectedAssignment.id}`
                  }>
                    <Button variant="outline" className="mr-2">
                      {selectedAssignment.kanbanBoardId ? 'View in Kanban' : 'View Full Details'}
                    </Button>
                  </Link>
                  <DialogClose asChild>
                    <Button>Close</Button>
                  </DialogClose>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </AnimatedSection>
  )
}


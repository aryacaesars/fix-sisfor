"use client"

import { 
  Home, BookOpen, LayoutGrid, FileText, Settings, User, 
  Calendar, ArrowRight, ExternalLink, X, Info, AlertCircle 
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { AnimatedSection } from "@/components/animated-section"
import { useRBAC } from "@/hooks/use-rbac"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

// Dynamically import chart components to avoid SSR issues
const PieChart = dynamic(() => import("recharts").then(mod => mod.PieChart), { ssr: false })
const Pie = dynamic(() => import("recharts").then(mod => mod.Pie), { ssr: false })
const Cell = dynamic(() => import("recharts").then(mod => mod.Cell), { ssr: false })
const Legend = dynamic(() => import("recharts").then(mod => mod.Legend), { ssr: false })
const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false })

// Fetch assignment data
async function getAssignments(userId) {
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
async function getKanbanData(userId) {
  try {
    const response = await fetch(`/api/kanban/boards/user/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch kanban data');
    return await response.json();
  } catch (error) {
    console.error('Error fetching kanban data:', error);
    return { boards: [] };
  }
}

// Simple Kanban Board Component
const KanbanBoard = ({ columns = [] }) => {
  if (columns.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No kanban data available</div>;
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {columns.map((column) => (
        <div key={column.id} className="bg-muted rounded-lg p-4">
          <h3 className="font-medium mb-4">{column.title}</h3>
          <div className="space-y-3">
            {column.tasks.map(task => (
              <div key={task.id} className="bg-background p-3 rounded-md shadow-sm">
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
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

// Calendar Component for Deadlines
const DeadlineCalendar = ({ assignments = [], router, boardId }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Show the next 7 days
  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  const getAssignmentsByDate = (date) => {
    return assignments.filter(assignment => {
      if (!assignment.dueDate) return false;
      
      const dueDate = new Date(assignment.dueDate);
      return dueDate.getDate() === date.getDate() && 
             dueDate.getMonth() === date.getMonth() && 
             dueDate.getFullYear() === date.getFullYear();
    });
  };

  // Function to generate the month calendar for modal
  const generateMonthCalendar = () => {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const days = [];
    
    // Add empty cells for days of the week before the first day
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(today.getFullYear(), today.getMonth(), i);
      days.push(date);
    }
    
    return days;
  };

  // Get days of the month for the full calendar
  const monthDays = generateMonthCalendar();

  // Calendar preview content that will be wrapped by DialogTrigger
  const CalendarPreview = () => (
    <div className="cursor-pointer hover:bg-accent/10 rounded-md p-2 -m-2 transition-colors">
      <div className="grid grid-cols-7 gap-1">
        {next7Days.map((date, i) => (
          <div key={i} className="text-center">
            <div className="text-xs mb-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
            <div className={`rounded-full w-8 h-8 mx-auto flex items-center justify-center text-sm ${date.getDate() === today.getDate() ? 'bg-primary text-white' : ''}`}>
              {date.getDate()}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 space-y-2">
        {next7Days.map((date, i) => {
          const dayAssignments = getAssignmentsByDate(date);
          if (dayAssignments.length === 0) {
            // Only show "No schedules" for today and tomorrow
            if (i <= 1) {
              return (
                <div key={i} className="border-t pt-2">
                  <div className="font-medium text-sm mb-1">
                    {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </div>
                  <div className="pl-4 py-1 border-l-2 border-muted-foreground/30">
                    <div className="text-sm text-muted-foreground">No schedules for this date</div>
                  </div>
                </div>
              );
            }
            return null;
          }
          
          return (
            <div key={i} className="border-t pt-2">
              <div className="font-medium text-sm mb-1">
                {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
              {dayAssignments.map(assignment => (
                <div 
                  key={assignment.id} 
                  className="pl-4 py-1 border-l-2 border-primary cursor-pointer hover:bg-accent/10 rounded-r transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedAssignment(assignment);
                  }}
                >
                  <div className="text-sm font-medium">{assignment.title}</div>
                  <div className="text-xs text-muted-foreground">{assignment.course || 'General Assignment'}</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-background rounded-lg p-4 border">
        {/* Full Calendar Modal - Correctly structured with DialogTrigger inside Dialog */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <div onClick={() => setIsModalOpen(true)}>
              <CalendarPreview />
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Assignment Calendar</DialogTitle>
              <DialogDescription>
                View all your assignment deadlines in this month
              </DialogDescription>
            </DialogHeader>
            
            <div className="text-xs text-muted-foreground mb-3 flex items-center">
              <Info className="h-3 w-3 mr-1" />
              <span>Tip: Double-click on dates with assignments to view them in the Kanban board</span>
            </div>
            
            <div className="mt-4">
              <div className="mb-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((date, i) => {
                  if (!date) {
                    return <div key={`empty-${i}`} className="h-20 p-1"></div>;
                  }
                  
                  const dayAssignments = getAssignmentsByDate(date);
                  const isToday = date.getDate() === today.getDate() && 
                                  date.getMonth() === today.getMonth() && 
                                  date.getFullYear() === today.getFullYear();
                  
                  return (
                    <div 
                      key={`day-${i}`} 
                      className={`h-20 p-1 border rounded-md ${isToday ? 'border-primary' : 'border-border'} 
                                 ${dayAssignments.length > 0 ? 'hover:bg-accent/5 cursor-pointer' : ''}`}
                      onDoubleClick={() => {
                        // Only navigate if there are assignments for this date
                        if (dayAssignments.length > 0) {
                          // Format the date for the URL
                          const formattedDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
                          
                          // Find the first assignment with a kanbanBoardId
                          const assignmentWithBoard = dayAssignments.find(a => a.kanbanBoardId);
                          
                          if (assignmentWithBoard && assignmentWithBoard.kanbanBoardId) {
                            // Use the kanbanBoardId from the assignment itself
                            router.push(`/student-dashboard/kanban/${assignmentWithBoard.kanbanBoardId}?date=${formattedDate}`);
                          } else if (boardId) {
                            // Fallback to the provided boardId if no assignment has a board
                            router.push(`/student-dashboard/kanban/${boardId}?date=${formattedDate}`);
                          } else {
                            // Last fallback if no board ID is available anywhere
                            router.push(`/student-dashboard/kanban?date=${formattedDate}`);
                          }
                        }
                      }}
                    >
                      <div className={`text-right mb-1 ${isToday ? 'font-bold text-primary' : ''}`}>
                        {date.getDate()}
                      </div>
                      <div className="overflow-y-auto max-h-14 text-xs space-y-1">
                        {dayAssignments.length > 0 ? (
                          dayAssignments.map(assignment => (
                            <TooltipProvider key={assignment.id}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    className="p-1 rounded truncate cursor-pointer bg-primary/10 hover:bg-primary/20"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedAssignment(assignment);
                                    }}
                                  >
                                    {assignment.title}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{assignment.title}</p>
                                  <p className="text-xs">{assignment.course || 'General Assignment'}</p>
                                  <p className="text-xs italic mt-1">Double-click date to view in Kanban</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ))
                        ) : (
                          <div className="text-muted-foreground text-center text-xs italic">No tasks</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Link href={boardId ? `/student-dashboard/kanban/${boardId}` : "/student-dashboard/kanban"}>
                <Button variant="outline">Go to Assignment Board</Button>
              </Link>
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
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
                    {new Date(selectedAssignment.dueDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
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
                <Link href={`/assignments/${selectedAssignment.id}`}>
                  <Button variant="outline" className="mr-2">View Full Details</Button>
                </Link>
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function StudentDashboard() {
  const { isAuthorized, isLoading, role, user } = useRBAC(["student"])
  const router = useRouter()
  const [assignments, setAssignments] = useState([])
  const [kanbanData, setKanbanData] = useState({ columns: [] })
  const [isDataLoading, setIsDataLoading] = useState(true)

  // Fetch data when the component mounts and user is available
  useEffect(() => {
    if (user?.id) {
      const fetchData = async () => {
        setIsDataLoading(true);
        const [assignmentsData, kanbanBoardsData] = await Promise.all([
          getAssignments(user.id),
          getKanbanData(user.id)
        ]);
        
        setAssignments(assignmentsData);
        
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

  // Format assignment stats for pie chart
  const getAssignmentStats = () => {
    if (!assignments.length) return [];
    
    const completed = assignments.filter(a => a.status === 'completed').length;
    const inProgress = assignments.filter(a => a.status === 'in-progress').length;
    const notStarted = assignments.filter(a => a.status === 'not-started').length;
    
    return [
      { name: "Completed", value: completed, color: "#16a34a" },
      { name: "In Progress", value: inProgress, color: "#eab308" },
      { name: "Not Started", value: notStarted, color: "#ef4444" },
    ];
  };

  // Get upcoming assignments (sorted by due date)
  const getUpcomingAssignments = () => {
    if (!assignments.length) return [];
    
    const now = new Date();
    return assignments
      .filter(a => a.dueDate && new Date(a.dueDate) > now)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3);
  };

  useEffect(() => {
    // Check if user is authenticated but not authorized (wrong role)
    if (!isLoading && !isAuthorized && localStorage.getItem("auth-status") === "authenticated") {
      // They're logged in but with the wrong role
      router.push("/unauthorized")
    }
  }, [isLoading, isAuthorized, router])

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
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Upcoming Assignments</CardTitle>
              <CardDescription>Your assignments due soon</CardDescription>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : upcomingAssignments.length > 0 ? (
                <ul className="space-y-2">
                  {upcomingAssignments.map(assignment => (
                    <li key={assignment.id} className="flex justify-between items-center">
                      <span>{assignment.title}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(assignment.dueDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center py-4 text-muted-foreground">No upcoming assignments</p>
              )}
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Study Groups</CardTitle>
              <CardDescription>Your active study groups</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>Calculus Study Group</span>
                  <span className="text-sm text-muted-foreground">5 members</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Chemistry Lab Partners</span>
                  <span className="text-sm text-muted-foreground">3 members</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Programming Project Team</span>
                  <span className="text-sm text-muted-foreground">4 members</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Class Schedule</CardTitle>
              <CardDescription>Today's classes</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span>Introduction to Psychology</span>
                  <span className="text-sm text-muted-foreground">9:00 AM</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Calculus II</span>
                  <span className="text-sm text-muted-foreground">11:00 AM</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Computer Science 101</span>
                  <span className="text-sm text-muted-foreground">2:00 PM</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Improved Assignment Progress Card with Pie Chart */}
        <div className="grid gap-6 mt-8 md:grid-cols-2">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Assignment Progress</CardTitle>
              <CardDescription>Your overall progress this semester</CardDescription>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="h-56 w-full max-w-xs">
                    {assignmentStats.some(stat => stat.value > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={assignmentStats}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          >
                            {assignmentStats.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No assignment data available</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full mt-4">
                    <div className="text-sm font-medium mb-2 text-center">
                      Total Assignments: {assignments.length}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Assignment Status</CardTitle>
              <CardDescription>Detailed progress breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {isDataLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium flex items-center">
                        <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
                        Completed
                      </span>
                      <span className="font-medium">
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
                      <span className="font-medium flex items-center">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                        In Progress
                      </span>
                      <span className="font-medium">
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
                      <span className="font-medium flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                        Not Started
                      </span>
                      <span className="font-medium">
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
            <CardFooter>
              <Link href={kanbanData.boardId ? `/student-dashboard/kanban/${kanbanData.boardId}` : "/student-dashboard/kanban"} className="w-full">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <span>Go to Assignment Board</span>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>

        {/* Calendar section - now clickable */}
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
              {isDataLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <DeadlineCalendar assignments={assignments} router={router} boardId={kanbanData.boardId} />
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent actions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Submitted Physics Lab Report</p>
                    <p className="text-xs text-muted-foreground">Today, 10:23 AM</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Added new assignment: English Essay</p>
                    <p className="text-xs text-muted-foreground">Yesterday, 4:45 PM</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Updated Kanban board for CS Project</p>
                    <p className="text-xs text-muted-foreground">Yesterday, 2:30 PM</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </AnimatedSection>
  )
}


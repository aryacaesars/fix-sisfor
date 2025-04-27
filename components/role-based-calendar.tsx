"use client"

import { useEffect, useState } from "react"
import { Calendar, ArrowRight, ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogClose,
  DialogFooter
} from "@/components/ui/dialog"
import { useRBAC } from "@/hooks/use-rbac"
import { formatDate, formatCurrency, getStatusColor } from "@/lib/utils"
import { Clock, Users } from "lucide-react"
import { showErrorNotification } from "@/components/ui/notification"

type CalendarItem = {
  id: string
  title: string
  description?: string
  status?: string
  dueDate?: string // for student assignments
  endDate?: string // for freelancer projects
  kanbanBoardId?: string
  course?: string // for student assignments
  clientName?: string // for freelancer projects
  [key: string]: any // Allow additional properties
}

type RoleBasedCalendarProps = {
  items?: CalendarItem[]
  isLoading?: boolean
  boardId?: string // Optional board ID for navigation
}

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

export function RoleBasedCalendar({ items = [], isLoading = false, boardId }: RoleBasedCalendarProps) {
  const { user, isAuthorized, isLoading: rbacLoading } = useRBAC(["student", "freelancer"])
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null) // Store date as YYYY-MM-DD string
  const [selectedItem, setSelectedItem] = useState<CalendarItem | null>(null)
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([])
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  // Detect user role
  const isStudent = user?.role === "student"
  const isFreelancer = user?.role === "freelancer"

  // Fetch data when the component mounts and user is available
  useEffect(() => {
    if (user?.id && items.length === 0 && !isLoading) {
      const fetchData = async () => {
        try {
          let data: CalendarItem[] = [];
          
          if (isStudent) {
            // Fetch assignment data for students
            const response = await fetch(`/api/assignments/user/${user.id}`);
            if (response.ok) {
              data = await response.json();
            }
          } else if (isFreelancer) {
            // Fetch project data for freelancers
            const response = await fetch(`/api/projects`);
            if (response.ok) {
              data = await response.json();
            }
          }
          
          setCalendarItems(data);
        } catch (error) {
          console.error('Error fetching calendar data:', error);
          setCalendarItems([]);
        }
      };
      
      fetchData();
    } else {
      // Use the passed items if available
      setCalendarItems(items);
    }
  }, [user, items, isLoading, isStudent, isFreelancer]);

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay() // 0 for Sunday, 1 for Monday, etc.
  }

  // Helper to format date to YYYY-MM-DD
  const toISODateString = (date: Date | null | undefined) => {
    if (!date) return null;
    try {
      // Create a new Date object from the input
      const d = new Date(date);
      
      // Get year, month, and day in local timezone
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-indexed
      const day = String(d.getDate()).padStart(2, '0');
      
      // Format as YYYY-MM-DD without timezone conversion
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error("Invalid date for toISODateString:", date);
      return null;
    }
  }

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDayOfMonth = getFirstDayOfMonth(year, month)
    const todayString = toISODateString(new Date());

    const days = []

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 border border-muted/30"></div>)
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const formattedDate = toISODateString(date)

      // Check if there are any items on this day
      const dayItems = calendarItems.filter(item => {
        const itemDate = toISODateString(new Date(isStudent ? item.dueDate : item.endDate))
        return itemDate === formattedDate
      })

      const isToday = formattedDate === todayString;

      days.push(
        <div
          key={day}
          className={`h-12 border border-muted/30 p-1 relative cursor-pointer transition-colors flex flex-col justify-between
            ${dayItems.length > 0 ? 'hover:bg-primary/10' : 'hover:bg-accent/50'}
            ${selectedDate === formattedDate ? 'bg-primary/10 border-primary' : ''}
            ${isToday ? 'bg-accent/70' : ''}
          `}
          onClick={() => {
            setSelectedDate(formattedDate)
            // Reset selected item if clicking a date with multiple items or no items
            if (dayItems.length !== 1) {
              setSelectedItem(null);
            } else {
              setSelectedItem(dayItems[0] as CalendarItem); // Auto-select if only one item
            }
          }}
          onDoubleClick={() => {
            // Only navigate if there are items for this date
            if (dayItems.length > 0 && isStudent) {
              // Format the date for the URL
              const formattedUrlDate = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
              
              // Find the first item with a kanbanBoardId
              const itemWithBoard = dayItems.find(a => a.kanbanBoardId);
              
              if (itemWithBoard && itemWithBoard.kanbanBoardId) {
                // Use the kanbanBoardId from the item itself
                router.push(`/student-dashboard/kanban/${itemWithBoard.kanbanBoardId}?date=${formattedUrlDate}`);
              } else if (boardId) {
                // Fallback to the provided boardId if no item has a board
                router.push(`/student-dashboard/kanban/${boardId}?date=${formattedUrlDate}`);
              } else {
                // Last fallback if no board ID is available anywhere
                router.push(`/student-dashboard/kanban?date=${formattedUrlDate}`);
              }
            }
          }}
        >
          <div className={`text-xs text-right ${isToday ? 'font-bold text-primary' : ''}`}>{day}</div>
          {dayItems.length > 0 && (
            <div className="flex justify-center space-x-1 mb-1">
              {dayItems.slice(0, 3).map((_, idx) => (
                <div
                  key={idx}
                  className="w-1.5 h-1.5 rounded-full bg-primary"
                ></div>
              ))}
              {dayItems.length > 3 && (
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" title={`${dayItems.length - 3} more`}></div>
              )}
            </div>
          )}
        </div>
      )
    }

    return days
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    setSelectedDate(null)
    setSelectedItem(null)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    setSelectedDate(null)
    setSelectedItem(null)
  }

  const today = () => {
    const todayDate = new Date();
    setCurrentDate(todayDate)
    setSelectedDate(toISODateString(todayDate)) // Select today's date
    setSelectedItem(null) // Reset item selection
  }

  const getSelectedDateItems = () => {
    if (!selectedDate) return []

    return calendarItems.filter(item => {
      const itemDate = toISODateString(new Date(isStudent ? item.dueDate : item.endDate))
      return itemDate === selectedDate
    }).sort((a, b) => {
      const dateA = new Date(isStudent ? a.dueDate : a.endDate).getTime()
      const dateB = new Date(isStudent ? b.dueDate : b.endDate).getTime()
      return dateA - dateB
    });
  }

  const handleViewDetails = (item: CalendarItem) => {
    setSelectedItem(item)
    setIsDetailsModalOpen(true)
  }

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    const dayItems = calendarItems.filter(item => {
      const itemDate = item.endDate || item.dueDate;
      if (!itemDate) return false;
      try {
        const itemDateObj = new Date(itemDate);
        if (isNaN(itemDateObj.getTime())) return false;
        return itemDateObj.toISOString().split('T')[0] === date;
      } catch (error) {
        return false;
      }
    });
    
    if (dayItems.length === 0) {
      setSelectedItem(null);
    } else {
      setSelectedItem(dayItems[0]);
    }
  };

  // Loading state
  if (isLoading || rbacLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading calendar...</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="p-4 bg-muted/20 flex justify-between items-center">
          <div>
            <h3 className="font-medium">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="outline" onClick={prevMonth}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={today}>
              Today
            </Button>
            <Button size="sm" variant="outline" onClick={nextMonth}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center p-2 font-medium text-xs text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>

        {/* Selected Day Details */}
        {selectedDate && (
          <div className="p-4 border-t">
            <h4 className="font-medium mb-2 text-sm">
              {isStudent ? "Assignments" : "Deadlines"} for {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
              {isStudent && (
                <div className="text-xs text-muted-foreground mt-1">
                  Double-click on a day to view in Kanban board
                </div>
              )}
            </h4>

            {getSelectedDateItems().length > 0 ? (
              <ul className="space-y-2 max-h-32 overflow-y-auto">
                {getSelectedDateItems().map(item => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between p-2 text-sm rounded hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleViewDetails(item as CalendarItem)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item.status === 'completed' ? 'bg-green-600' :
                        (item.status === 'in-progress' || item.status === 'active') ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className="truncate max-w-[150px] md:max-w-[200px]">{item.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                      {new Date(isStudent ? item.dueDate : item.endDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No {isStudent ? "assignments" : "deadlines"} for this day.</p>
            )}
          </div>
        )}
      </div>

      {/* Item Detail Dialog */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="w-full max-w-screen-lg">
          {selectedItem && (
            <>
              <DialogHeader>
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-2xl">{selectedItem.title}</DialogTitle>
                  {selectedItem.status && (
                    <div className={`px-3 py-1 rounded-full text-sm text-white ${getStatusColor(selectedItem.status)}`}>
                      {selectedItem.status}
                    </div>
                  )}
                </div>
                <p className="text-md text-muted-foreground">
                  {selectedItem.clientName ? `Client: ${selectedItem.clientName}` : selectedItem.course ? `Course: ${selectedItem.course}` : 'No client/course'}
                </p>
              </DialogHeader>
              
              <div className="space-y-6">
                {selectedItem.description && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Description</h3>
                    <p className="text-md">{selectedItem.description}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Timeline</h3>
                    <div className="space-y-2">
                      {selectedItem.startDate && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Start Date</p>
                            <p>{formatDate(selectedItem.startDate)}</p>
                          </div>
                        </div>
                      )}
                      {(selectedItem.endDate || selectedItem.dueDate) && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Deadline</p>
                            <p>{formatDate(selectedItem.endDate || selectedItem.dueDate || '')}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Details</h3>
                    <div className="space-y-2">
                      {selectedItem.budget !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-medium">Rp</span>
                          <div>
                            <p className="text-sm text-muted-foreground">Budget</p>
                            <p>{formatCurrency(selectedItem.budget)}</p>
                          </div>
                        </div>
                      )}
                      {selectedItem.assignedTo && (
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Assigned To</p>
                            <p>{selectedItem.assignedTo}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex flex-wrap gap-4">
                {selectedItem.kanbanBoardId && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      window.location.href = `/freelancer-dashboard/kanban/${selectedItem.kanbanBoardId}`;
                    }}
                  >
                    View Kanban Board
                  </Button>
                )}
                <Button variant="outline" onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
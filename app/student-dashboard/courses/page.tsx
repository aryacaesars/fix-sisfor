"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useRBAC } from "@/hooks/use-rbac"
import { useToast } from "@/hooks/use-toast"
import { AnimatedSection } from "@/components/animated-section"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  Plus, 
  Edit, 
  Trash, 
  Search, 
  Clock, 
  Calendar, 
  Building2,
  User2
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Course {
  id: string
  name: string
  code: string
  lecturer: string
  room: string
  schedule: {
    day: string
    startTime: string
    endTime: string
  }[]
  userId: string
  createdAt: string
  updatedAt: string
}

export default function CoursesPage() {
  const { isAuthorized, isLoading } = useRBAC(["student"])
  const { toast } = useToast()
  const router = useRouter()
  
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  
  // New course form state
  const [newCourse, setNewCourse] = useState<{
    name: string;
    code: string;
    lecturer: string;
    room: string;
    schedule: Array<{
      day: string;
      startTime: string;
      endTime: string;
    }>;
  }>({
    name: "",
    code: "",
    lecturer: "",
    room: "",
    schedule: [{
      day: "",
      startTime: "",
      endTime: ""
    }]
  })

  // Load courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/courses")
        if (!response.ok) throw new Error("Failed to fetch courses")
        const data = await response.json()
        setCourses(data)
      } catch (error) {
        console.error("Error fetching courses:", error)
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    if (isAuthorized) {
      fetchCourses()
    }
  }, [isAuthorized, toast])

  // Redirect unauthorized
  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.replace("/unauthorized")
    }
  }, [isLoading, isAuthorized, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  // Filter courses based on search
  const filteredCourses = courses.filter(course => {
    return (
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.lecturer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  // Handle adding new course
  const handleAddCourse = async () => {
    try {
      // Validation
      if (!newCourse.name || !newCourse.code || !newCourse.lecturer) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        })
        return
      }

      // Validate schedule
      if (!newCourse.schedule || newCourse.schedule.length === 0) {
        toast({
          title: "Validation Error",
          description: "Please add at least one schedule",
          variant: "destructive"
        })
        return
      }

      // Validate each schedule entry
      const invalidSchedule = newCourse.schedule.some(sched => 
        !sched?.day || !sched?.startTime || !sched?.endTime
      )

      if (invalidSchedule) {
        toast({
          title: "Validation Error",
          description: "Please fill in all schedule fields",
          variant: "destructive"
        })
        return
      }
      
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCourse.name,
          code: newCourse.code,
          lecturer: newCourse.lecturer,
          room: newCourse.room || null,
          schedule: newCourse.schedule
        }),
      })
      
      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to create course')
      }
      
      setCourses([...courses, responseData])
      setIsModalOpen(false)
      setNewCourse({
        name: "",
        code: "",
        lecturer: "",
        room: "",
        schedule: [{
          day: "",
          startTime: "",
          endTime: ""
        }]
      })
      
      toast({
        title: "Success",
        description: "Course added successfully",
      })
    } catch (error) {
      console.error("Error creating course:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create course",
        variant: "destructive"
      })
    }
  }

  // Handle delete course
  const handleDeleteCourse = async (course: Course) => {
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) throw new Error('Failed to delete course')
      
      setCourses(courses.filter(c => c.id !== course.id))
      
      toast({
        title: "Success",
        description: "Course deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive"
      })
    }
  }

  // Handle edit course
  const handleEditCourse = async (course: Course) => {
    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: course.name,
          code: course.code,
          lecturer: course.lecturer,
          room: course.room || null,
          schedule: course.schedule
        }),
      })
      
      if (!response.ok) throw new Error('Failed to update course')
      
      const updatedCourse = await response.json()
      setCourses(courses.map(c => c.id === course.id ? updatedCourse : c))
      setSelectedCourse(null)
      setIsEditMode(false)
      
      toast({
        title: "Success",
        description: "Course updated successfully",
      })
    } catch (error) {
      console.error("Error updating course:", error)
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
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
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button
          className="transition-all duration-200 hover:scale-105"
          onClick={() => setIsModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No courses found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="transition-all duration-200 hover:shadow-md">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{course.name}</CardTitle>
                    <CardDescription className="font-medium">{course.code}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedCourse(course)
                        setIsEditMode(true)
                      }}
                      title="Edit Course"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteCourse(course)}
                      className="text-red-500 hover:bg-red-50"
                      title="Delete Course"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Lecturer</h4>
                    <span>{course.lecturer}</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Room</h4>
                    <span>{course.room}</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Schedule</h4>
                    <div className="space-y-1">
                      {course.schedule.map((s, index) => (
                        <div key={index} className="text-sm">
                          {s.day} - {s.startTime} to {s.endTime}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Course Dialog */}
      <Dialog open={isModalOpen || isEditMode} onOpenChange={(open) => {
        if (!open) {
          setIsModalOpen(false)
          setIsEditMode(false)
          setSelectedCourse(null)
        }
      }}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Course" : "Add New Course"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Update course information" : "Add a new course to your schedule"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="Enter course name"
                  value={isEditMode ? selectedCourse?.name : newCourse.name}
                  onChange={(e) => {
                    if (isEditMode && selectedCourse) {
                      setSelectedCourse({ ...selectedCourse, name: e.target.value })
                    } else {
                      setNewCourse({ ...newCourse, name: e.target.value })
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Course Code <span className="text-red-500">*</span></Label>
                <Input
                  id="code"
                  placeholder="Enter course code"
                  value={isEditMode ? selectedCourse?.code : newCourse.code}
                  onChange={(e) => {
                    if (isEditMode && selectedCourse) {
                      setSelectedCourse({ ...selectedCourse, code: e.target.value })
                    } else {
                      setNewCourse({ ...newCourse, code: e.target.value })
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lecturer">Lecturer <span className="text-red-500">*</span></Label>
                <Input
                  id="lecturer"
                  placeholder="Enter lecturer name"
                  value={isEditMode ? selectedCourse?.lecturer : newCourse.lecturer}
                  onChange={(e) => {
                    if (isEditMode && selectedCourse) {
                      setSelectedCourse({ ...selectedCourse, lecturer: e.target.value })
                    } else {
                      setNewCourse({ ...newCourse, lecturer: e.target.value })
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room</Label>
                <Input
                  id="room"
                  placeholder="Enter room number"
                  value={isEditMode ? selectedCourse?.room : newCourse.room}
                  onChange={(e) => {
                    if (isEditMode && selectedCourse) {
                      setSelectedCourse({ ...selectedCourse, room: e.target.value })
                    } else {
                      setNewCourse({ ...newCourse, room: e.target.value })
                    }
                  }}
                />
              </div>
            </div>
            <div className="space-y-4">
              <Label>Schedule</Label>
              <div className="space-y-4">
                {(isEditMode ? selectedCourse?.schedule || [] : newCourse.schedule).map((sched, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2">
                    <Select
                      value={sched.day}
                      onValueChange={(value) => {
                        if (isEditMode && selectedCourse) {
                          const newSchedule = [...(selectedCourse.schedule || [])]
                          newSchedule[index].day = value
                          setSelectedCourse({ ...selectedCourse, schedule: newSchedule })
                        } else {
                          const newSchedule = [...newCourse.schedule]
                          newSchedule[index].day = value
                          setNewCourse({ ...newCourse, schedule: newSchedule })
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monday">Monday</SelectItem>
                        <SelectItem value="tuesday">Tuesday</SelectItem>
                        <SelectItem value="wednesday">Wednesday</SelectItem>
                        <SelectItem value="thursday">Thursday</SelectItem>
                        <SelectItem value="friday">Friday</SelectItem>
                        <SelectItem value="saturday">Saturday</SelectItem>
                        <SelectItem value="sunday">Sunday</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="time"
                      value={sched.startTime}
                      onChange={(e) => {
                        if (isEditMode && selectedCourse) {
                          const newSchedule = [...(selectedCourse.schedule || [])]
                          newSchedule[index].startTime = e.target.value
                          setSelectedCourse({ ...selectedCourse, schedule: newSchedule })
                        } else {
                          const newSchedule = [...newCourse.schedule]
                          newSchedule[index].startTime = e.target.value
                          setNewCourse({ ...newCourse, schedule: newSchedule })
                        }
                      }}
                    />
                    <Input
                      type="time"
                      value={sched.endTime}
                      onChange={(e) => {
                        if (isEditMode && selectedCourse) {
                          const newSchedule = [...(selectedCourse.schedule || [])]
                          newSchedule[index].endTime = e.target.value
                          setSelectedCourse({ ...selectedCourse, schedule: newSchedule })
                        } else {
                          const newSchedule = [...newCourse.schedule]
                          newSchedule[index].endTime = e.target.value
                          setNewCourse({ ...newCourse, schedule: newSchedule })
                        }
                      }}
                    />
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isEditMode && selectedCourse) {
                      setSelectedCourse({
                        ...selectedCourse,
                        schedule: [...(selectedCourse.schedule || []), { day: "", startTime: "", endTime: "" }]
                      })
                    } else {
                      setNewCourse({
                        ...newCourse,
                        schedule: [...newCourse.schedule, { day: "", startTime: "", endTime: "" }]
                      })
                    }
                  }}
                >
                  Add Schedule
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (isEditMode && selectedCourse) {
                  handleEditCourse(selectedCourse)
                } else {
                  handleAddCourse()
                }
              }}
            >
              {isEditMode ? "Update" : "Add"} Course
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AnimatedSection>
  )
}
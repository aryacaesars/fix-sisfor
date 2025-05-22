import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma' // Make sure this import is correct
import { authOptions } from '@/lib/auth' // Make sure this import is correct

// Handle GET request to fetch assignments
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get the user ID from the session
    const userId = (session.user as any).id
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 })
    }
    
    console.log("Fetching assignments for user:", userId)
    
    // Get assignments for the logged-in user
    const assignments = await prisma.assignment.findMany({
      where: { 
        userId: userId 
      },
      orderBy: { 
        updatedAt: 'desc' 
      },
      include: {
        // You can include related data if needed
      }
    })
    
    console.log(`Found ${assignments.length} assignments`)
    
    return NextResponse.json(assignments)
  } catch (error) {
    console.error('Error in assignments API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments', details: (error as Error).message }, 
      { status: 500 }
    )
  }
}

// Handle POST request to create a new assignment
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a student (case-insensitive)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user?.role || !["student", "Student"].includes(user.role)) {
      return NextResponse.json({ error: "Only students can create assignments" }, { status: 403 })
    }

    const body = await request.json()
    console.log("Request body:", body) // Log the request body
    
    const { title, description, course, status, dueDate, createKanbanBoard = true } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    console.log("Creating assignment with values:", { title, description, course, status, dueDate })
    console.log("Will create Kanban board:", createKanbanBoard)

    // Convert dueDate from local (datetime-local) to UTC (handled by JS Date)
    let dueDateUTC: Date | null = null;
    if (dueDate) {
      // dueDate is string like "2025-05-22T15:00"
      // new Date(dueDate) will treat as local time and store as UTC in DB
      dueDateUTC = new Date(dueDate);
    }

    // Create a new assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || null,
        course: course || null,
        status: status || "not-started",
        dueDate: dueDateUTC,
        userId: session.user.id,
      },
    })

    console.log("Assignment created:", assignment)

    // Always create a Kanban board for assignments in this page
    try {
      console.log("Creating Kanban board for assignment:", assignment.id)
      
      // Create Kanban board
      const kanbanBoard = await prisma.kanbanBoard.create({
        data: {
          title: `${title} Board`,
          description: `Kanban board for assignment: ${title}`,
          createdById: session.user.id,
          columns: {
            create: [
              { title: "To Do", order: 1 },
              { title: "In Progress", order: 2 },
              { title: "Done", order: 3 },
            ],
          },
        },
      })

      console.log("Kanban Board Created:", kanbanBoard)

      // Update assignment with Kanban board ID
      const updatedAssignment = await prisma.assignment.update({
        where: { id: assignment.id },
        data: { kanbanBoardId: kanbanBoard.id },
      })

      console.log("Assignment updated with board ID:", updatedAssignment)

      return NextResponse.json({ 
        ...updatedAssignment, 
        kanbanBoard: kanbanBoard 
      }, { status: 201 })
    } catch (boardError) {
      console.error("Error creating Kanban board:", boardError)
      
      // Still return the assignment even if board creation fails
      return NextResponse.json({
        ...assignment,
        error: "Assignment created but failed to create Kanban board"
      }, { status: 201 })
    }
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ 
      error: "An error occurred while creating the assignment",
      details: (error as Error).message
    }, { status: 500 })
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Get a specific assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const id = params.id // Extract id to avoid Next.js warning
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    console.log("Fetching assignment with ID:", id)
    
    // Get the assignment ensuring it belongs to the user
    const assignment = await prisma.assignment.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    })
    
    if (!assignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }
    
    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error fetching assignment:", error)
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    )
  }
}

// Update an existing assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const id = params.id // Extract id to avoid Next.js warning
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if the assignment exists and belongs to the user
    const existingAssignment = await prisma.assignment.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    })
    
    if (!existingAssignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }
    
    // Parse request body
    const body = await request.json()
    const { title, description, course, status, dueDate } = body
    
    console.log("Updating assignment:", id, "with data:", body)
    
    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    
    // Update the assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id },
      data: {
        title,
        description: description || null,
        course: course || null,
        status: status || "not-started",
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    })
    
    console.log("Assignment updated successfully:", id)
    
    // Update the associated kanban board title if it exists
    if (existingAssignment.kanbanBoardId) {
      try {
        await prisma.kanbanBoard.update({
          where: { id: existingAssignment.kanbanBoardId },
          data: {
            title: `${title} Board`
          }
        })
        console.log("Updated kanban board title for board:", existingAssignment.kanbanBoardId)
      } catch (boardError) {
        console.error("Error updating kanban board:", boardError)
        // Continue even if board update fails
      }
    }
    
    return NextResponse.json(updatedAssignment)
  } catch (error) {
    console.error("Error updating assignment:", error)
    return NextResponse.json(
      { error: "Failed to update assignment", details: (error as Error).message },
      { status: 500 }
    )
  }
}

// Delete an assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const id = params.id // Extract id to avoid Next.js warning
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if the assignment exists and belongs to the user
    const existingAssignment = await prisma.assignment.findUnique({
      where: {
        id,
        userId: session.user.id
      }
    })
    
    if (!existingAssignment) {
      return NextResponse.json({ error: "Assignment not found" }, { status: 404 })
    }
    
    // Delete the assignment
    await prisma.assignment.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    )
  }
}
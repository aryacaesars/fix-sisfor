import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a student
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.role !== "student") {
      return NextResponse.json({ error: "Only students can access assignments" }, { status: 403 })
    }

    // Get assignments for the user
    const assignments = await prisma.assignment.findMany({
      where: { userId: session.user.id },
      orderBy: { dueDate: "asc" },
    })

    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "An error occurred while fetching assignments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a student
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.role !== "student") {
      return NextResponse.json({ error: "Only students can create assignments" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, course, status, dueDate } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Create a new assignment
    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        course,
        status: status || "not-started",
        dueDate: dueDate ? new Date(dueDate) : null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ error: "An error occurred while creating the assignment" }, { status: 500 })
  }
}


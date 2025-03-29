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

    // Check if user is a freelancer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.role !== "freelancer") {
      return NextResponse.json({ error: "Only freelancers can access projects" }, { status: 403 })
    }

    // Get projects for the user
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "An error occurred while fetching projects" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is a freelancer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (user?.role !== "freelancer") {
      return NextResponse.json({ error: "Only freelancers can create projects" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description, clientName, status, budget, startDate, endDate } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Create a new project
    const project = await prisma.project.create({
      data: {
        title,
        description,
        clientName,
        status: status || "planning",
        budget: budget ? Number.parseFloat(budget) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        userId: session.user.id,
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "An error occurred while creating the project" }, { status: 500 })
  }
}


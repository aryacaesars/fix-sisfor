import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Helper function to check if user has edit access to column
async function checkColumnEditAccess(columnId: string, userId: string) {
  const column = await prisma.kanbanColumn.findUnique({
    where: { id: columnId },
    include: {
      board: {
        include: {
          members: {
            where: {
              userId,
              role: {
                in: ["admin", "editor"],
              },
            },
          },
        },
      },
    },
  })

  if (!column) {
    return { hasAccess: false, error: "Column not found", status: 404 }
  }

  if (column.board.createdById !== userId && column.board.members.length === 0) {
    return { hasAccess: false, error: "Unauthorized", status: 403 }
  }

  return { hasAccess: true, column }
}

export async function GET(request: Request, { params }: { params: { columnId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { columnId } = params

    // Check if column exists and user has access
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
      include: {
        board: {
          include: {
            members: {
              where: { userId: session.user.id },
            },
          },
        },
      },
    })

    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 })
    }

    if (column.board.createdById !== session.user.id && column.board.members.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get tasks
    const tasks = await prisma.kanbanTask.findMany({
      where: { columnId },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        attachments: true,
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "An error occurred while fetching tasks" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { columnId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { columnId } = params
    const { hasAccess, error, status } = await checkColumnEditAccess(columnId, session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error }, { status })
    }

    const body = await request.json()
    const { title, description, priority, dueDate, assigneeIds, labels } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Create task
    const task = await prisma.kanbanTask.create({
      data: {
        title,
        description,
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        columnId,
        createdById: session.user.id,
        labels: labels || [],
        assignees: assigneeIds
          ? {
              create: assigneeIds.map((userId: string) => ({
                userId,
              })),
            }
          : undefined,
      },
      include: {
        assignees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "An error occurred while creating the task" }, { status: 500 })
  }
}


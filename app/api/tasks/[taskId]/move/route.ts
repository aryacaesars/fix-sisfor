import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId } = params
    const body = await request.json()
    const { destinationColumnId } = body

    if (!destinationColumnId) {
      return NextResponse.json({ error: "Destination column ID is required" }, { status: 400 })
    }

    // Get task
    const task = await prisma.kanbanTask.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: {
                members: {
                  where: {
                    userId: session.user.id,
                    role: {
                      in: ["admin", "editor"],
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has permission to move tasks
    if (task.column.board.createdById !== session.user.id && task.column.board.members.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Check if destination column exists and is in the same board
    const destinationColumn = await prisma.kanbanColumn.findUnique({
      where: { id: destinationColumnId },
    })

    if (!destinationColumn) {
      return NextResponse.json({ error: "Destination column not found" }, { status: 404 })
    }

    if (destinationColumn.boardId !== task.column.boardId) {
      return NextResponse.json({ error: "Cannot move task to a column in a different board" }, { status: 400 })
    }

    // Move task
    const updatedTask = await prisma.kanbanTask.update({
      where: { id: taskId },
      data: {
        columnId: destinationColumnId,
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

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error moving task:", error)
    return NextResponse.json({ error: "An error occurred while moving the task" }, { status: 500 })
  }
}


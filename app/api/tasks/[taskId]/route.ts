import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Helper function to check if user has edit access to task
async function checkTaskEditAccess(taskId: string, userId: string) {
  const task = await prisma.kanbanTask.findUnique({
    where: { id: taskId },
    include: {
      column: {
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
      },
    },
  })

  if (!task) {
    return { hasAccess: false, error: "Task not found", status: 404 }
  }

  if (task.column.board.createdById !== userId && task.column.board.members.length === 0) {
    return { hasAccess: false, error: "Unauthorized", status: 403 }
  }

  return { hasAccess: true, task }
}

export async function GET(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId } = params

    // Get task with all related data
    const task = await prisma.kanbanTask.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: {
            board: {
              include: {
                members: {
                  where: { userId: session.user.id },
                },
              },
            },
          },
        },
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
            replies: {
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
        },
        attachments: true,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has access to the board
    if (task.column.board.createdById !== session.user.id && task.column.board.members.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "An error occurred while fetching the task" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId } = params
    const { hasAccess, error, status } = await checkTaskEditAccess(taskId, session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error }, { status })
    }

    const body = await request.json()
    const { title, description, priority, dueDate, assigneeIds, labels } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Update task
    const updatedTask = await prisma.$transaction(async (prisma) => {
      // If assigneeIds is provided, update assignees
      if (assigneeIds !== undefined) {
        // Delete existing assignees
        await prisma.taskAssignee.deleteMany({
          where: { taskId },
        })

        // Add new assignees
        if (assigneeIds.length > 0) {
          await Promise.all(
            assigneeIds.map((userId: string) =>
              prisma.taskAssignee.create({
                data: {
                  taskId,
                  userId,
                },
              }),
            ),
          )
        }
      }

      // Update task
      return prisma.kanbanTask.update({
        where: { id: taskId },
        data: {
          title,
          description,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
          labels: labels || [],
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
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "An error occurred while updating the task" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId } = params
    const { hasAccess, error, status } = await checkTaskEditAccess(taskId, session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error }, { status })
    }

    // Delete task (cascade will delete comments, attachments, etc.)
    await prisma.kanbanTask.delete({
      where: { id: taskId },
    })

    return NextResponse.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "An error occurred while deleting the task" }, { status: 500 })
  }
}


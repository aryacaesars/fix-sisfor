import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId } = params

    // Check if task exists and user has access
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
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (task.column.board.createdById !== session.user.id && task.column.board.members.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get comments
    const comments = await prisma.comment.findMany({
      where: {
        taskId,
        parentId: null, // Only get top-level comments
      },
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
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "An error occurred while fetching comments" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { taskId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId } = params

    // Check if task exists and user has access
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
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    if (task.column.board.createdById !== session.user.id && task.column.board.members.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { content, parentId } = body

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    // If parentId is provided, check if it exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
      })

      if (!parentComment || parentComment.taskId !== taskId) {
        return NextResponse.json({ error: "Parent comment not found" }, { status: 404 })
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId: session.user.id,
        parentId,
      },
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
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "An error occurred while creating the comment" }, { status: 500 })
  }
}


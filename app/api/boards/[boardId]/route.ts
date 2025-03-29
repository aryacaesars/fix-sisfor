import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Helper function to check if user has access to the board
async function checkBoardAccess(boardId: string, userId: string) {
  const board = await prisma.kanbanBoard.findUnique({
    where: { id: boardId },
    include: {
      members: {
        where: { userId },
      },
    },
  })

  if (!board) {
    return { hasAccess: false, error: "Board not found", status: 404 }
  }

  const isCreator = board.createdById === userId
  const isMember = board.members.length > 0

  if (!isCreator && !isMember) {
    return { hasAccess: false, error: "Unauthorized", status: 403 }
  }

  return { hasAccess: true, board }
}

export async function GET(request: Request, { params }: { params: { boardId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { boardId } = params
    const { hasAccess, error, status, board } = await checkBoardAccess(boardId, session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error }, { status })
    }

    // Get the board with all its data
    const fullBoard = await prisma.kanbanBoard.findUnique({
      where: { id: boardId },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        columns: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { updatedAt: "desc" },
              include: {
                createdBy: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                  },
                },
                comments: {
                  orderBy: { createdAt: "asc" },
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
            },
          },
        },
        members: {
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

    return NextResponse.json(fullBoard)
  } catch (error) {
    console.error("Error fetching board:", error)
    return NextResponse.json({ error: "An error occurred while fetching the board" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { boardId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { boardId } = params
    const { hasAccess, error, status, board } = await checkBoardAccess(boardId, session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error }, { status })
    }

    // Check if user is admin or creator
    const isCreator = board.createdById === session.user.id
    const isAdmin = board.members.some((member) => member.role === "admin")

    if (!isCreator && !isAdmin) {
      return NextResponse.json({ error: "You don't have permission to update this board" }, { status: 403 })
    }

    const body = await request.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Update the board
    const updatedBoard = await prisma.kanbanBoard.update({
      where: { id: boardId },
      data: {
        title,
        description,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
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

    return NextResponse.json(updatedBoard)
  } catch (error) {
    console.error("Error updating board:", error)
    return NextResponse.json({ error: "An error occurred while updating the board" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { boardId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { boardId } = params
    const { hasAccess, error, status, board } = await checkBoardAccess(boardId, session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error }, { status })
    }

    // Only the creator can delete the board
    if (board.createdById !== session.user.id) {
      return NextResponse.json({ error: "Only the creator can delete this board" }, { status: 403 })
    }

    // Delete the board (cascade will delete columns, tasks, etc.)
    await prisma.kanbanBoard.delete({
      where: { id: boardId },
    })

    return NextResponse.json({ message: "Board deleted successfully" })
  } catch (error) {
    console.error("Error deleting board:", error)
    return NextResponse.json({ error: "An error occurred while deleting the board" }, { status: 500 })
  }
}


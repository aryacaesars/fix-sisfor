import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// Helper function to check if user has edit access to board
async function checkBoardEditAccess(boardId: string, userId: string) {
  const boardMember = await prisma.boardMember.findFirst({
    where: {
      boardId,
      userId,
      role: {
        in: ["admin", "editor"],
      },
    },
  })

  const board = await prisma.kanbanBoard.findUnique({
    where: { id: boardId },
  })

  if (!board) {
    return { hasAccess: false, error: "Board not found", status: 404 }
  }

  if (!boardMember && board.createdById !== userId) {
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

    // Check if board exists and user has access
    const board = await prisma.kanbanBoard.findUnique({
      where: { id: boardId },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    })

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 })
    }

    if (board.createdById !== session.user.id && board.members.length === 0) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Get columns
    const columns = await prisma.kanbanColumn.findMany({
      where: { boardId },
      orderBy: { order: "asc" },
      include: {
        tasks: {
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
        },
      },
    })

    return NextResponse.json(columns)
  } catch (error) {
    console.error("Error fetching columns:", error)
    return NextResponse.json({ error: "An error occurred while fetching columns" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { boardId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { boardId } = params
    const { hasAccess, error, status } = await checkBoardEditAccess(boardId, session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error }, { status })
    }

    const body = await request.json()
    const { title } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Get the highest order value to add the new column at the end
    const highestOrderColumn = await prisma.kanbanColumn.findFirst({
      where: { boardId },
      orderBy: { order: "desc" },
    })

    const newOrder = highestOrderColumn ? highestOrderColumn.order + 1 : 0

    // Create column
    const column = await prisma.kanbanColumn.create({
      data: {
        title,
        boardId,
        order: newOrder,
      },
    })

    return NextResponse.json(column, { status: 201 })
  } catch (error) {
    console.error("Error creating column:", error)
    return NextResponse.json({ error: "An error occurred while creating the column" }, { status: 500 })
  }
}


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

export async function PUT(request: Request, { params }: { params: { columnId: string } }) {
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
    const { title } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Update column
    const updatedColumn = await prisma.kanbanColumn.update({
      where: { id: columnId },
      data: { title },
    })

    return NextResponse.json(updatedColumn)
  } catch (error) {
    console.error("Error updating column:", error)
    return NextResponse.json({ error: "An error occurred while updating the column" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { columnId: string } }) {
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

    // Delete column (cascade will delete tasks)
    await prisma.kanbanColumn.delete({
      where: { id: columnId },
    })

    return NextResponse.json({ message: "Column deleted successfully" })
  } catch (error) {
    console.error("Error deleting column:", error)
    return NextResponse.json({ error: "An error occurred while deleting the column" }, { status: 500 })
  }
}


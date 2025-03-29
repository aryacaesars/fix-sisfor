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

    // Get boards created by the user or where the user is a member
    const boards = await prisma.kanbanBoard.findMany({
      where: {
        OR: [{ createdById: session.user.id }, { members: { some: { userId: session.user.id } } }],
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
        _count: {
          select: {
            columns: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(boards)
  } catch (error) {
    console.error("Error fetching boards:", error)
    return NextResponse.json({ error: "An error occurred while fetching boards" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Create a new board
    const board = await prisma.kanbanBoard.create({
      data: {
        title,
        description,
        createdById: session.user.id,
        // Create default columns
        columns: {
          create: [
            { title: "To Do", order: 0 },
            { title: "In Progress", order: 1 },
            { title: "Done", order: 2 },
          ],
        },
        // Add creator as admin member
        members: {
          create: {
            userId: session.user.id,
            role: "admin",
          },
        },
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
        columns: true,
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

    return NextResponse.json(board, { status: 201 })
  } catch (error) {
    console.error("Error creating board:", error)
    return NextResponse.json({ error: "An error occurred while creating the board" }, { status: 500 })
  }
}


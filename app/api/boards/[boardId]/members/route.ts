import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: { boardId: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { boardId } = params

    // Check if user is admin of the board
    const boardMember = await prisma.boardMember.findFirst({
      where: {
        boardId,
        userId: session.user.id,
        role: "admin",
      },
    })

    if (!boardMember) {
      return NextResponse.json({ error: "Only board admins can add members" }, { status: 403 })
    }

    const body = await request.json()
    const { email, role } = body

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
    }

    // Validate role
    if (!["admin", "editor", "viewer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role. Must be 'admin', 'editor', or 'viewer'" }, { status: 400 })
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is already a member
    const existingMember = await prisma.boardMember.findFirst({
      where: {
        boardId,
        userId: user.id,
      },
    })

    if (existingMember) {
      // Update role if already a member
      const updatedMember = await prisma.boardMember.update({
        where: { id: existingMember.id },
        data: { role },
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
      return NextResponse.json(updatedMember)
    }

    // Add new member
    const newMember = await prisma.boardMember.create({
      data: {
        boardId,
        userId: user.id,
        role,
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

    return NextResponse.json(newMember, { status: 201 })
  } catch (error) {
    console.error("Error adding board member:", error)
    return NextResponse.json({ error: "An error occurred while adding the board member" }, { status: 500 })
  }
}


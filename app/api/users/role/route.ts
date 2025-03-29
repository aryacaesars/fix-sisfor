import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { role } = body

    if (!role || (role !== "student" && role !== "freelancer")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json({ error: "An error occurred while updating user role" }, { status: 500 })
  }
}


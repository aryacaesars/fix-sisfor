import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PUT(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const { name, code, lecturer, room, schedule } = await req.json()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (!name || !code || !lecturer) {
      return NextResponse.json(
        { error: "Name, code, and lecturer are required" },
        { status: 400 }
      )
    }

    const course = await db.course.update({
      where: {
        id: params.courseId,
        userId: session.user.id,
      },
      data: {
        name,
        code,
        lecturer,
        room,
        schedule,
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("[COURSE_PUT]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const course = await db.course.delete({
      where: {
        id: params.courseId,
        userId: session.user.id,
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("[COURSE_DELETE]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 
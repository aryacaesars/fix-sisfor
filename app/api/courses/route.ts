import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const courses = await db.course.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(courses)
  } catch (error) {
    console.error("[COURSES_GET]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
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

    const course = await db.course.create({
      data: {
        userId: session.user.id,
        name,
        code,
        lecturer,
        room,
        schedule,
      },
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error("[COURSES_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 
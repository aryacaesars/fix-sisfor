import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    // Build the where clause
    const where: any = {
      userId: session.user.id,
    }

    if (category) {
      where.category = category
    }

    // Get templates for the user
    const templates = await prisma.template.findMany({
      where,
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json(templates)
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json({ error: "An error occurred while fetching templates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, link } = body

    if (!title || !link) {
      return NextResponse.json({ error: "Title and link are required" }, { status: 400 })
    }

    // Create a new template
    const template = await prisma.template.create({
      data: {
        title,
        description,
        category: category || "general",
        link,
        userId: session.user.id,
      },
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json({ error: "An error occurred while creating the template" }, { status: 500 })
  }
}


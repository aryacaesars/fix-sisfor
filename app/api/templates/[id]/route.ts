import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Check if template exists and belongs to the user
    const existingTemplate = await prisma.template.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Update the template
    const updatedTemplate = await prisma.template.update({
      where: {
        id: params.id,
      },
      data: {
        title,
        description,
        category,
        link,
      },
    })

    return NextResponse.json(updatedTemplate)
  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { error: "An error occurred while updating the template" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if template exists and belongs to the user
    const existingTemplate = await prisma.template.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingTemplate) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 })
    }

    // Delete the template
    await prisma.template.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: "Template deleted successfully" })
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json(
      { error: "An error occurred while deleting the template" },
      { status: 500 }
    )
  }
} 
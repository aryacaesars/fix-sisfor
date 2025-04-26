import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!userSettings) {
      // Create default settings if not exists
      const defaultSettings = await prisma.userSettings.create({
        data: {
          userId: session.user.id,
          emailNotifications: true,
          theme: "system",
        },
      })
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json(userSettings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const body = await request.json()
    const { emailNotifications, theme } = body

    const updatedSettings = await prisma.userSettings.upsert({
      where: {
        userId: session.user.id,
      },
      update: {
        emailNotifications,
        theme,
      },
      create: {
        userId: session.user.id,
        emailNotifications,
        theme,
      },
    })

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 
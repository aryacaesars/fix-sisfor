import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    console.log("Session:", session) // Debug log

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })

    if (!user) {
      console.error("User not found:", session.user.id)
      return new NextResponse("User not found", { status: 404 })
    }

    const settings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
    })

    if (!settings) {
      try {
        // Create default settings if they don't exist
        const defaultSettings = await prisma.userSettings.create({
          data: {
            userId: session.user.id,
            emailNotifications: true,
            theme: "system",
          },
        })
        return NextResponse.json(defaultSettings)
      } catch (createError) {
        console.error("[SETTINGS_CREATE]", createError)
        return new NextResponse("Failed to create settings", { status: 500 })
      }
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("[SETTINGS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("Session:", session) // Debug log

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Verify if user exists
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
    })

    if (!user) {
      console.error("User not found:", session.user.id)
      return new NextResponse("User not found", { status: 404 })
    }

    const body = await req.json()
    const { emailNotifications, theme } = body

    try {
      const settings = await prisma.userSettings.upsert({
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

      return NextResponse.json(settings)
    } catch (upsertError) {
      console.error("[SETTINGS_UPSERT]", upsertError)
      return new NextResponse("Failed to update settings", { status: 500 })
    }
  } catch (error) {
    console.error("[SETTINGS_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 
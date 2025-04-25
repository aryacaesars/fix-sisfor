import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { sendEmail } from "@/lib/email"

export async function GET(req: Request) {
  try {
    // Get all users with email notifications enabled
    const users = await prisma.user.findMany({
      where: {
        settings: {
          emailNotifications: true,
        },
      },
      include: {
        settings: true,
        projects: {
          where: {
            status: "active",
          },
        },
      },
    })

    // Process notifications for each user
    for (const user of users) {
      if (!user.email) continue

      // Get projects that need attention
      const projectsNeedingAttention = user.projects.filter(project => {
        // Add your notification logic here
        // For example, check for upcoming deadlines, milestones, etc.
        return true // Replace with actual condition
      })

      if (projectsNeedingAttention.length > 0) {
        // Send email notification
        await sendEmail({
          to: user.email,
          subject: "Project Updates",
          html: `
            <h1>Project Updates</h1>
            <p>You have ${projectsNeedingAttention.length} projects that need your attention:</p>
            <ul>
              ${projectsNeedingAttention.map(project => `
                <li>${project.title}</li>
              `).join("")}
            </ul>
          `,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CRON_NOTIFICATIONS]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 
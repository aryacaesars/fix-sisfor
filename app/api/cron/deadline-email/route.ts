import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs'; // agar bisa pakai nodemailer

export async function GET(req: Request) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (token !== process.env.CRON_SECRET) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

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
            status: 'active',
            endDate: {
              gte: new Date(), // Projects that haven't ended yet
            },
          },
        },
      },
    });

    // Process notifications for each user
    for (const user of users) {
      if (!user.email) continue;

      // Get projects with upcoming deadlines (within 7 days)
      const today = new Date();
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const projectsWithUpcomingDeadlines = user.projects.filter(project => {
        const endDate = new Date(project.endDate);
        return endDate <= sevenDaysFromNow && endDate >= today;
      });

      if (projectsWithUpcomingDeadlines.length > 0) {
        // Send email notification
        await sendEmail({
          to: user.email,
          subject: 'Deadline Proyek Mendekat',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #333; text-align: center;">Deadline Proyek Mendekat</h2>
              <p>Halo ${user.name || 'Pengguna'},</p>
              <p>Anda memiliki ${projectsWithUpcomingDeadlines.length} proyek yang mendekati deadline dalam 7 hari ke depan:</p>
              <ul style="list-style: none; padding: 0;">
                ${projectsWithUpcomingDeadlines.map(project => {
                  const endDate = new Date(project.endDate);
                  const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return `
                    <li style="margin-bottom: 15px; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
                      <strong>${project.title}</strong><br>
                      Deadline: ${endDate.toLocaleDateString('id-ID')}<br>
                      Sisa waktu: ${daysLeft} hari
                    </li>
                  `;
                }).join('')}
              </ul>
              <p style="margin-top: 20px;">Silakan login ke dashboard Anda untuk melihat detail proyek.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
                <p>© ${new Date().getFullYear()} Ciao. All rights reserved.</p>
              </div>
            </div>
          `,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CRON_DEADLINE_EMAIL]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

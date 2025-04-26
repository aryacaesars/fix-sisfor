import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { Prisma } from '@prisma/client';

type UserWithAssignments = Prisma.UserGetPayload<{
  include: {
    settings: true;
    assignments: true;
  };
}>;

export const runtime = 'nodejs';

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
        role: 'student', // Only send to students
        settings: {
          emailNotifications: true,
        },
      },
      include: {
        settings: true,
        assignments: {
          where: {
            status: {
              not: 'completed', // Only include non-completed assignments
            },
            dueDate: {
              gte: new Date(), // Assignments that haven't passed due date
            },
          },
        },
      },
    }) as UserWithAssignments[];

    // Process notifications for each user
    for (const user of users) {
      if (!user.email) continue;

      // Get assignments with upcoming deadlines (within 7 days)
      const today = new Date();
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

      const assignmentsWithUpcomingDeadlines = user.assignments.filter((assignment) => {
        if (!assignment.dueDate) return false;
        const dueDate = new Date(assignment.dueDate);
        return dueDate <= sevenDaysFromNow && dueDate >= today;
      });

      if (assignmentsWithUpcomingDeadlines.length > 0) {
        // Send email notification
        await sendEmail({
          to: user.email,
          subject: 'Deadline Assignment Mendekat',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
              <h2 style="color: #333; text-align: center;">Deadline Assignment Mendekat</h2>
              <p>Halo ${user.name || 'Mahasiswa'},</p>
              <p>Anda memiliki ${assignmentsWithUpcomingDeadlines.length} assignment yang mendekati deadline dalam 7 hari ke depan:</p>
              <ul style="list-style: none; padding: 0;">
                ${assignmentsWithUpcomingDeadlines.map((assignment) => {
                  if (!assignment.dueDate) return '';
                  const dueDate = new Date(assignment.dueDate);
                  const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  return `
                    <li style="margin-bottom: 15px; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
                      <strong>${assignment.title}</strong><br>
                      Mata Kuliah: ${assignment.course || 'Tidak ada'}<br>
                      Deadline: ${dueDate.toLocaleDateString('id-ID')}<br>
                      Status: ${assignment.status}<br>
                      Sisa waktu: ${daysLeft} hari
                    </li>
                  `;
                }).join('')}
              </ul>
              <p style="margin-top: 20px;">Silakan login ke dashboard Anda untuk melihat detail assignment.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
                <p>© ${new Date().getFullYear()} SISFOR. Semua hak cipta dilindungi.</p>
              </div>
            </div>
          `,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CRON_ASSIGNMENT_EMAIL]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
} 
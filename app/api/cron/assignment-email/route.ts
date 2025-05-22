import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { Prisma } from '@prisma/client';
import { differenceInHours, differenceInDays } from 'date-fns';

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

      // Get assignments with H-1 day, H-12 jam, H-6 jam, H-1 jam (window diperlebar biar tidak miss)
      const now = new Date();
      const assignmentsForReminder = user.assignments.filter((assignment) => {
        if (!assignment.dueDate) return false;
        const dueDate = new Date(assignment.dueDate);
        const diffMs = dueDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        // H-1 hari: antara 23.5 - 24.5 jam
        if (diffHours <= 24.5 && diffHours > 23.5) return true;
        // H-12 jam: antara 11.5 - 12.5 jam
        if (diffHours <= 12.5 && diffHours > 11.5) return true;
        // H-6 jam: antara 5.5 - 6.5 jam
        if (diffHours <= 6.5 && diffHours > 5.5) return true;
        // H-1 jam: antara 0.5 - 1.5 jam
        if (diffHours <= 1.5 && diffHours > 0.5) return true;
        return false;
      });

      // Tambahkan log assignment yang masuk window
      console.log(`[CRON_ASSIGNMENT_EMAIL] User: ${user.email}, Assignments for reminder:`, assignmentsForReminder.map(a => ({
        title: a.title,
        dueDate: a.dueDate,
      })));

      if (assignmentsForReminder.length > 0) {
        try {
          console.log(`[CRON_ASSIGNMENT_EMAIL] Sending email to: ${user.email}`);
          await sendEmail({
            to: user.email,
            subject: 'Reminder Assignment Mendekati Deadline',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #333; text-align: center;">Reminder Assignment Mendekati Deadline</h2>
                <p>Halo ${user.name || 'Mahasiswa'},</p>
                <p>Berikut assignment yang segera deadline (H-1 hari, H-12 jam, H-6 jam, atau H-1 jam):</p>
                <ul style="list-style: none; padding: 0;">
                  ${assignmentsForReminder.map((assignment) => {
                    if (!assignment.dueDate) return '';
                    const dueDate = new Date(assignment.dueDate);
                    const diffMs = dueDate.getTime() - now.getTime();
                    const diffHours = diffMs / (1000 * 60 * 60);
                    let label = '';
                    if (diffHours <= 24.5 && diffHours > 23.5) label = 'H-1 Hari';
                    else if (diffHours <= 12.5 && diffHours > 11.5) label = 'H-12 Jam';
                    else if (diffHours <= 6.5 && diffHours > 5.5) label = 'H-6 Jam';
                    else if (diffHours <= 1.5 && diffHours > 0.5) label = 'H-1 Jam';
                    return `
                      <li style="margin-bottom: 15px; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">
                        <strong>${assignment.title}</strong><br>
                        Mata Kuliah: ${assignment.course || 'Tidak ada'}<br>
                        Deadline: ${dueDate.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}<br>
                        Status: ${assignment.status}<br>
                        <span style="color: #d97706; font-weight: bold;">${label}</span>
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
          console.log(`[CRON_ASSIGNMENT_EMAIL] Email sent to: ${user.email}`);
        } catch (err) {
          console.error(`[CRON_ASSIGNMENT_EMAIL] Failed to send email to ${user.email}:`, err);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CRON_ASSIGNMENT_EMAIL]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
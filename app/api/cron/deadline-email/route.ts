import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs'; // agar bisa pakai nodemailer

export async function GET(request: Request) {
  // Cek Authorization header
  const authHeader = request.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  if (!authHeader || !secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const today = new Date();
  const besok = new Date(today);
  besok.setDate(today.getDate() + 1);
  besok.setHours(0, 0, 0, 0);
  const besokEnd = new Date(besok);
  besokEnd.setHours(23, 59, 59, 999);

  try {
    // Assignment (student)
    const assignments = await prisma.assignment.findMany({
      where: {
        dueDate: {
          gte: besok,
          lte: besokEnd,
        },
      },
      include: { user: true },
    });
    console.log(`[CRON] Jumlah assignment deadline besok: ${assignments.length}`);

    // Project (freelancer)
    const projects = await prisma.project.findMany({
      where: {
        endDate: {
          gte: besok,
          lte: besokEnd,
        },
      },
      include: { user: true },
    });
    console.log(`[CRON] Jumlah project deadline besok: ${projects.length}`);

    // Kirim email assignment
    for (const assignment of assignments) {
      if (!assignment.user?.email) continue;
      try {
        await sendEmail({
          to: assignment.user.email,
          subject: `Reminder: Deadline Assignment Besok - ${assignment.title}`,
          html: `
            <p>Halo <b>${assignment.user.name || ''}</b>,</p>
            <p>Ini adalah pengingat bahwa assignment berikut akan deadline besok:</p>
            <ul>
              <li><b>Judul:</b> ${assignment.title}</li>
              <li><b>Mata Kuliah:</b> ${assignment.course || '-'}</li>
              <li><b>Deadline:</b> ${besok.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
            </ul>
            <p>Pastikan Anda menyelesaikan dan mengumpulkan assignment tepat waktu.</p>
            <p>Semangat dan sukses selalu!<br/>Tim Ciao</p>
          `,
        });
        console.log(`[CRON] Email assignment terkirim ke: ${assignment.user.email}`);
      } catch (err) {
        console.error(`[CRON] Gagal kirim email assignment ke: ${assignment.user.email}`, err);
      }
    }

    // Kirim email project
    for (const project of projects) {
      if (!project.user?.email) continue;
      try {
        await sendEmail({
          to: project.user.email,
          subject: `Reminder: Deadline Project Besok - ${project.title}`,
          html: `
            <p>Halo <b>${project.user.name || ''}</b>,</p>
            <p>Ini adalah pengingat bahwa project berikut akan deadline besok:</p>
            <ul>
              <li><b>Judul Project:</b> ${project.title}</li>
              <li><b>Klien:</b> ${project.clientName || '-'}</li>
              <li><b>Deadline:</b> ${besok.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</li>
            </ul>
            <p>Pastikan Anda menyelesaikan project ini sebelum deadline.</p>
            <p>Salam sukses,<br/>Tim Ciao</p>
          `,
        });
        console.log(`[CRON] Email project terkirim ke: ${project.user.email}`);
      } catch (err) {
        console.error(`[CRON] Gagal kirim email project ke: ${project.user.email}`, err);
      }
    }

    return NextResponse.json({ assignments: assignments.length, projects: projects.length });
  } catch (err) {
    console.error('[CRON] Error utama:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

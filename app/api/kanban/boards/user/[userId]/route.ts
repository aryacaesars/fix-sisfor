import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Get all boards where the user is a member
    const boards = await prisma.kanbanBoard.findMany({
      where: {
        OR: [
          { createdById: userId },
          { members: { some: { userId: userId } } },
        ],
      },
      include: {
        columns: {
          orderBy: {
            order: 'asc',
          },
          include: {
            tasks: {
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ boards });
  } catch (error) {
    console.error('Error fetching kanban boards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch kanban boards' },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    // Fetch assignments without assuming kanbanTask relation
    const assignments = await prisma.assignment.findMany({
      where: {
        userId: userId,
      },
      // Include only relations that actually exist in your schema
      include: {
        // Check your schema to ensure these relations exist
        user: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Return assignments directly without transformation for now
    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}
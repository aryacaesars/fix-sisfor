import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Get all columns for a specific board
export async function GET(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const boardId = params.boardId;

    // Check if user has access to the board
    const board = await prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    if (board.createdById !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Fetch columns with tasks
    const columns = await prisma.kanbanColumn.findMany({
      where: { boardId },
      orderBy: { order: "asc" },
      include: {
        tasks: {
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    return NextResponse.json(columns);
  } catch (error) {
    console.error("Error fetching columns:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Create a new column for a specific board
export async function POST(
  request: Request,
  { params }: { params: { boardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const boardId = params.boardId;
    const data = await request.json();

    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ error: "Column title is required" }, { status: 400 });
    }

    // Check if user has access to the board
    const board = await prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    if (board.createdById !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create the column
    const column = await prisma.kanbanColumn.create({
      data: {
        title: data.title,
        order: data.order || 0,
        boardId,
      },
    });

    return NextResponse.json(column);
  } catch (error) {
    console.error("Error creating column:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
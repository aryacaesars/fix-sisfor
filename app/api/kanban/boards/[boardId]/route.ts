import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

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

    // Fetch the board
    const board = await prisma.kanbanBoard.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Check if the user has access to this board
    if (board.createdById !== session.user.id) {
      // You could add more complex permission checks here
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("Error fetching board:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
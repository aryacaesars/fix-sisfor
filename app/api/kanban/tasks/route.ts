import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { title, description, priority, dueDate, columnId } = data;

    // Validate required fields
    if (!title || !columnId) {
      return NextResponse.json({ error: "Title and column ID are required" }, { status: 400 });
    }

    // Check if the column exists and user has access to it
    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    // Check if user has access to the board that contains this column
    if (column.board.createdById !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Create the task
    const task = await prisma.kanbanTask.create({
      data: {
        title,
        description: description || "",
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        columnId,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
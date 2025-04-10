
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.taskId;

    // Fetch the task with related data
    const task = await prisma.kanbanTask.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: { board: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user has access to the board that contains this task
    if (task.column.board.createdById !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.taskId;
    const data = await request.json();

    // Fetch the task to check if user has access
    const task = await prisma.kanbanTask.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: { board: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user has access to the board that contains this task
    if (task.column.board.createdById !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // If moving to a different column, check if the target column exists
    // and belongs to the same board
    if (data.columnId && data.columnId !== task.columnId) {
      const targetColumn = await prisma.kanbanColumn.findUnique({
        where: { id: data.columnId },
        include: { board: true },
      });

      if (!targetColumn) {
        return NextResponse.json({ error: "Target column not found" }, { status: 404 });
      }

      if (targetColumn.boardId !== task.column.boardId) {
        return NextResponse.json(
          { error: "Cannot move task to a column in a different board" },
          { status: 400 }
        );
      }
    }

    // Update the task
    const updatedTask = await prisma.kanbanTask.update({
      where: { id: taskId },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        columnId: data.columnId,
        assignedToId: data.assignedToId,
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const taskId = params.taskId;

    // Fetch the task to check if user has access
    const task = await prisma.kanbanTask.findUnique({
      where: { id: taskId },
      include: {
        column: {
          include: { board: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Check if user has access to the board that contains this task
    if (task.column.board.createdById !== session.user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Delete the task
    await prisma.kanbanTask.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
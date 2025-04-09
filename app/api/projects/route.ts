import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a freelancer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "freelancer") {
      return NextResponse.json({ error: "Only freelancers can access projects" }, { status: 403 });
    }

    // Get projects for the user
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({ error: "An error occurred while fetching projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a freelancer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (user?.role !== "freelancer") {
      return NextResponse.json({ error: "Only freelancers can access projects" }, { status: 403 });
    }

    const body = await request.json();
    console.log("Request Body:", body);

    const { title, description, client, startDate, endDate, budget, status, assignedTo } = body;

    if (!title || !client || !endDate || !budget || !assignedTo) {
      console.error("Validation Error: Missing required fields");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Create project with user ID from session
    const project = await prisma.project.create({
      data: {
        title,
        description,
        clientName: client,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: new Date(endDate),
        budget: parseFloat(budget),
        status,
        assignedTo,
        userId: session.user.id, // Set the user ID from the session
      },
    });

    console.log("Project Created:", project);

    // Create Kanban board with proper user ID
    const kanbanBoard = await prisma.kanbanBoard.create({
      data: {
        title: `${title} Board`,
        description: `Kanban board for project: ${title}`,
        createdById: session.user.id, // Use the authenticated user's ID
        columns: {
          create: [
            { title: "To Do", order: 1 },
            { title: "In Progress", order: 2 },
            { title: "Done", order: 3 },
          ],
        },
      },
    });

    console.log("Kanban Board Created:", kanbanBoard);

    // Update project with Kanban board ID
    await prisma.project.update({
      where: { id: project.id },
      data: { kanbanBoardId: kanbanBoard.id },
    });

    return NextResponse.json({ project, kanbanBoard }, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/projects:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


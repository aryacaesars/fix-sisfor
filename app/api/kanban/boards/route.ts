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

    // First, get all projects that have kanbanBoardId
    const projects = await prisma.project.findMany({
      where: { 
        userId: session.user.id,
        kanbanBoardId: { not: null }
      },
      orderBy: { updatedAt: "desc" }
    });

    // Then, fetch the corresponding boards
    const boardIds = projects.map(project => project.kanbanBoardId).filter(Boolean);
    
    const boards = await prisma.kanbanBoard.findMany({
      where: {
        id: { in: boardIds as string[] }
      }
    });

    // Match boards with projects
    const projectBoards = projects.map(project => {
      const board = boards.find(board => board.id === project.kanbanBoardId);
      
      return {
        id: project.kanbanBoardId,
        title: board?.title || `${project.title} Board`,
        description: board?.description || `Kanban board for ${project.title}`,
        createdAt: board?.createdAt || project.createdAt,
        updatedAt: board?.updatedAt || project.updatedAt,
        project: {
          id: project.id,
          title: project.title,
          status: project.status,
          clientName: project.clientName,
          endDate: project.endDate
        }
      };
    });

    return NextResponse.json(projectBoards);
  } catch (error) {
    console.error("Error fetching project Kanban boards:", error);
    return NextResponse.json({ error: "An error occurred while fetching boards" }, { status: 500 });
  }
}
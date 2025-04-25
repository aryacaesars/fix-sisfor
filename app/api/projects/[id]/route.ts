import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; 
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Only allow the project owner to access it
    if (project.userId !== session.user.id) {
      return NextResponse.json({ error: "You don't have access to this project" }, { status: 403 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", body);

    // Validasi data
    if (
      !body.title ||
      !body.clientName ||
      !body.startDate ||
      !body.endDate ||
      !body.budget ||
      !body.status ||
      !body.assignedTo
    ) {
      console.error("Invalid data:", body);
      return new NextResponse("Invalid data", { status: 400 });
    }

    // Periksa apakah project ada dan milik pengguna
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!existingProject) {
      console.error("Project not found:", params.id);
      return new NextResponse("Project not found", { status: 404 });
    }

    if (existingProject.userId !== session.user.id) {
      console.error("Forbidden access:", session.user.id);
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Perbarui project
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        title: body.title,
        clientName: body.clientName,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        budget: parseFloat(body.budget),
        status: body.status,
        assignedTo: body.assignedTo,
      },
    });

    console.log("Updated project:", updatedProject);
    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error("[PROJECT_PATCH_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if project exists and belongs to the user
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (existingProject.userId !== session.user.id) {
      return NextResponse.json({ error: "You don't have permission to delete this project" }, { status: 403 });
    }

    await prisma.project.delete({
      where: {
        id: params.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PROJECT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
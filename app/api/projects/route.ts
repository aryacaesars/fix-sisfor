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
      select: { id: true, role: true }
    });

    if (!user || user.role !== "freelancer") {
      return NextResponse.json({ error: "Only freelancers can create projects" }, { status: 403 });
    }

    const body = await request.json();
    console.log("Request Body:", body);

    // Check if clientName exists instead of client
    const { title, description, client, clientName, startDate, endDate, budget, status, assignedTo } = body;
    
    // Use either client or clientName (handle potential field name mismatch)
    const clientValue = client || clientName;

    // Enhanced validation with detailed error messages
    const missingFields = [];
    if (!title) missingFields.push("title");
    if (!clientValue) missingFields.push("client/clientName");
    if (!endDate) missingFields.push("endDate");
    if (budget === undefined) missingFields.push("budget");
    if (!assignedTo) missingFields.push("assignedTo");
    
    if (missingFields.length > 0) {
      console.error(`Validation Error: Missing fields: ${missingFields.join(", ")}`, body);
      return NextResponse.json({ 
        error: "Missing required fields", 
        fields: missingFields 
      }, { status: 400 });
    }

    // Rest of the code remains the same, but use clientValue for clientName
    // Validate budget is a number
    let budgetValue;
    try {
      budgetValue = parseFloat(budget);
      if (isNaN(budgetValue)) throw new Error("Not a number");
    } catch (error) {
      console.error("Validation Error: Budget must be a valid number", { budget });
      return NextResponse.json({ error: "Budget must be a valid number" }, { status: 400 });
    }

    // Validate dates
    let parsedStartDate, parsedEndDate;
    try {
      parsedStartDate = startDate ? new Date(startDate) : new Date();
      parsedEndDate = new Date(endDate);
      
      if (parsedEndDate.toString() === "Invalid Date") {
        throw new Error("Invalid end date format");
      }
    } catch (error) {
      console.error("Validation Error: Invalid date format", { startDate, endDate });
      return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
    }

    try {
      // Use a transaction to ensure all operations succeed or fail as a unit
      const result = await prisma.$transaction(async (tx) => {
        // Create project
        const projectData = {
          title,
          description: description || "",
          clientName: clientValue, // Use clientValue here instead of client
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          budget: budgetValue,
          status: status || "Not Started",
          assignedTo,
          userId: session.user.id,
        };
        
        console.log("Creating project with data:", projectData);
        
        const project = await tx.project.create({
          data: projectData
        });

        console.log("Project Created:", project);

        // Create Kanban board
        const kanbanData = {
          title: `${title} Board`,
          description: `Kanban board for project: ${title}`,
          createdById: session.user.id,
          columns: {
            create: [
              { title: "To Do", order: 1 },
              { title: "In Progress", order: 2 },
              { title: "Done", order: 3 },
            ],
          },
        };
        
        console.log("Creating kanban board with data:", kanbanData);
        
        const kanbanBoard = await tx.kanbanBoard.create({
          data: kanbanData
        });

        console.log("Kanban Board Created:", kanbanBoard);

        // Update project with Kanban board ID
        const updatedProject = await tx.project.update({
          where: { id: project.id },
          data: { kanbanBoardId: kanbanBoard.id },
        });

        return { project: updatedProject, kanbanBoard };
      });

      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      console.error("Transaction Error:", error);
      if (error instanceof Error) {
        if (error.message.includes("Foreign key constraint")) {
          return NextResponse.json({ 
            error: "Failed to create project", 
            details: "Reference constraint failed. Check assignedTo value."
          }, { status: 400 });
        }
      }
      throw error; // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error("Error in POST /api/projects:", error);
    return NextResponse.json({ 
      error: "Failed to create project", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}


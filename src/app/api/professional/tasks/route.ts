import { NextRequest, NextResponse } from "next/server";
import { professionalState } from "@/lib/services/professional-store";

export async function GET() {
  try {
    const tasks = await professionalState.getTasks();
    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    console.error("Error in GET /api/professional/tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch tasks." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Check if bulk action items array passed
    if (Array.isArray(body.tasks)) {
      const createdTasks = [];
      for (const t of body.tasks) {
        const newTask = await professionalState.addTask({
          title: t.title,
          description: t.description || `Extracted task for ${t.owner || "team"}`,
          priority: t.priority || "High",
          dueDate: t.dueDate || new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
          owner: t.owner || "Swati",
          status: t.status || "Todo",
          sourceId: t.sourceId,
        });
        createdTasks.push(newTask);
      }
      return NextResponse.json({ success: true, tasks: createdTasks });
    }

    const { title, description, priority, dueDate, owner, status, sourceId } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required." },
        { status: 400 }
      );
    }

    const newTask = await professionalState.addTask({
      title,
      description: description || "",
      priority: priority || "Medium",
      dueDate: dueDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
      owner: owner || "Swati",
      status: status || "Todo",
      sourceId,
    });

    return NextResponse.json({ success: true, task: newTask });
  } catch (error) {
    console.error("Error in POST /api/professional/tasks:", error);
    return NextResponse.json(
      { error: "Failed to create task." },
      { status: 500 }
    );
  }
}

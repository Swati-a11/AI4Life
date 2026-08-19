import { NextRequest, NextResponse } from "next/server";
import { professionalState } from "@/lib/services/professional-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await professionalState.updateTask(id, body);

    if (!updated) {
      return NextResponse.json({ error: "Task not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, task: updated });
  } catch (error) {
    console.error("Error in PATCH /api/professional/tasks/[id]:", error);
    return NextResponse.json(
      { error: "Failed to update task." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await professionalState.deleteTask(id);
    return NextResponse.json({ success: true, message: "Task deleted." });
  } catch (error) {
    console.error("Error in DELETE /api/professional/tasks/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete task." },
      { status: 500 }
    );
  }
}

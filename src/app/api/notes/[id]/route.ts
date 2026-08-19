import { NextRequest, NextResponse } from "next/server";
import { serverState } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const { id } = await params;
    const body = await req.json();
    const { title, content } = body;

    const updated = serverState.updateCentralNote(id, { title, content }, userId);
    if (!updated) {
      return NextResponse.json({ error: "Note not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      note: updated
    });
  } catch (error) {
    console.error("Error updating note:", error);
    return NextResponse.json({ error: "Failed to update note." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const { id } = await params;

    const deleted = serverState.deleteCentralNote(id, userId);
    if (!deleted) {
      return NextResponse.json({ error: "Note not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Note deleted."
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    return NextResponse.json({ error: "Failed to delete note." }, { status: 500 });
  }
}

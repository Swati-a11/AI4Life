import { NextRequest, NextResponse } from "next/server";
import { professionalState } from "@/lib/services/professional-store";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await professionalState.deleteMemory(id);
    return NextResponse.json({ success: true, message: "Memory preference deleted." });
  } catch (error) {
    console.error("Error in DELETE /api/professional/memory/[id]:", error);
    return NextResponse.json(
      { error: "Failed to delete memory preference." },
      { status: 500 }
    );
  }
}

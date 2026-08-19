import { NextRequest, NextResponse } from "next/server";
import { professionalState } from "@/lib/services/professional-store";

export async function GET() {
  try {
    const memories = await professionalState.getMemories();
    return NextResponse.json({ success: true, memories });
  } catch (error) {
    console.error("Error in GET /api/professional/memory:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI memories." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, preference } = body;

    if (!preference || typeof preference !== "string") {
      return NextResponse.json(
        { error: "Preference text is required." },
        { status: 400 }
      );
    }

    const newMemory = await professionalState.addMemory(
      category || "Professional Preference",
      preference
    );

    return NextResponse.json({ success: true, memory: newMemory });
  } catch (error) {
    console.error("Error in POST /api/professional/memory:", error);
    return NextResponse.json(
      { error: "Failed to save AI memory preference." },
      { status: 500 }
    );
  }
}

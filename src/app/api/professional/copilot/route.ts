import { NextRequest, NextResponse } from "next/server";
import { GeminiProfessionalAIService } from "@/lib/services/professional-ai-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, mode, workspaceId, contextIds } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    const copilotResult = await GeminiProfessionalAIService.runCopilotQuery(
      message,
      mode || "Explain",
      contextIds
    );

    return NextResponse.json({
      success: true,
      answer: copilotResult.answer,
      sources: copilotResult.sources,
      suggestedActions: copilotResult.suggestedActions,
      structuredResult: copilotResult.structuredResult,
    });
  } catch (error) {
    console.error("Error in /api/professional/copilot route:", error);
    return NextResponse.json(
      { error: "Couldn't generate a response. Please try again." },
      { status: 500 }
    );
  }
}

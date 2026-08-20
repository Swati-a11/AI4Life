import { NextRequest, NextResponse } from "next/server";
import { GeminiAIService } from "@/lib/services/ai-service";
import { AuthService } from "@/lib/services/auth-service";
import { getDb } from "@/lib/db/mongodb";
import { MessageDoc } from "@/lib/db/models";

export async function POST(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const body = await req.json();
    const {
      query,
      mode,
      persona,
      isStandalone,
      conversationId,
      memoryContext,
      conversationHistory,
      documentId
    } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    const selectedPersona = persona === "standalone" || isStandalone ? "standalone" : persona === "professional" ? "professional" : "friendly";
    const selectedMode = mode || "Explain";
    const activeConvId = conversationId || (userId ? `conv_${userId}_tutor` : "default_session");

    const db = await getDb();

    // Save student user message
    if (db && activeConvId) {
      const userMsgDoc: MessageDoc = {
        userId,
        conversationId: activeConvId,
        id: `msg_${Date.now()}_user`,
        sender: "user",
        content: query,
        timestamp: new Date().toISOString(),
      };
      await db.collection("messages").insertOne(userMsgDoc).catch(console.error);
    }

    const tutorResponse = await GeminiAIService.generateTutorResponse(
      query,
      selectedMode,
      selectedPersona,
      memoryContext,
      conversationHistory,
      activeConvId,
      documentId,
      userId
    );

    // Save assistant AI response
    if (db && activeConvId) {
      const aiMsgDoc: MessageDoc = {
        userId,
        conversationId: activeConvId,
        id: `msg_${Date.now()}_ai`,
        sender: "assistant",
        content: tutorResponse.responseText,
        timestamp: new Date().toISOString(),
      };
      await db.collection("messages").insertOne(aiMsgDoc).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      responseText: tutorResponse.responseText,
      codeSnippet: tutorResponse.codeSnippet,
      persona: selectedPersona,
      creditsDeducted: 0,
    });
  } catch (error) {
    console.error("Error in /api/tutor route:", error);
    return NextResponse.json(
      { error: "Couldn't generate a response. Please try again." },
      { status: 500 }
    );
  }
}

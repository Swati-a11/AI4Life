import { NextRequest, NextResponse } from "next/server";
import { GeminiAIService } from "@/lib/services/ai-service";
import { AuthService } from "@/lib/services/auth-service";
import { getDb } from "@/lib/db/mongodb";
import { UserDoc, MessageDoc } from "@/lib/db/models";

export async function POST(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const body = await req.json();
    const { query, mode, persona, isStandalone, conversationId, memoryContext, documentId } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    const selectedPersona = persona === "standalone" || isStandalone ? "standalone" : persona === "professional" ? "professional" : "friendly";
    const selectedMode = mode || "Explain";
    const activeConvId = conversationId || "default_session";

    // Deduct credits if DB is available
    const db = await getDb();
    if (db) {
      const user = (await db.collection("users").findOne({ userId })) as UserDoc | null;
      const currentCredits = user?.credits ?? 420;
      if (currentCredits < 10) {
        return NextResponse.json(
          { error: "Insufficient credits. Please upgrade your plan or purchase additional credits." },
          { status: 403 }
        );
      }

      await db.collection("users").updateOne({ userId }, { $inc: { credits: -10 } });
    }

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
      await db.collection("messages").insertOne(userMsgDoc);
    }

    const tutorResponse = await GeminiAIService.generateTutorResponse(
      query,
      selectedMode,
      selectedPersona,
      memoryContext,
      undefined,
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
      await db.collection("messages").insertOne(aiMsgDoc);
    }

    return NextResponse.json({
      success: true,
      responseText: tutorResponse.responseText,
      codeSnippet: tutorResponse.codeSnippet,
      persona: selectedPersona,
      creditsDeducted: 10,
    });
  } catch (error) {
    console.error("Error in /api/tutor route:", error);
    return NextResponse.json(
      { error: "Couldn't generate a response. Please try again." },
      { status: 500 }
    );
  }
}

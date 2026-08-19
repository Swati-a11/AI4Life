import { NextRequest, NextResponse } from "next/server";
import { GeminiAIService } from "@/lib/services/ai-service";
import { serverState } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";

export async function POST(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const body = await req.json();
    const { topic, docTitle, documentId, questionCount = 5, difficulty = "Medium", recordAttempt, attemptData } = body;

    // Handle recording completed quiz attempts
    if (recordAttempt && attemptData) {
      serverState.addQuizAttempt({
        topic: attemptData.topic || topic || "General Study Quiz",
        score: attemptData.score || 0,
        total: attemptData.total || questionCount,
        userId
      });
      return NextResponse.json({ success: true, message: "Quiz attempt saved to progress." });
    }

    let materialText: string | undefined = undefined;
    let targetTitle = topic || docTitle || "Study Material";

    if (documentId) {
      const doc = serverState.findDocument(documentId, userId);
      if (doc) {
        targetTitle = doc.title;
        materialText = doc.chunks.map((c) => c.text).join("\n\n");
      }
    }

    console.log("[Material Processing]", {
      sourceType: "quiz_generation",
      documentId: documentId || null,
      docTitle: targetTitle,
      userId,
      hasMaterialText: Boolean(materialText),
      processingStep: "Generating material-grounded 5-question MCQ quiz"
    });

    // Dynamic quiz generator (Strict Material Grounding!)
    const questions = await GeminiAIService.generateQuizFromDocument(
      targetTitle,
      questionCount,
      difficulty as "Easy" | "Medium" | "Hard",
      materialText
    );

    return NextResponse.json({
      success: true,
      questions,
      topic: targetTitle
    });
  } catch (error) {
    console.error("Error in /api/quiz route:", error);
    return NextResponse.json(
      { error: "Couldn't generate quiz. Please try again." },
      { status: 500 }
    );
  }
}

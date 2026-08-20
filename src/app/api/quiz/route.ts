import { NextRequest, NextResponse } from "next/server";
import { GeminiAIService } from "@/lib/services/ai-service";
import { serverState } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";
import { CreditService } from "@/lib/services/credit-service";

export async function POST(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const body = await req.json();
    const {
      topic,
      docTitle,
      documentId,
      questionCount = 5,
      difficulty = "Medium",
      recordAttempt,
      attemptData,
      idempotencyKey
    } = body;

    // Handle recording completed quiz attempts (free)
    if (recordAttempt && attemptData) {
      serverState.addQuizAttempt({
        topic: attemptData.topic || topic || "General Study Quiz",
        score: attemptData.score || 0,
        total: attemptData.total || questionCount,
        userId
      });
      return NextResponse.json({ success: true, message: "Quiz attempt saved to progress." });
    }

    // 1. PRE-CHECK: Check if user has at least 10 credits before generating
    const currentCredits = CreditService.getCredits(userId);
    if (currentCredits < 10) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "INSUFFICIENT_CREDITS",
          error: "Insufficient credits. You need at least 10 credits to generate a material quiz.",
          creditsRemaining: currentCredits
        },
        { status: 400 }
      );
    }

    let materialText: string | undefined = undefined;
    let targetTitle = topic || docTitle || "Study Material";

    // 2. MATERIAL VALIDATION: Verify material exists if documentId is provided
    if (documentId) {
      const doc = serverState.findDocument(documentId, userId);
      if (!doc) {
        return NextResponse.json(
          {
            success: false,
            error: "Material not found. Please upload or select a valid study material.",
            creditsRemaining: currentCredits
          },
          { status: 404 }
        );
      }
      targetTitle = doc.title;
      materialText = doc.chunks.map((c) => c.text).join("\n\n");
    }

    console.log("[Material Quiz Processing]", {
      documentId: documentId || null,
      docTitle: targetTitle,
      userId,
      hasMaterialText: Boolean(materialText),
      processingStep: "Generating material-grounded 5-question MCQ quiz"
    });

    // 3. GENERATE QUIZ: Dynamic quiz generator (Strict Material Grounding!)
    const questions = await GeminiAIService.generateQuizFromDocument(
      targetTitle,
      questionCount,
      difficulty as "Easy" | "Medium" | "Hard",
      materialText
    );

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Couldn't generate quiz from this material. Please try another material.",
          creditsRemaining: currentCredits
        },
        { status: 500 }
      );
    }

    // 4. ATOMIC DEDUCTION: Deduct 10 credits ONLY AFTER successful generation with idempotency protection
    const idKey = idempotencyKey || `quiz_gen_${Date.now()}`;
    const deduction = await CreditService.deductCreditsAsync(
      10,
      userId,
      idKey,
      `Material Quiz Generation — ${targetTitle}`
    );

    if (!deduction.success) {
      return NextResponse.json(
        {
          success: false,
          errorCode: "INSUFFICIENT_CREDITS",
          error: "Insufficient credits.",
          creditsRemaining: deduction.remainingCredits
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      questions,
      topic: targetTitle,
      creditsRemaining: deduction.remainingCredits,
      creditsUsed: 10,
      alreadyDeducted: deduction.alreadyProcessed || false
    });
  } catch (error) {
    console.error("Error in /api/quiz route:", error);
    return NextResponse.json(
      { error: "Couldn't generate quiz. Please try again." },
      { status: 500 }
    );
  }
}

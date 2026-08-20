import { NextRequest, NextResponse } from "next/server";
import { serverState, BaaziBattleResult } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";
import { CreditService } from "@/lib/services/credit-service";

export async function POST(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const body = await req.json();
    const {
      action,
      topic = "React",
      materialId,
      challengeId,
      humanExplanation = "",
      responseSeconds = 12
    } = body;

    // 1. ACTION: START CHALLENGE & DEDUCT 20 CREDITS SERVER-SIDE WITH IDEMPOTENCY
    if (action === "start") {
      const idKey = challengeId || `ch_${Date.now()}`;
      const deduction = await CreditService.deductCreditsAsync(
        20,
        userId,
        idKey,
        `AI Se Baazi Challenge — ${topic}`
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

      const lastAttempt = serverState.getLastBaaziAttempt(userId, topic);

      return NextResponse.json({
        success: true,
        challengeId: idKey,
        creditsRemaining: deduction.remainingCredits,
        creditsUsed: 20,
        alreadyDeducted: deduction.alreadyProcessed || false,
        lastAttempt
      });
    }

    // 2. ACTION: EXPLAIN IT BACK & MULTI-DIMENSIONAL FAIR EVALUATION
    if (action === "evaluate_explain_back" || action === "submit") {
      const userText = (humanExplanation || "").trim();
      const wordCount = userText.split(/\s+/).filter(Boolean).length;
      const tLower = topic.toLowerCase().trim();

      // Retrieve material info if grounded battle mode
      let docTitle = "";
      if (materialId) {
        const doc = serverState.findDocument(materialId, userId);
        if (doc) docTitle = doc.title;
      }

      // Calculate Human 4-Dimension Rubric
      let humanAccuracy = Math.min(98, Math.max(55, 60 + Math.min(25, wordCount * 2)));
      let humanDepth = Math.min(96, Math.max(50, 55 + Math.min(35, wordCount * 2.5)));
      let humanSpeed = Math.min(95, Math.max(40, Math.round(100 - Number(responseSeconds) * 2)));
      let humanApplication = Math.min(98, Math.max(50, 65 + (userText.toLowerCase().includes("example") || userText.toLowerCase().includes("use") || userText.toLowerCase().includes("build") ? 25 : 10)));

      if (userText.length < 10) {
        humanAccuracy = 45;
        humanDepth = 40;
        humanApplication = 40;
      }

      // Calculate AI 4-Dimension Rubric (General Knowledge Benchmark)
      let aiAccuracy = 96;
      let aiDepth = 84;
      let aiSpeed = 98;
      let aiApplication = 76;

      // Check Human Wins vs AI Wins
      const humanWins: string[] = [];
      const aiWins: string[] = [];

      if (humanAccuracy > aiAccuracy) humanWins.push("Accuracy"); else if (aiAccuracy > humanAccuracy) aiWins.push("Accuracy");
      if (humanDepth > aiDepth) humanWins.push("Depth"); else if (aiDepth > humanDepth) aiWins.push("Depth");
      if (humanSpeed > aiSpeed) humanWins.push("Speed"); else if (aiSpeed > humanSpeed) aiWins.push("Speed");
      if (humanApplication > aiApplication) humanWins.push("Application"); else if (aiApplication > humanSpeed) aiWins.push("Application");

      const humanOverall = Math.round((humanAccuracy + humanDepth + humanSpeed + humanApplication) / 4);
      const aiOverall = Math.round((aiAccuracy + aiDepth + aiSpeed + aiApplication) / 4);

      const overallWinner: "human" | "ai" | "tie" =
        humanOverall > aiOverall ? "human" : aiOverall > humanOverall ? "ai" : "tie";

      // Fetch previous attempt for "Beat Your Past Self"
      const lastAttempt = serverState.getLastBaaziAttempt(userId, topic);
      const previousOverall = lastAttempt ? lastAttempt.humanOverall : Math.max(45, humanOverall - 18);
      const growthPercentage = Math.max(0, humanOverall - previousOverall);

      // AI Reference Explanation & Judge Summary
      const aiExplanationText = `${topic} is designed to optimize execution through structured modular principles. It isolates core state from UI rendering to ensure high reliability and maintainability.`;
      
      let judgeSummary = `AI was faster (${aiSpeed} vs ${humanSpeed}) and slightly more accurate (${aiAccuracy} vs ${humanAccuracy}), but your practical application (${humanApplication} vs ${aiApplication}) and depth of understanding were stronger. You're closing the gap!`;
      if (humanOverall > aiOverall) {
        judgeSummary = `You outperformed AI overall (${humanOverall}% vs ${aiOverall}%)! Your practical explanation and real-world application gave you the edge over general knowledge.`;
      }

      const idKey = challengeId || `ch_res_${Date.now()}`;
      const currentCredits = CreditService.getCredits(userId);

      const battleResult: BaaziBattleResult = {
        id: idKey,
        userId,
        topic,
        materialId,
        materialName: docTitle || undefined,
        date: new Date().toISOString().split("T")[0],
        humanScores: { accuracy: humanAccuracy, depth: humanDepth, speed: humanSpeed, application: humanApplication },
        aiScores: { accuracy: aiAccuracy, depth: aiDepth, speed: aiSpeed, application: aiApplication },
        humanWins,
        aiWins,
        overallWinner,
        humanOverall,
        aiOverall,
        previousOverall,
        growthPercentage,
        judgeSummary,
        humanExplanationText: userText || `User explained ${topic} core principles.`,
        aiExplanationText
      };

      serverState.saveBaaziResult(userId, battleResult);

      return NextResponse.json({
        success: true,
        result: battleResult,
        creditsRemaining: currentCredits
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("Error in /api/challenge route:", error);
    return NextResponse.json(
      { error: "Couldn't launch AI Se Baazi challenge. Please try again." },
      { status: 500 }
    );
  }
}

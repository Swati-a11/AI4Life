import { NextRequest, NextResponse } from "next/server";
import { GeminiAIService } from "@/lib/services/ai-service";
import { serverState } from "@/lib/services/server-store";
import { QuizQuestion } from "@/lib/types/student-types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, docTitle, questionCount = 5, difficulty = "Medium", recordAttempt, attemptData } = body;

    // Handle recording completed quiz attempts
    if (recordAttempt && attemptData) {
      serverState.addQuizAttempt({
        topic: attemptData.topic || topic || "General Study Quiz",
        score: attemptData.score || 0,
        total: attemptData.total || questionCount
      });
      return NextResponse.json({ success: true, message: "Quiz attempt saved to progress." });
    }

    const targetTopic = topic || docTitle || "Database Systems & Operating Systems";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const prompt = `Generate a structured quiz with exactly ${questionCount} multiple choice questions on the topic "${targetTopic}" at difficulty level "${difficulty}".
Return strictly a valid JSON array of objects without any markdown wrappers or commentary:
[
  {
    "id": "q1",
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctOptionIndex": 1,
    "explanation": "Brief explanation of why this answer is correct."
  }
]`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeout);

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
            const parsedQuestions: QuizQuestion[] = JSON.parse(cleanJson);
            if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
              return NextResponse.json({
                success: true,
                questions: parsedQuestions,
                topic: targetTopic
              });
            }
          }
        }
      } catch (err) {
        console.warn("Gemini Quiz API call failed or timed out, using fallback quiz generator:", err);
      }
    }

    // Fallback structured quiz generator
    const questions = await GeminiAIService.generateQuizFromDocument(
      targetTopic,
      questionCount,
      difficulty as "Easy" | "Medium" | "Hard"
    );

    return NextResponse.json({
      success: true,
      questions,
      topic: targetTopic
    });
  } catch (error) {
    console.error("Error in /api/quiz route:", error);
    return NextResponse.json(
      { error: "Couldn't generate quiz. Please try again." },
      { status: 500 }
    );
  }
}

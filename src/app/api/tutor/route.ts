import { NextRequest, NextResponse } from "next/server";
import { GeminiAIService } from "@/lib/services/ai-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, mode, memoryContext } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const prompt = `You are AI4Life Tutor, an intelligent educational AI.
User Query: "${query}"
Selected Learning Mode: "${mode || "Explain"}"
${memoryContext ? `Student Context / Preferences: ${memoryContext}` : ""}

Provide a clear, highly educational, well-formatted markdown response.
If the query asks for Hinglish or simple explanations, adapt your tone accordingly.
Include key points, real-world examples, and a quick follow-up practice question at the end.`;

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
          const responseText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "Gemini response generated successfully.";
          
          return NextResponse.json({
            success: true,
            responseText,
            isLiveGemini: true
          });
        }
      } catch (err) {
        console.warn("Gemini live API call timed out or failed, falling back to intelligent tutor engine:", err);
      }
    }

    // Fallback response generator if GEMINI_API_KEY is not set or times out
    const tutorResponse = await GeminiAIService.generateTutorResponse(
      query,
      mode || "Explain",
      memoryContext
    );

    return NextResponse.json({
      success: true,
      responseText: tutorResponse.responseText,
      codeSnippet: tutorResponse.codeSnippet,
      isLiveGemini: false
    });
  } catch (error) {
    console.error("Error in /api/tutor route:", error);
    return NextResponse.json(
      { error: "Couldn't generate a response. Please try again." },
      { status: 500 }
    );
  }
}

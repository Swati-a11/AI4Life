import { NextRequest, NextResponse } from "next/server";
import { serverState } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";
import { GeminiAIService } from "@/lib/services/ai-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const { id } = await params;
    const body = await req.json();
    const { query } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query parameter is required." }, { status: 400 });
    }

    const doc = serverState.findDocument(id, userId);
    if (!doc) {
      return NextResponse.json({ error: "Material not found." }, { status: 404 });
    }

    const userMem = serverState.getUserLearningMemory(userId);
    const contextText = doc.chunks.map((c) => c.text).join("\n\n");

    // Check if extraction/transcription failed or yielded no audio
    const isFailedOrNoAudio =
      doc.processingStatus === "failed" ||
      doc.transcriptionStatus === "failed" ||
      doc.transcriptionStatus === "no_audio" ||
      contextText.toLowerCase().includes("couldn't extract spoken content") ||
      contextText.toLowerCase().includes("no spoken audio was detected") ||
      contextText.toLowerCase().includes("could not transcribe");

    if (isFailedOrNoAudio) {
      return NextResponse.json({
        success: true,
        isGrounded: false,
        responseText: "I couldn't extract spoken content from this video, so I can't reliably answer what was said in it.",
        citations: []
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `You are an AI assistant answering strictly based on the user's uploaded material context below.

Document Title: "${doc.title}"
Uploaded Material Context:
"""
${contextText.substring(0, 4000)}
"""

User Question: "${query}"

Instructions:
1. Answer the question using ONLY the provided material context above.
2. Keep your answer clear, concise, and accurate.
3. If the provided material context does not contain the answer, reply exactly: "I couldn't find that information in this material."`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          }
        );

        if (res.ok) {
          const data = await res.json();
          const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText) {
            const isGrounded = !responseText.includes("couldn't find");
            const formatted = GeminiAIService.applyExplanationStyleFormat(
              responseText,
              userMem.explanationStyle,
              userMem.customPreferences
            );

            return NextResponse.json({
              success: true,
              isGrounded,
              responseText: formatted,
              citations: doc.chunks.slice(0, 2).map((c) => ({
                title: doc.title,
                chunkText: c.text,
                page: c.page || 1
              }))
            });
          }
        }
      } catch (err) {
        console.warn("Gemini API call warning in material ask route:", err);
      }
    }

    const rawDefault = `Based on your material (**${doc.title}**):\n\n${doc.chunks[0]?.text || "Material content loaded."}`;
    const formattedDefault = GeminiAIService.applyExplanationStyleFormat(
      rawDefault,
      userMem.explanationStyle,
      userMem.customPreferences
    );

    return NextResponse.json({
      success: true,
      isGrounded: true,
      responseText: formattedDefault,
      citations: doc.chunks.slice(0, 1).map((c) => ({
        title: doc.title,
        chunkText: c.text,
        page: c.page || 1
      }))
    });
  } catch (err) {
    console.error("Error asking question about material:", err);
    return NextResponse.json({ error: "Couldn't generate answer from material." }, { status: 500 });
  }
}

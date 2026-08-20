import { NextRequest, NextResponse } from "next/server";
import { serverState } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";
import { GeminiAIService } from "@/lib/services/ai-service";
import { PdfService } from "@/lib/services/pdf-service";

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

    const doc = (await serverState.findDocumentAsync(id, userId)) || (await serverState.findDocumentAsync(id));
    if (!doc) {
      return NextResponse.json({ error: "Material not found." }, { status: 404 });
    }

    const userMem = serverState.getUserLearningMemory(userId);
    const cleanChunks = PdfService.sanitizeOrRecoverDocumentChunks(doc.chunks, doc.title);
    const contextText = cleanChunks.map((c) => c.text).join("\n\n");

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
        responseText: "I couldn't find that information in this material.\n\nYou can ask me something else about this material.",
        citations: []
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `You are a strict source-grounded assistant for AI4Life.
You MUST answer the user's question using ONLY the provided Source Material Content below.

Source Material Title: "${doc.title}"
Source Material Content:
"""
${contextText}
"""

User Question: "${query}"

STRICT GROUNDING RULES:
1. If the answer to the question is present in the Source Material Content above:
   - Answer accurately, naturally, and clearly using ONLY the facts from the material.
   - Mention relevant topics from the material naturally.
   - Do NOT invent or extrapolate facts not present in the material.

2. If the answer is NOT present in the Source Material Content:
   - You MUST reply EXACTLY with:
     "I couldn't find that information in this material."
   - You may optionally add: "You can ask me something else about this material."

3. NEVER answer using general external knowledge if the facts are missing from the material. For example, if asked "What is the capital of France?" when the document does not contain it, reply:
   "I couldn't find that information in this material."`;

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
            const isNotGrounded = responseText.toLowerCase().includes("couldn't find that information in this material");
            const finalAnswer = isNotGrounded
              ? "I couldn't find that information in this material.\n\nYou can ask me something else about this material."
              : GeminiAIService.applyExplanationStyleFormat(
                  responseText,
                  userMem.explanationStyle,
                  userMem.customPreferences
                );

            return NextResponse.json({
              success: true,
              isGrounded: !isNotGrounded,
              responseText: finalAnswer,
              citations: isNotGrounded ? [] : cleanChunks.slice(0, 2).map((c) => ({
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

    // Precise Keyword Matching Fallback when offline
    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    const stopWords = new Set(["what", "where", "when", "which", "who", "whom", "whose", "why", "how", "this", "that", "there", "their", "them", "these", "those", "have", "has", "had", "does", "done", "about", "is", "are", "was", "were", "the", "a", "an", "and", "or", "in", "on", "of", "to", "for"]);
    const queryWords = cleanQuery.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));

    const matchingChunk = cleanChunks.find((c) => {
      const lowerChunk = c.text.toLowerCase();
      return queryWords.some((w) => lowerChunk.includes(w));
    });

    if (matchingChunk && queryWords.length > 0) {
      const formattedDefault = GeminiAIService.applyExplanationStyleFormat(
        `Based on **${doc.title}**:\n\n${matchingChunk.text}`,
        userMem.explanationStyle,
        userMem.customPreferences
      );

      return NextResponse.json({
        success: true,
        isGrounded: true,
        responseText: formattedDefault,
        citations: [{
          title: doc.title,
          chunkText: matchingChunk.text,
          page: matchingChunk.page || 1
        }]
      });
    }

    return NextResponse.json({
      success: true,
      isGrounded: false,
      responseText: "I couldn't find that information in this material.\n\nYou can ask me something else about this material.",
      citations: []
    });

  } catch (err) {
    console.error("Error asking question about material:", err);
    return NextResponse.json({ error: "Couldn't generate answer from material." }, { status: 500 });
  }
}

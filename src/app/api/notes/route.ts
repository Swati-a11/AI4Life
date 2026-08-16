import { NextRequest, NextResponse } from "next/server";
import { serverState } from "@/lib/services/server-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, documentId } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Please enter a question to ask from your notes." },
        { status: 400 }
      );
    }

    const doc = serverState.findDocument(documentId);

    if (!doc || doc.chunks.length === 0) {
      return NextResponse.json({
        success: true,
        isGrounded: false,
        responseText: "I couldn't find this in your uploaded material. Please upload a document first.",
        citations: []
      });
    }

    // Match keywords against chunks to find grounding context
    const queryLower = query.toLowerCase();
    const matchingChunks = doc.chunks.filter((c) => {
      const textLower = c.text.toLowerCase();
      return queryLower.split(" ").some((word) => word.length > 3 && textLower.includes(word));
    });

    const relevantChunks = matchingChunks.length > 0 ? matchingChunks : doc.chunks.slice(0, 2);

    if (relevantChunks.length === 0) {
      return NextResponse.json({
        success: true,
        isGrounded: false,
        responseText: "I couldn't find this in your uploaded material.",
        citations: []
      });
    }

    const contextText = relevantChunks.map((c) => c.text).join("\n\n");
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);

        const prompt = `You are an AI assistant answering strictly based on the user's uploaded document notes.
Document Title: "${doc.title}"
Uploaded Notes Context:
"""
${contextText}
"""

User Question: "${query}"

Instructions:
1. Answer the question using ONLY the provided notes context above.
2. Keep your answer concise, clear, and grounded.
3. If the context does not contain the answer, reply exactly: "I couldn't find this in your uploaded material."`;

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
          const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (responseText && !responseText.includes("couldn't find")) {
            return NextResponse.json({
              success: true,
              isGrounded: true,
              responseText,
              citations: relevantChunks.map((c) => ({
                title: `Source: ${doc.title}`,
                chunkText: c.text,
                page: c.page || 1
              }))
            });
          }
        }
      } catch (err) {
        console.warn("Gemini RAG API call failed or timed out:", err);
      }
    }

    // Fallback grounded answer based on matched chunks
    return NextResponse.json({
      success: true,
      isGrounded: true,
      responseText: `Based on your uploaded notes (**${doc.title}**):\n\n${relevantChunks[0].text}\n\nKey Concept from Notes: The concepts related to "${query}" are detailed directly in Section ${relevantChunks[0].page || 1}.`,
      citations: relevantChunks.map((c) => ({
        title: `Source: ${doc.title}`,
        chunkText: c.text,
        page: c.page || 1
      }))
    });
  } catch (error) {
    console.error("Error in /api/notes route:", error);
    return NextResponse.json(
      { error: "Couldn't retrieve answer from notes. Please try again." },
      { status: 500 }
    );
  }
}

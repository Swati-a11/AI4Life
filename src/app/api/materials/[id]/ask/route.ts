import { NextRequest, NextResponse } from "next/server";
import { serverState } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";
import { PdfService } from "@/lib/services/pdf-service";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const { id } = await params;
    const body = await req.json();
    const { query, materialContent, materialTitle } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query parameter is required." }, { status: 400 });
    }

    // ── 1. Resolve material content ──────────────────────────────────────────
    // Try server-side state first (works locally), then fall back to client-supplied content
    let docTitle = materialTitle || "Uploaded Material";
    let contextText = "";

    const doc = (await serverState.findDocumentAsync(id, userId)) || (await serverState.findDocumentAsync(id));

    if (doc) {
      const cleanChunks = PdfService.sanitizeOrRecoverDocumentChunks(doc.chunks, doc.title);
      contextText = cleanChunks.map((c) => c.text).join("\n\n");
      docTitle = doc.title;

      // Check extraction failure markers
      const isFailedOrNoAudio =
        doc.processingStatus === "failed" ||
        doc.transcriptionStatus === "failed" ||
        doc.transcriptionStatus === "no_audio" ||
        contextText.toLowerCase().includes("couldn't extract spoken content") ||
        contextText.toLowerCase().includes("no spoken audio was detected");

      if (isFailedOrNoAudio) {
        return NextResponse.json({
          success: true,
          isGrounded: false,
          responseText: "I couldn't find that information in this material.\n\nYou can ask me something else about this material.",
          citations: []
        });
      }
    } else if (materialContent && typeof materialContent === "string" && materialContent.trim().length > 10) {
      // Fallback: use content passed by the client from localStorage cache
      contextText = materialContent;
      docTitle = materialTitle || "Uploaded Material";
    } else {
      return NextResponse.json({ error: "Material not found." }, { status: 404 });
    }

    console.log("[ASK_MATERIAL_DEBUG]", {
      materialId: id,
      materialTitle: docTitle,
      contentLength: contextText.length,
      query
    });

    // ── 2. Semantic chunk retrieval ──────────────────────────────────────────
    // Split content into overlapping ~500-char chunks for retrieval
    const retrievedChunks = retrieveRelevantChunks(contextText, query, 5);

    console.log("[ASK_MATERIAL_DEBUG] Retrieved chunks:", retrievedChunks.length);

    // ── 3. Gemini source-grounded answer generation ──────────────────────────
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && contextText.length > 10) {
      try {
        // Build retrieval context from top relevant chunks
        const retrievalContext = retrievedChunks.length > 0
          ? retrievedChunks.join("\n\n---\n\n")
          : contextText.substring(0, 8000); // fallback: first 8000 chars

        const prompt = `You are a precise source-grounded Q&A assistant for AI4Life.

Your ONLY job is to answer the user's question using the provided Source Material excerpts below. 

Source Material Title: "${docTitle}"
Source Material Excerpts (most relevant sections):
"""
${retrievalContext}
"""

User Question: "${query}"

STRICT RULES:
1. Read the source material excerpts carefully.
2. If the answer exists in the excerpts, answer the question directly and concisely using ONLY facts from the material.
   - Keep your answer focused on exactly what was asked.
   - Do NOT reproduce the entire section. Just answer the question.
   - Do NOT add information not present in the source.
3. If the answer is NOT present in the source material, respond EXACTLY with:
   "I couldn't find that information in this material."
4. NEVER use general external knowledge. If the document doesn't cover it, say so.
5. Format your answer clearly. Use bullet points only if listing multiple items.
6. Keep your answer concise — 2 to 5 sentences for simple questions, up to 8 for complex ones.`;

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 512
              }
            })
          }
        );

        if (res.ok) {
          const data = await res.json();
          const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

          if (responseText && responseText.length > 0) {
            const isNotGrounded = responseText.toLowerCase().startsWith("i couldn't find") ||
              responseText.toLowerCase().includes("i couldn't find that information in this material");

            // Build citation snippets from retrieved chunks
            const citations = isNotGrounded ? [] : retrievedChunks.slice(0, 2).map((chunk, idx) => ({
              title: docTitle,
              chunkText: chunk.substring(0, 200) + (chunk.length > 200 ? "..." : ""),
              page: idx + 1
            }));

            console.log("[ASK_MATERIAL_DEBUG] AI response length:", responseText.length, "| isGrounded:", !isNotGrounded);

            return NextResponse.json({
              success: true,
              isGrounded: !isNotGrounded,
              responseText: isNotGrounded
                ? "I couldn't find that information in this material.\n\nYou can ask me something else about this material."
                : responseText,
              citations
            });
          }
        }
      } catch (err) {
        console.warn("[ASK_MATERIAL] Gemini API error:", err);
      }
    }

    // ── 4. Fallback: keyword retrieval answer (no API key / API failure) ─────
    const stopWords = new Set(["what", "where", "when", "which", "who", "whom", "whose", "why", "how",
      "this", "that", "there", "their", "them", "these", "those", "have", "has", "had", "does",
      "done", "about", "is", "are", "was", "were", "the", "a", "an", "and", "or", "in", "on",
      "of", "to", "for", "do", "does", "did", "will", "would", "could", "should", "may", "might"]);

    const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    const queryKeywords = cleanQuery.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));

    const paragraphs = contextText.split(/\n\n+/).filter((p) => p.trim().length > 20);
    const scoredParagraphs = paragraphs.map((para) => {
      const paraLower = para.toLowerCase();
      const score = queryKeywords.reduce((acc, kw) => acc + (paraLower.includes(kw) ? 1 : 0), 0);
      return { para, score };
    });

    scoredParagraphs.sort((a, b) => b.score - a.score);
    const topPara = scoredParagraphs[0];

    if (topPara && topPara.score > 0 && queryKeywords.length > 0) {
      return NextResponse.json({
        success: true,
        isGrounded: true,
        responseText: `Based on **${docTitle}**:\n\n${topPara.para.trim()}`,
        citations: [{
          title: docTitle,
          chunkText: topPara.para.substring(0, 200),
          page: 1
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

/**
 * Retrieve the top-K most relevant chunks from full document text using keyword scoring.
 * Uses a sliding window approach with overlap to avoid cutting answers mid-sentence.
 */
function retrieveRelevantChunks(text: string, query: string, topK: number = 5): string[] {
  const stopWords = new Set(["what", "where", "when", "which", "who", "whom", "whose", "why", "how",
    "this", "that", "there", "their", "them", "these", "those", "have", "has", "had", "does",
    "done", "about", "is", "are", "was", "were", "the", "a", "an", "and", "or", "in", "on",
    "of", "to", "for", "do", "does", "did", "will", "would", "could", "should", "may", "might",
    "be", "been", "being", "its", "it", "we", "you", "they", "he", "she", "i", "me", "my",
    "your", "our", "their", "his", "her"]);

  // Extract meaningful query keywords
  const queryLower = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2 && !stopWords.has(w));

  if (queryWords.length === 0) {
    // If no meaningful keywords, return first 3000 chars
    return [text.substring(0, 3000)];
  }

  // Split into natural paragraphs first
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 15);

  if (paragraphs.length === 0) {
    return [text.substring(0, 3000)];
  }

  // Score each paragraph by keyword overlap (with partial/stem matching)
  const scored = paragraphs.map((para, idx) => {
    const paraLower = para.toLowerCase();
    let score = 0;

    for (const kw of queryWords) {
      if (paraLower.includes(kw)) {
        score += 2; // exact match
      } else {
        // Partial stem match (e.g. "scrum" matches "scrums", "scrumming")
        const stem = kw.substring(0, Math.max(4, Math.floor(kw.length * 0.75)));
        if (paraLower.includes(stem)) {
          score += 1;
        }
      }
    }

    return { para, score, idx };
  });

  // Sort by score desc
  scored.sort((a, b) => b.score - a.score);

  // Take top K, but also include adjacent paragraphs for surrounding context
  const selectedIndices = new Set<number>();
  const topItems = scored.slice(0, topK);

  for (const item of topItems) {
    if (item.score > 0) {
      // Include surrounding context (prev + next paragraph)
      if (item.idx > 0) selectedIndices.add(item.idx - 1);
      selectedIndices.add(item.idx);
      if (item.idx < paragraphs.length - 1) selectedIndices.add(item.idx + 1);
    }
  }

  if (selectedIndices.size === 0) {
    // No good match found — return first N paragraphs as fallback
    return paragraphs.slice(0, topK).map((p) => p.trim());
  }

  // Return selected paragraphs in their original document order
  const result: string[] = [];
  const sortedIndices = Array.from(selectedIndices).sort((a, b) => a - b);
  for (const idx of sortedIndices) {
    result.push(paragraphs[idx].trim());
  }

  return result;
}

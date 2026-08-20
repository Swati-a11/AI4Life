import { NextRequest, NextResponse } from "next/server";
import { serverState } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";
import { GeminiAIService } from "@/lib/services/ai-service";
import { PdfService } from "@/lib/services/pdf-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ success: false, error: "Material ID is required." }, { status: 400 });
    }

    // Lookup material: try user-filtered lookup first, then fallback to document ID across serverless lambdas/MongoDB
    const doc = (await serverState.findDocumentAsync(id, userId)) || (await serverState.findDocumentAsync(id));
    if (!doc) {
      return NextResponse.json({ success: false, error: "Material not found." }, { status: 404 });
    }

    // Self-heal and sanitize stored chunks
    const cleanChunks = PdfService.sanitizeOrRecoverDocumentChunks(doc.chunks, doc.title);
    const rawText = cleanChunks.map((c) => c.text).join("\n\n---\n\n");
    const cleanedText = GeminiAIService.cleanExtractedPdfText(rawText);

    const fullContent = cleanedText || cleanChunks.map((c) => c.text).join("\n\n") || "Could not extract readable content from this source.";

    return NextResponse.json({
      success: true,
      material: {
        id: doc.id,
        materialId: doc.id,
        name: doc.title,
        title: doc.title,
        type: doc.sourceType,
        sourceType: doc.sourceType,
        sizeMb: doc.sizeMb,
        uploadedAt: doc.uploadedAt,
        status: doc.processingStatus,
        content: fullContent,
        extractedText: fullContent,
        chunks: cleanChunks
      }
    });
  } catch (err) {
    console.error("Error fetching material:", err);
    return NextResponse.json({ success: false, error: "Couldn't retrieve material content." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const { id } = await params;

    const deleted = await serverState.deleteDocumentAsync(id, userId);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Material not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Material deleted." });
  } catch (err) {
    console.error("Error deleting material:", err);
    return NextResponse.json({ success: false, error: "Couldn't delete material." }, { status: 500 });
  }
}

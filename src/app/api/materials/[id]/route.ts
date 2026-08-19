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

    const doc = serverState.findDocument(id, userId);
    if (!doc) {
      return NextResponse.json({ error: "Material not found." }, { status: 404 });
    }

    if (doc.userId && doc.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized access to material." }, { status: 403 });
    }

    // Self-heal and sanitize stored chunks
    const cleanChunks = PdfService.sanitizeOrRecoverDocumentChunks(doc.chunks, doc.title);
    const rawText = cleanChunks.map((c) => c.text).join("\n\n---\n\n");
    const cleanedText = GeminiAIService.cleanExtractedPdfText(rawText);

    return NextResponse.json({
      success: true,
      material: {
        id: doc.id,
        title: doc.title,
        sourceType: doc.sourceType,
        sizeMb: doc.sizeMb,
        uploadedAt: doc.uploadedAt,
        status: doc.processingStatus,
        extractedText: cleanedText || "Could not extract readable content from this source.",
        chunks: cleanChunks
      }
    });
  } catch (err) {
    console.error("Error fetching material:", err);
    return NextResponse.json({ error: "Couldn't retrieve material content." }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const { id } = await params;

    const deleted = serverState.deleteDocument(id, userId);
    if (!deleted) {
      return NextResponse.json({ error: "Material not found or unauthorized." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Material deleted." });
  } catch (err) {
    console.error("Error deleting material:", err);
    return NextResponse.json({ error: "Couldn't delete material." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { professionalState } from "@/lib/services/professional-store";
import { QdrantRAGService } from "@/lib/services/rag-service";

export async function GET() {
  try {
    const docs = await professionalState.getDocuments();
    return NextResponse.json({ success: true, documents: docs });
  } catch (error) {
    console.error("Error in GET /api/professional/documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, fileType, sizeMb, textContent } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Document name is required." },
        { status: 400 }
      );
    }

    // Process chunking via existing RAG service infrastructure
    const ragResult = await QdrantRAGService.processDocumentUpload({
      name,
      sizeMb: sizeMb || 1.2,
    });

    const newDoc = await professionalState.addDocument({
      name,
      fileType: fileType || "pdf",
      sizeMb: sizeMb || 1.2,
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "Ready",
      chunksCount: ragResult.chunksGenerated,
      qdrantCollectionRef: ragResult.vectorCollectionRef,
      textContent: textContent || `Extracted content from ${name}. Key parameters: cost bounds, SLA timeline, technical specs.`,
    });

    return NextResponse.json({
      success: true,
      document: newDoc,
    });
  } catch (error) {
    console.error("Error in POST /api/professional/documents:", error);
    return NextResponse.json(
      { error: "Document processing failed. Please try again." },
      { status: 500 }
    );
  }
}

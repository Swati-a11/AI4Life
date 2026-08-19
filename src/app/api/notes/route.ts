import { NextRequest, NextResponse } from "next/server";
import { serverState, CentralSavedNote } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";

export async function GET(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const notes = serverState.getCentralSavedNotes(userId);

    return NextResponse.json({
      success: true,
      notes,
      savedNotes: notes
    });
  } catch (error) {
    console.error("Error in GET /api/notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch saved notes." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const body = await req.json();
    const {
      title,
      content,
      snippet,
      sourceType = "ai_tutor",
      sourceName = "AI Tutor",
      conversationId,
      materialId,
      action,
      id
    } = body;

    // Action: Delete Note
    if (action === "delete" && id) {
      const deleted = serverState.deleteCentralNote(id, userId);
      return NextResponse.json({ success: true, message: "Note deleted.", deleted });
    }

    const noteTitle = title || "Saved Note";
    const noteContent = content || snippet || title || "";

    if (!noteContent || noteContent.trim().length === 0) {
      return NextResponse.json(
        { error: "Note title or content is required to save." },
        { status: 400 }
      );
    }

    // Save with deduplication
    const result = serverState.saveCentralNote(
      {
        title: noteTitle,
        content: noteContent,
        sourceType,
        sourceName,
        conversationId,
        materialId
      },
      userId
    );

    return NextResponse.json({
      success: true,
      note: result.note,
      savedNotes: serverState.getCentralSavedNotes(userId),
      alreadySaved: result.alreadySaved,
      message: result.alreadySaved ? "Note already saved." : "Note saved."
    });
  } catch (error) {
    console.error("Error in POST /api/notes:", error);
    return NextResponse.json(
      { error: "Failed to save note." },
      { status: 500 }
    );
  }
}

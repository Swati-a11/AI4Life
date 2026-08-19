import { NextRequest, NextResponse } from "next/server";
import { serverState, formatSourceLabel } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";

export async function GET(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const centralNotes = serverState.getCentralSavedNotes(userId);

    const savedNotes = centralNotes.map((n) => ({
      id: n.id,
      title: n.title,
      type: n.sourceLabel,
      snippet: n.content,
      source: n.sourceName,
      date: n.createdAt
    }));

    return NextResponse.json({ success: true, savedNotes });
  } catch (error) {
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
    const { title, type, snippet, content, source, sourceType, action, id } = body;

    if (action === "delete" && id) {
      serverState.deleteCentralNote(id, userId);
      return NextResponse.json({ success: true, message: "Note deleted." });
    }

    const noteTitle = title || "Saved Note";
    const noteContent = content || snippet || title || "";

    if (!noteContent) {
      return NextResponse.json(
        { error: "Title and content are required." },
        { status: 400 }
      );
    }

    const result = serverState.saveCentralNote(
      {
        title: noteTitle,
        content: noteContent,
        sourceType: sourceType || "ai_tutor",
        sourceName: source || "AI Tutor"
      },
      userId
    );

    return NextResponse.json({
      success: true,
      note: result.note,
      message: result.alreadySaved ? "Note already saved." : "Note saved."
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save note." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { getDb } from "@/lib/db/mongodb";
import { DocumentDoc, ConversationDoc, QuizDoc, SavedNoteDoc } from "@/lib/db/models";

export async function GET(request: Request) {
  try {
    const userId = AuthService.getUserIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ success: true, results: [] });
    }

    const q = query.toLowerCase();
    const db = await getDb();

    if (db) {
      const docs = (await db
        .collection("documents")
        .find({ userId, name: { $regex: q, $options: "i" } })
        .limit(4)
        .toArray()) as DocumentDoc[];

      const convs = (await db
        .collection("conversations")
        .find({ userId, title: { $regex: q, $options: "i" } })
        .limit(4)
        .toArray()) as ConversationDoc[];

      const quizzes = (await db
        .collection("quizzes")
        .find({ userId, title: { $regex: q, $options: "i" } })
        .limit(4)
        .toArray()) as QuizDoc[];

      const notes = (await db
        .collection("saved_notes")
        .find({
          userId,
          $or: [
            { title: { $regex: q, $options: "i" } },
            { snippet: { $regex: q, $options: "i" } },
          ],
        })
        .limit(4)
        .toArray()) as SavedNoteDoc[];

      const results = [
        ...docs.map((d: DocumentDoc) => ({ id: d.id, title: d.name, type: "Material", tab: "materials", snippet: `${d.type} • ${d.size}` })),
        ...convs.map((c: ConversationDoc) => ({ id: c.id, title: c.title, type: "Conversation", tab: "tutor", snippet: `Persona: ${c.persona}` })),
        ...quizzes.map((q: QuizDoc) => ({ id: q.id, title: q.title, type: "Quiz", tab: "quiz-lab", snippet: `${q.subject} • ${q.difficulty}` })),
        ...notes.map((n: SavedNoteDoc) => ({ id: n.id, title: n.title, type: "Saved Note", tab: "saved", snippet: n.snippet })),
      ];

      return NextResponse.json({ success: true, results });
    }

    // Default search fallback
    return NextResponse.json({
      success: true,
      results: [
        { id: "m1", title: "Binary Search & Algorithms Notes.pdf", type: "Material", tab: "materials", snippet: "PDF • 2.4 MB" },
        { id: "c1", title: "Recursion & Dynamic Programming", type: "Conversation", tab: "tutor", snippet: "Persona: Friendly Tutor" },
        { id: "q1", title: "Data Structures & Time Complexity Quiz", type: "Quiz", tab: "quiz-lab", snippet: "Algorithms • Medium" },
      ].filter((r) => r.title.toLowerCase().includes(q) || r.snippet.toLowerCase().includes(q)),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Search failed." }, { status: 500 });
  }
}

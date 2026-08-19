import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { getDb } from "@/lib/db/mongodb";
import { ConversationDoc } from "@/lib/db/models";

export async function GET(request: Request) {
  try {
    const userId = await AuthService.getUserIdFromRequest(request);
    const db = await getDb();

    if (db) {
      const conversations = (await db
        .collection("conversations")
        .find({ userId })
        .sort({ updatedAt: -1 })
        .toArray()) as ConversationDoc[];

      return NextResponse.json({ success: true, conversations });
    }

    // Default fallback conversation
    return NextResponse.json({
      success: true,
      conversations: [
        {
          id: "conv_default",
          userId,
          title: "Introduction to Algorithms & Data Structures",
          persona: "friendly",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch conversations." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await AuthService.getUserIdFromRequest(request);
    const body = await request.json();
    const { action, conversationId, title, persona } = body;
    const db = await getDb();

    if (action === "create") {
      const newConv: ConversationDoc = {
        userId,
        id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: title || "New Study Session",
        persona: persona || "friendly",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (db) {
        await db.collection("conversations").insertOne(newConv);
      }

      return NextResponse.json({ success: true, conversation: newConv });
    }

    if (action === "rename" && conversationId && title) {
      if (db) {
        await db
          .collection("conversations")
          .updateOne({ userId, id: conversationId }, { $set: { title, updatedAt: new Date().toISOString() } });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "delete" && conversationId) {
      if (db) {
        await db.collection("conversations").deleteOne({ userId, id: conversationId });
        await db.collection("messages").deleteMany({ userId, conversationId });
      }
      return NextResponse.json({ success: true });
    }

    if (action === "clear" && conversationId) {
      if (db) {
        await db.collection("messages").deleteMany({ userId, conversationId });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Invalid conversation action." }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to update conversation." }, { status: 500 });
  }
}

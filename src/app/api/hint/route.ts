import { NextRequest, NextResponse } from "next/server";
import { GeminiAIService } from "@/lib/services/ai-service";
import { AuthService } from "@/lib/services/auth-service";
import { getDb } from "@/lib/db/mongodb";
import { UserDoc } from "@/lib/db/models";

export async function POST(req: NextRequest) {
  try {
    const userId = AuthService.getUserIdFromRequest(req);
    const body = await req.json();
    const { question, options } = body;

    if (!question) {
      return NextResponse.json({ error: "Question is required." }, { status: 400 });
    }

    const db = await getDb();
    if (db) {
      const user = (await db.collection("users").findOne({ clerkUserId: userId })) as UserDoc | null;
      const credits = user?.credits ?? 100;
      if (credits < 5) {
        return NextResponse.json({ error: "Insufficient credits for AI hint." }, { status: 403 });
      }
      await db.collection("users").updateOne({ clerkUserId: userId }, { $inc: { credits: -5 } });
    }

    const hintText = await GeminiAIService.generateHint(question, options);

    return NextResponse.json({
      success: true,
      hint: hintText,
      creditsDeducted: 5,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to generate hint." }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { serverState, ExplanationStyle } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";

export async function GET(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const memory = serverState.getUserLearningMemory(userId);
    const preferences = serverState.getPreferences(userId);

    return NextResponse.json({
      success: true,
      memory,
      preferences
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch student memory preferences." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const body = await req.json();
    const { action, style, category, preference } = body;

    // Update explanation style preference
    if (action === "update_style" && style) {
      const validStyles: ExplanationStyle[] = ["Bullet Points", "Paragraphs", "Short & Direct", "Step-by-Step"];
      if (!validStyles.includes(style as ExplanationStyle)) {
        return NextResponse.json({ error: "Invalid explanation style selected." }, { status: 400 });
      }

      const updatedMemory = serverState.updateExplanationStyle(userId, style as ExplanationStyle);
      return NextResponse.json({
        success: true,
        memory: updatedMemory,
        indicatorText: `AI explanation style updated to "${style}".`
      });
    }

    // Add custom preference
    if ((action === "add_custom" || category) && preference) {
      const catName = category || "Learning Preference";
      const newPref = serverState.addCustomLearningPreference(userId, catName, preference);
      const updatedMemory = serverState.getUserLearningMemory(userId);

      return NextResponse.json({
        success: true,
        preference: newPref,
        memory: updatedMemory,
        indicatorText: "AI4Life saved your custom learning preference."
      });
    }

    return NextResponse.json({ error: "Category and preference text or style action required." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to store memory preference." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { serverState } from "@/lib/services/server-store";

export async function GET() {
  try {
    const progress = serverState.getProgress();

    if (progress.quizzesAttempted === 0 && progress.recentChallenges.length === 0) {
      return NextResponse.json({
        success: true,
        hasActivity: false,
        message: "No activity yet."
      });
    }

    return NextResponse.json({
      success: true,
      hasActivity: true,
      progress
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch student progress stats." },
      { status: 500 }
    );
  }
}

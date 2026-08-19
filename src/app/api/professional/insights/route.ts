import { NextResponse } from "next/server";
import { professionalState } from "@/lib/services/professional-store";

export async function GET() {
  try {
    const insights = await professionalState.getInsights();
    return NextResponse.json({
      success: true,
      insights,
      hasData: insights.length > 0,
      emptyMessage: insights.length === 0 ? "Not enough activity to generate insights yet." : undefined,
    });
  } catch (error) {
    console.error("Error in GET /api/professional/insights:", error);
    return NextResponse.json(
      { error: "Failed to generate workspace insights." },
      { status: 500 }
    );
  }
}

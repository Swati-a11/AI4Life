import { NextRequest, NextResponse } from "next/server";
import { serverState } from "@/lib/services/server-store";

export async function GET() {
  try {
    const preferences = serverState.getPreferences();
    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch student memory preferences." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, preference } = body;

    if (!category || !preference) {
      return NextResponse.json(
        { error: "Category and preference text are required." },
        { status: 400 }
      );
    }

    const newPref = serverState.addPreference(category, preference);

    return NextResponse.json({
      success: true,
      preference: newPref,
      indicatorText: "AI4Life remembered your preference."
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to store memory preference." },
      { status: 500 }
    );
  }
}

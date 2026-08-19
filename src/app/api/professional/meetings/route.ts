import { NextRequest, NextResponse } from "next/server";
import { professionalState } from "@/lib/services/professional-store";
import { GeminiProfessionalAIService } from "@/lib/services/professional-ai-service";

export async function GET() {
  try {
    const meetings = await professionalState.getMeetings();
    return NextResponse.json({ success: true, meetings });
  } catch (error) {
    console.error("Error in GET /api/professional/meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, title } = body;

    if (!transcript || typeof transcript !== "string") {
      return NextResponse.json(
        { error: "Meeting transcript is required." },
        { status: 400 }
      );
    }

    const meetingAnalysis = await GeminiProfessionalAIService.analyzeMeetingTranscript(
      transcript,
      title
    );

    const savedMeeting = await professionalState.addMeeting(meetingAnalysis);

    return NextResponse.json({
      success: true,
      meeting: savedMeeting,
    });
  } catch (error) {
    console.error("Error in POST /api/professional/meetings:", error);
    return NextResponse.json(
      { error: "Meeting processing failed. Please try again." },
      { status: 500 }
    );
  }
}

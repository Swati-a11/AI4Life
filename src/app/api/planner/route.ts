import { NextRequest, NextResponse } from "next/server";
import { serverState } from "@/lib/services/server-store";
import { StudyTask } from "@/lib/types/student-types";

export async function GET() {
  try {
    const progress = serverState.getProgress();
    const weakTopics = progress.weakTopics.length > 0
      ? progress.weakTopics
      : ["3NF & Transitive Dependency", "Deadlock Wound-Wait Schemes"];

    const tasks: StudyTask[] = [
      {
        id: "t1",
        dayLabel: "Today",
        topic: `Revise ${weakTopics[0] || "2NF Normalization"} — 20 min`,
        subject: "Database Systems",
        estimatedMinutes: 20,
        completed: false
      },
      {
        id: "t2",
        dayLabel: "Tomorrow",
        topic: "Practice 10 Quiz Questions on Deadlock Schemes",
        subject: "Operating Systems",
        estimatedMinutes: 30,
        completed: false
      },
      {
        id: "t3",
        dayLabel: "Day 3",
        topic: "Take AI Se Baazi Challenge on Weak Topics",
        subject: "AI Se Baazi",
        estimatedMinutes: 25,
        completed: false
      }
    ];

    return NextResponse.json({ success: true, tasks });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate study planner." },
      { status: 500 }
    );
  }
}

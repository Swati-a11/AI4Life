import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { getDb } from "@/lib/db/mongodb";
import { UserDoc, DocumentDoc, QuizAttemptDoc, ChallengeAttemptDoc, StudyPlanDoc } from "@/lib/db/models";
import { NEW_USER_FREE_CREDITS } from "@/lib/config/pricing";

export async function GET(request: Request) {
  try {
    const userId = await AuthService.getUserIdFromRequest(request);
    const db = await getDb();

    if (db) {
      const user = (await db.collection("users").findOne({ clerkUserId: userId })) as UserDoc | null;
      const recentDocs = (await db.collection("documents").find({ userId }).sort({ date: -1 }).limit(3).toArray()) as DocumentDoc[];
      const recentQuizzes = (await db.collection("quiz_attempts").find({ userId }).sort({ date: -1 }).limit(3).toArray()) as QuizAttemptDoc[];
      const challenges = (await db.collection("challenge_attempts").find({ userId }).toArray()) as ChallengeAttemptDoc[];
      const studyPlan = (await db.collection("study_plans").findOne({ userId })) as StudyPlanDoc | null;

      const name = user?.name || "Swati Kumari";
      const credits = user?.credits ?? NEW_USER_FREE_CREDITS;
      const totalXP = challenges.reduce((sum: number, c: ChallengeAttemptDoc) => sum + (c.xpEarned || 0), 1250);
      const streak = recentQuizzes.length > 0 ? 5 : 0;

      return NextResponse.json({
        success: true,
        userName: name,
        credits,
        plan: user?.plan || "free",
        hasActivity: recentDocs.length > 0 || recentQuizzes.length > 0 || challenges.length > 0,
        recentDocs,
        recentQuizzes,
        streak,
        xp: totalXP,
        attendance: { percentage: 95, attended: 19, total: 20 },
        homework: { percentage: 92, completed: 11, pending: 1 },
        rating: { percentage: 88, score: 8.8 },
        studyTasks: studyPlan?.tasks || [],
      });
    }

    // Default response for dev
    return NextResponse.json({
      success: true,
      userName: "Swati Kumari",
      credits: NEW_USER_FREE_CREDITS,
      plan: "free",
      hasActivity: true,
      streak: 5,
      xp: 1250,
      attendance: { percentage: 95, attended: 19, total: 20 },
      homework: { percentage: 92, completed: 11, pending: 1 },
      rating: { percentage: 88, score: 8.8 },
      recentDocs: [],
      recentQuizzes: [],
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard data." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { AuthService } from "@/lib/services/auth-service";
import { UserService } from "@/lib/services/user-service";
import { getDb } from "@/lib/db/mongodb";
import { UserDoc } from "@/lib/db/models";

export async function POST(request: Request) {
  try {
    const clerkUserId = await AuthService.getUserIdFromRequest(request);
    const body = await request.json();
    const { action, name, email } = body;

    if (action === "sync" || action === "signup") {
      const user = await UserService.syncClerkUser(clerkUserId, name, email);
      return NextResponse.json({ success: true, user });
    }

    if (action === "logout") {
      return NextResponse.json({ success: true, message: "Logged out." });
    }

    return NextResponse.json({ success: false, error: "Invalid action." }, { status: 400 });
  } catch (err) {
    console.error("Auth API error:", err);
    return NextResponse.json({ success: false, error: "Server error during authentication." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const clerkUserId = await AuthService.getUserIdFromRequest(request);
    const db = await getDb();

    if (db) {
      const user = (await db.collection("users").findOne({ clerkUserId })) as UserDoc | null;
      if (user) {
        return NextResponse.json({
          success: true,
          user: {
            clerkUserId: user.clerkUserId,
            name: user.name,
            email: user.email,
            credits: user.credits || 420,
            plan: user.plan || "free",
            subscriptionStatus: user.subscriptionStatus || "inactive",
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        clerkUserId,
        name: "Swati Kumari",
        email: "swati@student.ai4life.com",
        credits: 420,
        plan: "free",
        subscriptionStatus: "inactive",
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch user session." }, { status: 500 });
  }
}

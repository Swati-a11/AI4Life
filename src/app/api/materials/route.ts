import { NextRequest, NextResponse } from "next/server";
import { serverState } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";

export async function GET(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    const materials = serverState.getDocuments(userId);
    return NextResponse.json({ success: true, materials });
  } catch (err) {
    console.error("Error fetching materials list:", err);
    return NextResponse.json({ error: "Couldn't retrieve materials list." }, { status: 500 });
  }
}

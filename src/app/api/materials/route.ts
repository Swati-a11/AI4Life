import { NextRequest, NextResponse } from "next/server";
import { serverState } from "@/lib/services/server-store";
import { AuthService } from "@/lib/services/auth-service";

export async function GET(req: NextRequest) {
  try {
    const userId = await AuthService.getUserIdFromRequest(req);
    let materials = await serverState.getDocumentsAsync(userId);

    // If specific userId has no materials, check if any global/default materials exist
    if (!materials || materials.length === 0) {
      if (userId !== "default_student_user") {
        const defaultMats = await serverState.getDocumentsAsync("default_student_user");
        if (defaultMats && defaultMats.length > 0) {
          materials = defaultMats;
        }
      }
      // Also fallback to any documents in memory/disk
      if (!materials || materials.length === 0) {
        const allDocs = serverState.getDocuments();
        if (allDocs && allDocs.length > 0) {
          materials = allDocs;
        }
      }
    }

    return NextResponse.json({
      success: true,
      materials: materials || []
    });
  } catch (err) {
    console.error("Error fetching materials list:", err);
    return NextResponse.json({ success: false, error: "Couldn't retrieve materials list." }, { status: 500 });
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  "/student(.*)",
  "/api/tutor(.*)",
  "/api/upload(.*)",
  "/api/materials(.*)",
  "/api/notes(.*)",
  "/api/planner(.*)",
  "/api/progress(.*)",
  "/api/memory(.*)",
  "/api/challenge(.*)",
]);

const hasClerkKeys = Boolean(
  process.env.CLERK_SECRET_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_")
);

export default function middleware(req: NextRequest, evt: any) {
  if (!hasClerkKeys) {
    return NextResponse.next();
  }

  return clerkMiddleware(async (auth, request) => {
    if (isProtectedRoute(request)) {
      const authObj = await auth();
      if (!authObj.userId) {
        if (request.nextUrl.pathname.startsWith("/api/")) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const signInUrl = new URL("/sign-in", request.url);
        signInUrl.searchParams.set("redirect_url", request.url);
        return NextResponse.redirect(signInUrl);
      }
    }
  })(req, evt);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|json|png|jpg|jpeg|webp|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Include Clerk frontend API route
    "/__clerk/(.*)",
  ],
};

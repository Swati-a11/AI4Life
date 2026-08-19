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
      await auth.protect();
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

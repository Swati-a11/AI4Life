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

const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const secKey = process.env.CLERK_SECRET_KEY;
const hasClerkKeys = Boolean(
  secKey &&
  pubKey &&
  pubKey.startsWith("pk_") &&
  !pubKey.includes("your_clerk_pub_key") &&
  pubKey.length > 25
);

export default function middleware(req: NextRequest, evt: any) {
  if (!hasClerkKeys) {
    return NextResponse.next();
  }

  try {
    return clerkMiddleware(async (auth, request) => {
      if (isProtectedRoute(request)) {
        try {
          const authObj = await auth();
          if (!authObj.userId) {
            if (request.nextUrl.pathname.startsWith("/api/")) {
              return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
            const signInUrl = new URL("/sign-in", request.url);
            signInUrl.searchParams.set("redirect_url", request.url);
            return NextResponse.redirect(signInUrl);
          }
        } catch (err) {
          console.warn("Clerk auth check warning in middleware:", err);
        }
      }
      return NextResponse.next();
    })(req, evt);
  } catch (err) {
    console.error("Middleware Clerk error, bypassing:", err);
    return NextResponse.next();
  }
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

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define protected routes (e.g., /student and all sub-routes)
const isProtectedRoute = createRouteMatcher([
  "/student(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const pubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isKeyValid = Boolean(
    pubKey &&
    pubKey.startsWith("pk_") &&
    !pubKey.includes("your_clerk_pub_key") &&
    !pubKey.includes("your_publishable_key")
  );

  // If request matches protected student routes and valid Clerk key is set, enforce authentication
  if (isProtectedRoute(req) && isKeyValid) {
    await auth.protect();
  }
});

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

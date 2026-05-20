import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  // Only protect /admin routes — all other routes (including /sign-in, /sign-up,
  // /cities, and /) are publicly accessible without authentication.
  if (isAdminRoute(req)) {
    await auth.protect();
  }

  // Forward the current pathname as a header so Server Components (layouts)
  // can read it without client-side hooks.
  const response = NextResponse.next();
  response.headers.set('x-next-pathname', req.nextUrl.pathname);
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

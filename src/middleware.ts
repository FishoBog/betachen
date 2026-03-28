import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/', '/property/(.*)', '/properties/(.*)', '/map', '/compare',
  '/diaspora', '/market',
  '/sign-in(.*)', '/sign-up(.*)',
  '/api/payments/webhook', '/api/cron/(.*)', '/api/telegram/(.*)',
  '/api/listings/payment/verify',
  '/owner/listings/(.*)/payment/success', // ✅ Allow Chapa redirect without bouncing to sign-in
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && !isPublicRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname + req.nextUrl.search); // ✅ Preserve full path + query params
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

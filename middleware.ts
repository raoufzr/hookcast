export { default } from 'next-auth/middleware';

// Gate everything under /dashboard behind a signed-in session.
// Unauthenticated users get redirected to /signin (configured in
// lib/auth.ts -> pages.signIn).
export const config = {
  matcher: ['/dashboard/:path*'],
};

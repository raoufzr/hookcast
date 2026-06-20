import type { DefaultSession } from 'next-auth';

// Module augmentation so `session.user.id` is typed without casts
// everywhere. The casts in route handlers stay for the JWT callback
// boundary, but components/pages can rely on this directly.
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

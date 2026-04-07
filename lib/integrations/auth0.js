// ── Auth0 Integration Boilerplate ──
// Alternative to NextAuth credentials provider for production-grade auth.
// To activate: npm install @auth0/nextjs-auth0
// Then add to .env.local:
//   AUTH0_SECRET=<long random string>
//   AUTH0_BASE_URL=https://fivesarena.com
//   AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
//   AUTH0_CLIENT_ID=<your client id>
//   AUTH0_CLIENT_SECRET=<your client secret>
//
// Usage:
//   See setup instructions below. Auth0 replaces the current credentials provider
//   with enterprise-grade features: MFA, social login, passwordless, etc.

/**
 * ── SETUP GUIDE ──
 *
 * 1. Install: npm install @auth0/nextjs-auth0
 *
 * 2. Create app/api/auth/[auth0]/route.js:
 *    ```js
 *    import { handleAuth } from '@auth0/nextjs-auth0';
 *    export const GET = handleAuth();
 *    ```
 *
 * 3. Wrap your layout with UserProvider:
 *    ```jsx
 *    import { UserProvider } from '@auth0/nextjs-auth0/client';
 *    <UserProvider>{children}</UserProvider>
 *    ```
 *
 * 4. Use in components:
 *    ```jsx
 *    import { useUser } from '@auth0/nextjs-auth0/client';
 *    const { user, isLoading } = useUser();
 *    ```
 *
 * 5. Protect API routes:
 *    ```js
 *    import { withApiAuthRequired, getSession } from '@auth0/nextjs-auth0';
 *    export const GET = withApiAuthRequired(async (req) => {
 *      const session = await getSession(req);
 *      // session.user has Auth0 profile
 *    });
 *    ```
 *
 * 6. Auth0 Dashboard setup:
 *    - Create a Regular Web Application
 *    - Set Allowed Callback URLs: https://fivesarena.com/api/auth/callback
 *    - Set Allowed Logout URLs: https://fivesarena.com
 *    - Enable Google social login connection
 *    - Optional: Enable MFA under Security → Multi-factor Auth
 *
 * ── MIGRATION FROM NEXTAUTH ──
 *
 * The current app uses NextAuth v4 with Google OAuth + Credentials.
 * To migrate to Auth0:
 *
 * 1. Keep existing MongoDB User model for user data
 * 2. Use Auth0 Actions (post-login) to sync user to MongoDB
 * 3. Map Auth0 user.sub to your User model
 * 4. Replace useSession() with useUser() across components
 * 5. Update API route auth checks from getServerSession to getSession
 *
 * Benefits of Auth0 over current setup:
 * - Built-in MFA/2FA
 * - Social login (Google, Facebook, Apple, etc.)
 * - Passwordless (magic link, SMS)
 * - Better security (no password storage in your DB)
 * - User management dashboard
 * - Rate limiting and bot detection built-in
 */

// Helper to check if Auth0 is configured
export function isAuth0Configured() {
  return !!(
    process.env.AUTH0_SECRET &&
    process.env.AUTH0_BASE_URL &&
    process.env.AUTH0_ISSUER_BASE_URL &&
    process.env.AUTH0_CLIENT_ID &&
    process.env.AUTH0_CLIENT_SECRET
  );
}

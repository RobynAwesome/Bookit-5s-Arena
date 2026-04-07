import GoogleProviderImport from 'next-auth/providers/google';
import FacebookProviderImport from 'next-auth/providers/facebook';
import CredentialsProviderImport from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const GoogleProvider = GoogleProviderImport.default || GoogleProviderImport;
const FacebookProvider = FacebookProviderImport.default || FacebookProviderImport;
const CredentialsProvider = CredentialsProviderImport.default || CredentialsProviderImport;

// Auto-generate a @handle from a display name: "John Doe" → "john_doe"
const makeUsername = (name = '') =>
  name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 30) || 'player';

export const authOptions = {
  providers: [
    // ── Google OAuth2 ──────────────────────────────────────────
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // ── Facebook OAuth — only active when credentials are configured ──
    // To enable: add FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET to .env.local
    // Then set NEXT_PUBLIC_FACEBOOK_ENABLED=true in .env.local
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? [
          FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          }),
        ]
      : []),

    // ── Email + Password ───────────────────────────────────────
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Ensure email and password are strings to prevent NoSQL injection
        if (typeof credentials.email !== 'string' || typeof credentials.password !== 'string') {
          throw new Error('Invalid credentials format');
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email.toLowerCase().trim() });

        if (!user || !user.password) {
          throw new Error('No account found with this email');
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error('Incorrect password');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          roles: user.roles || [user.role || 'user'],
          activeRole: 'user',
          username: user.username,
          image: user.profileImage || user.image,
        };
      },
    }),
  ],

  session: {
    strategy: 'jwt',
  },

  callbacks: {
    // Add id, role and username to the JWT token
    async jwt({ token, user, account, trigger, session: updateSession }) {
      // Handle session.update() calls from the client
      if (trigger === 'update' && updateSession) {
        if (updateSession.name !== undefined) token.name = updateSession.name;
        if (updateSession.username !== undefined) token.username = updateSession.username;
        if (updateSession.image !== undefined) token.picture = updateSession.image;
        // Role switching: validate the requested role is in the user's roles array
        if (updateSession.activeRole !== undefined) {
          if (token.roles && token.roles.includes(updateSession.activeRole)) {
            token.activeRole = updateSession.activeRole;
            token.role = updateSession.activeRole;
          }
        }
        return token;
      }

      if (user) {
        token.id = user.id;
        token.roles = user.roles || [user.role || 'user'];
        token.activeRole = 'user'; // Always default to 'user' on login
        token.role = 'user';       // Backward compat alias
        token.username = user.username;
        if (user.image) token.picture = user.image;
      }

      // Handle social sign-in: upsert user in DB
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        await connectDB();
        let dbUser = await User.findOne({ email: token.email });

        if (!dbUser) {
          // New social user — auto-generate username from their name
          dbUser = await User.create({
            name: token.name,
            email: token.email,
            image: token.picture,
            username: makeUsername(token.name),
            roles: ['user'],
          });
        } else if (!dbUser.username) {
          // Back-fill username for existing users who don't have one yet
          dbUser.username = makeUsername(dbUser.name);
          await dbUser.save();
        }

        token.id = dbUser._id.toString();
        token.roles = dbUser.roles || [dbUser.role || 'user'];
        token.activeRole = 'user'; // Always default to 'user' on login
        token.role = 'user';       // Backward compat alias
        token.username = dbUser.username;
        // Prefer user's uploaded avatar over the OAuth picture
        if (dbUser.profileImage) token.picture = dbUser.profileImage;
      }

      // On every JWT refresh (not sign-in, not update): if the token doesn't
      // already hold a local avatar, pull profileImage from the DB once.
      // After the first successful sync the URL starts with '/' and we skip future DB calls.
      if (!user && !account && trigger !== 'update' && token.id) {
        if (!token.picture || !String(token.picture).startsWith('/')) {
          await connectDB();
          const dbUser = await User.findById(token.id).select('profileImage').lean();
          if (dbUser?.profileImage) token.picture = dbUser.profileImage;
        }
      }

      return token;
    },

    // Expose id, roles, activeRole, username and image on the session object
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.roles = token.roles || ['user'];
        session.user.activeRole = token.activeRole || 'user';
        session.user.role = token.activeRole || 'user'; // Backward compat alias
        session.user.username = token.username;
        if (token.picture) session.user.image = token.picture;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  secret: process.env.NEXTAUTH_SECRET,
};

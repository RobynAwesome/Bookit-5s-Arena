export const dynamic = 'force-dynamic';

// Lazy-load NextAuth + authOptions to prevent webpack bundle crash during
// build-time "Collecting page data" phase.
let _handler;
async function getHandler() {
  if (!_handler) {
    const nextAuthModule = await import('next-auth');
    const NextAuth = nextAuthModule.default?.default || nextAuthModule.default;
    const { authOptions } = await import('@/lib/authOptions');
    _handler = NextAuth(authOptions);
  }
  return _handler;
}

export async function GET(req, ctx) {
  const handler = await getHandler();
  return handler(req, ctx);
}

export async function POST(req, ctx) {
  const handler = await getHandler();
  return handler(req, ctx);
}

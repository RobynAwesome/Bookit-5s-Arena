export const dynamic = 'force-dynamic';

// Lazy-load NextAuth + authOptions to prevent webpack bundle crash during
// build-time "Collecting page data" phase.
let _handler;
async function getHandler() {
  if (!_handler) {
    const { default: NextAuth } = await import('next-auth');
    const { authOptions } = await import('@/lib/authOptions');
    _handler = NextAuth(authOptions);
  }
  return _handler;
}

export async function GET(req) {
  const handler = await getHandler();
  return handler(req);
}

export async function POST(req) {
  const handler = await getHandler();
  return handler(req);
}

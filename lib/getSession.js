/**
 * Lazy-loading wrapper for getServerSession + authOptions.
 *
 * Next.js evaluates every route module at build time ("Collecting page data").
 * Top-level imports of next-auth / authOptions trigger webpack-bundled provider
 * code that crashes during that phase.  By deferring the imports to an async
 * function we guarantee they only run at request time.
 */
export async function getAuthSession() {
  const { getServerSession } = await import('next-auth');
  const { authOptions }      = await import('@/lib/authOptions');
  return getServerSession(authOptions);
}

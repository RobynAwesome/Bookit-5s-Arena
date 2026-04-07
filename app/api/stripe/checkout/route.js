export const dynamic = 'force-dynamic';
/**
 * Stripe checkout — temporarily disabled.
 * Payment integration will be re-enabled in a future release.
 */
export async function POST() {
  return Response.json(
    { error: 'Online payments are not yet active. Please contact the venue directly to book.' },
    { status: 503 }
  );
}

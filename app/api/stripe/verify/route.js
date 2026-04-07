export const dynamic = 'force-dynamic';
/**
 * Stripe verify — temporarily disabled.
 * Payment integration will be re-enabled in a future release.
 */
export async function POST() {
  return Response.json(
    { error: 'Payment verification not yet active.' },
    { status: 503 }
  );
}

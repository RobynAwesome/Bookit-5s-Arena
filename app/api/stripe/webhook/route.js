export const dynamic = 'force-dynamic';
/**
 * Stripe webhook — temporarily disabled.
 * Payment integration will be re-enabled in a future release.
 */
export async function POST() {
  return Response.json({ received: false }, { status: 503 });
}

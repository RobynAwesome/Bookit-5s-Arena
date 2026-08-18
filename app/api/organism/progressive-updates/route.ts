import { NextResponse } from 'next/server';
import { submitKpgsProgressiveUpdate } from '@/lib/kpgs/domainAdapterClient';
import { isKpgsProgressiveUpdate } from '@/lib/kpgs/progressiveUpdateContract';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

const noStore = { 'Cache-Control': 'no-store' };

export async function POST(request: Request) {
  let update: unknown;
  try {
    update = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400, headers: noStore });
  }

  if (!isKpgsProgressiveUpdate(update)) {
    return NextResponse.json(
      { error: 'invalid-kpgs-progressive-update' },
      { status: 422, headers: noStore },
    );
  }

  const admitted =
    update.node_id.startsWith('fivesarena:locality:province:') &&
    update.lane === 'arena.public-state' &&
    update.context_route === 'fivesarena.locality' &&
    update.protocol === 'FIVESARENA_LOCALITY_PREFERENCE_V1' &&
    update.state_class === 'non_authoritative' &&
    update.authority_effect === 'none' &&
    update.boundary_marker === '#NB' &&
    ['CREATE', 'UPDATE'].includes(update.operation);

  if (!admitted) {
    return NextResponse.json(
      { error: 'progressive-update-outside-locality-pilot' },
      { status: 403, headers: noStore },
    );
  }

  const result = await submitKpgsProgressiveUpdate(update);
  if (!result.receipt) {
    return NextResponse.json(
      {
        schema: 'fivesarena.progressive-adapter.v1',
        state: 'pending',
        receipt: null,
        reason: result.reason,
        adapter: {
          configured: result.adapter.configured,
          status: result.adapter.status,
          checkedAt: result.adapter.checkedAt,
        },
      },
      { status: 202, headers: noStore },
    );
  }

  const receipt = result.receipt;
  const status =
    receipt.disposition === 'APPLIED' && receipt.synchronized
      ? 200
      : receipt.disposition === 'REJECTED'
        ? 422
        : 409;

  return NextResponse.json(
    {
      schema: 'fivesarena.progressive-adapter.v1',
      state: receipt.disposition.toLowerCase(),
      receipt,
      adapter: {
        configured: result.adapter.configured,
        status: result.adapter.status,
        checkedAt: result.adapter.checkedAt,
      },
    },
    { status, headers: noStore },
  );
}

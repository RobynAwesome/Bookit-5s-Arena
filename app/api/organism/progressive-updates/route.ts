import { NextResponse } from 'next/server';
import { syncKpgsProgressiveUpdate } from '@/lib/kpgs/domainAdapterClient';
import {
  isSwfusProgressiveUpdate,
  type SwfusReceipt,
} from '@/lib/kpgs/progressiveUpdateContract';

export const dynamic = 'force-dynamic';
export const maxDuration = 10;

type RequestBody = {
  update?: unknown;
  localReceipt?: SwfusReceipt | null;
};

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { error: 'invalid-json', syncState: 'severed' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  if (!isSwfusProgressiveUpdate(body.update)) {
    return NextResponse.json(
      { error: 'invalid-progressive-update-contract', syncState: 'severed' },
      { status: 422, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  // This bounded pilot accepts only the existing low-risk locality preference.
  // Bookings, auth, payments, account data and other privileged operations never
  // enter this public organism membrane.
  if (body.update.nodeId !== 'fivesarena:locality:province') {
    return NextResponse.json(
      { error: 'node-not-authorized-for-organism-pilot', syncState: 'severed' },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const result = await syncKpgsProgressiveUpdate(body.update);
  if (result.receipt) {
    return NextResponse.json(
      {
        schema: 'fivesarena.progressive-update-sync.v1',
        state: 'synced',
        receipt: result.receipt,
        adapter: {
          configured: result.configured,
          status: result.adapterStatus,
          checkedAt: result.checkedAt,
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  // 202 communicates that the local witness is valid but canonical transport is
  // not yet proven. The client keeps the receipt pending and retries on reconnect.
  return NextResponse.json(
    {
      schema: 'fivesarena.progressive-update-sync.v1',
      state: 'pending_sync',
      receipt: body.localReceipt ?? null,
      reason: result.reason,
      adapter: {
        configured: result.configured,
        status: result.adapterStatus,
        checkedAt: result.checkedAt,
      },
    },
    { status: 202, headers: { 'Cache-Control': 'no-store' } },
  );
}

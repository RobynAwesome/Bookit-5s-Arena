import {
  isSwfusReceipt,
  type SwfusProgressiveUpdate,
  type SwfusReceipt,
} from './progressiveUpdateContract';

type AdapterState = {
  configured: boolean;
  status: 'contract-only' | 'ready' | 'degraded';
  origin: string | null;
  health: Record<string, unknown> | null;
  version: Record<string, unknown> | null;
  checkedAt: string;
};

export type ProgressiveUpdateSyncResult = {
  configured: boolean;
  adapterStatus: AdapterState['status'];
  receipt: SwfusReceipt | null;
  reason: string | null;
  checkedAt: string;
};

const ADAPTER_ORIGIN = process.env.KPGS_DOMAIN_ADAPTER_ORIGIN?.replace(/\/$/, '') || null;
const ADAPTER_TIMEOUT_MS = 1200;

async function readJson(path: string) {
  if (!ADAPTER_ORIGIN) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ADAPTER_TIMEOUT_MS);

  try {
    const response = await fetch(`${ADAPTER_ORIGIN}${path}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getKpgsDomainAdapterState(): Promise<AdapterState> {
  const checkedAt = new Date().toISOString();

  if (!ADAPTER_ORIGIN) {
    return {
      configured: false,
      status: 'contract-only',
      origin: null,
      health: null,
      version: null,
      checkedAt,
    };
  }

  const [health, version] = await Promise.all([
    readJson('/kpgs/health'),
    readJson('/kpgs/version'),
  ]);

  return {
    configured: true,
    status: health && version ? 'ready' : 'degraded',
    origin: ADAPTER_ORIGIN,
    health,
    version,
    checkedAt,
  };
}

export async function syncKpgsProgressiveUpdate(
  update: SwfusProgressiveUpdate,
): Promise<ProgressiveUpdateSyncResult> {
  const checkedAt = new Date().toISOString();
  const adapter = await getKpgsDomainAdapterState();

  if (!ADAPTER_ORIGIN || adapter.status !== 'ready') {
    return {
      configured: Boolean(ADAPTER_ORIGIN),
      adapterStatus: adapter.status,
      receipt: null,
      reason: ADAPTER_ORIGIN
        ? 'canonical adapter is degraded; local witness must remain pending_sync'
        : 'canonical adapter is not configured; local witness must remain pending_sync',
      checkedAt,
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ADAPTER_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    if (update.capabilityLeaseId) {
      headers['X-KPGS-Capability-Lease'] = update.capabilityLeaseId;
    }

    const response = await fetch(`${ADAPTER_ORIGIN}/kpgs/progressive-updates`, {
      method: 'POST',
      headers,
      cache: 'no-store',
      signal: controller.signal,
      body: JSON.stringify(update),
    });

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const payload = (await response.json()) as unknown;
      const receipt = isSwfusReceipt(payload)
        ? payload
        : payload && typeof payload === 'object' && 'receipt' in payload
          ? (payload as { receipt?: unknown }).receipt
          : null;

      if (isSwfusReceipt(receipt)) {
        // A valid SWFUS rejection is governance evidence, not an adapter outage.
        return {
          configured: true,
          adapterStatus: 'ready',
          receipt,
          reason:
            receipt.accepted && receipt.syncState === 'synced'
              ? null
              : receipt.reason || `canonical SWFUS returned ${receipt.syncState}`,
          checkedAt,
        };
      }
    }

    if (!response.ok) {
      return {
        configured: true,
        adapterStatus: 'degraded',
        receipt: null,
        reason: `canonical adapter failed progressive update without a valid SWFUS receipt (HTTP ${response.status})`,
        checkedAt,
      };
    }

    return {
      configured: true,
      adapterStatus: 'degraded',
      receipt: null,
      reason: 'canonical adapter returned no valid SWFUS receipt',
      checkedAt,
    };
  } catch {
    return {
      configured: true,
      adapterStatus: 'degraded',
      receipt: null,
      reason: 'canonical adapter transport unavailable; local witness remains pending_sync',
      checkedAt,
    };
  } finally {
    clearTimeout(timeout);
  }
}

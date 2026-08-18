import {
  isKpgsSwfusReceipt,
  type KpgsProgressiveUpdate,
  type KpgsSwfusReceipt,
} from './progressiveUpdateContract';

type AdapterState = {
  configured: boolean;
  status: 'contract-only' | 'ready' | 'degraded';
  origin: string | null;
  health: Record<string, unknown> | null;
  version: Record<string, unknown> | null;
  checkedAt: string;
};

export type ProgressiveAdapterResult = {
  adapter: AdapterState;
  receipt: KpgsSwfusReceipt | null;
  reason: string | null;
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

export async function submitKpgsProgressiveUpdate(
  update: KpgsProgressiveUpdate,
): Promise<ProgressiveAdapterResult> {
  const adapter = await getKpgsDomainAdapterState();
  if (!ADAPTER_ORIGIN || adapter.status !== 'ready') {
    return {
      adapter,
      receipt: null,
      reason: adapter.configured
        ? 'canonical adapter is degraded; progressive update remains queued'
        : 'canonical adapter is not configured; progressive update remains queued',
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ADAPTER_TIMEOUT_MS);
  try {
    const response = await fetch(`${ADAPTER_ORIGIN}/kpgs/progressive-updates`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
      body: JSON.stringify(update),
    });
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { adapter: { ...adapter, status: 'degraded' }, receipt: null, reason: 'canonical adapter returned non-JSON evidence' };
    }

    const payload = (await response.json()) as unknown;
    const candidate = isKpgsSwfusReceipt(payload)
      ? payload
      : payload && typeof payload === 'object' && 'receipt' in payload
        ? (payload as { receipt?: unknown }).receipt
        : null;

    if (isKpgsSwfusReceipt(candidate)) {
      return { adapter, receipt: candidate, reason: null };
    }
    return {
      adapter: { ...adapter, status: 'degraded' },
      receipt: null,
      reason: `canonical adapter returned no valid SWFUS receipt (HTTP ${response.status})`,
    };
  } catch {
    return {
      adapter: { ...adapter, status: 'degraded' },
      receipt: null,
      reason: 'canonical adapter transport unavailable; progressive update remains queued',
    };
  } finally {
    clearTimeout(timeout);
  }
}

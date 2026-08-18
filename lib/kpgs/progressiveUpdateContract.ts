export const SWFUS_CONTRACT = {
  schema: 'kpgs.swfus.update.v1',
  receiptSchema: 'kpgs.swfus.receipt.v1',
  canonicalRepository: 'RobynAwesome/Introduction-to-MCP',
  canonicalCommit: '762b306d082c2c5932800406eb75affb1d30bb11',
  canonicalPath:
    'governance/kpgs-vnext/adaptive-progressive-updates/swfus-update.schema.json',
} as const;

export type SwfusAction = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
export type SwfusSyncState = 'synced' | 'pending_sync' | 'severed' | 'not_applicable';
export type SwfusStage =
  | 'sovereign_ingestion'
  | 'witness_isolation'
  | 'fluid_vectoring'
  | 'unified_synchronization';

export type SwfusProgressiveUpdate = {
  schema: typeof SWFUS_CONTRACT.schema;
  nodeId: string;
  action: SwfusAction;
  telemetryValue: number;
  data: Record<string, unknown>;
  expectedRevision: number | null;
  correlationId: string | null;
  capabilityLeaseId: string | null;
  observedAt: string | null;
};

export type SwfusReceipt = {
  schema: typeof SWFUS_CONTRACT.receiptSchema;
  nodeId: string;
  requestedAction: SwfusAction;
  resolvedAction: SwfusAction;
  accepted: boolean;
  stage: SwfusStage;
  syncState: SwfusSyncState;
  revision: number | null;
  correlationId: string | null;
  capabilityLeaseId: string | null;
  evidenceHash: string;
  reason: string | null;
  observedAt: string;
};

export function isSwfusProgressiveUpdate(
  value: unknown,
): value is SwfusProgressiveUpdate {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SwfusProgressiveUpdate>;
  return (
    candidate.schema === SWFUS_CONTRACT.schema &&
    typeof candidate.nodeId === 'string' &&
    candidate.nodeId.length > 0 &&
    ['CREATE', 'READ', 'UPDATE', 'DELETE'].includes(candidate.action || '') &&
    typeof candidate.telemetryValue === 'number' &&
    Number.isFinite(candidate.telemetryValue) &&
    candidate.telemetryValue >= -100 &&
    candidate.telemetryValue <= 100 &&
    Boolean(candidate.data && typeof candidate.data === 'object') &&
    (candidate.expectedRevision === null ||
      (Number.isInteger(candidate.expectedRevision) &&
        Number(candidate.expectedRevision) >= 0)) &&
    (candidate.correlationId === null ||
      (typeof candidate.correlationId === 'string' && candidate.correlationId.length > 0)) &&
    (candidate.capabilityLeaseId === null ||
      (typeof candidate.capabilityLeaseId === 'string' && candidate.capabilityLeaseId.length > 0))
  );
}

export function isSwfusReceipt(value: unknown): value is SwfusReceipt {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<SwfusReceipt>;
  return (
    candidate.schema === SWFUS_CONTRACT.receiptSchema &&
    typeof candidate.nodeId === 'string' &&
    typeof candidate.accepted === 'boolean' &&
    ['synced', 'pending_sync', 'severed', 'not_applicable'].includes(
      candidate.syncState || '',
    ) &&
    typeof candidate.evidenceHash === 'string' &&
    /^[a-f0-9]{64}$/.test(candidate.evidenceHash) &&
    typeof candidate.observedAt === 'string'
  );
}

export const KPGS_PROGRESSIVE_UPDATE = {
  canonicalRepository: 'RobynAwesome/Introduction-to-MCP',
  canonicalCommit: '6eeb285d0775a7e74ceadc06e32b4068fcfbc595',
  canonicalPath:
    'governance/kpgs-vnext/progressive-updates/progressive-update.schema.json',
  schema: 'kpgs.progressive-update.v1',
  receiptSchema: 'kpgs.swfus.receipt.v1',
  boundaryMarker: '#NB',
} as const;

export const SWFUS_STAGE_ORDER = [
  'TELEMETRY',
  'CLASSIFICATION',
  'ROUTING',
  'PROTOCOL_SELECTION',
  'INVARIANT_AUDIT',
  'POC_FOC_CHECK',
  'STATE_UPDATE',
  'DISTRIBUTION',
] as const;

export type CrudOperation = 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
export type ApuStatus = 'GREEN' | 'YELLOW' | 'RED' | 'UNSPECIFIED';
export type ProgressiveStateClass =
  | 'non_authoritative'
  | 'derived_projection'
  | 'pending_proposal';
export type SwfusDisposition = 'APPLIED' | 'OBSERVED' | 'HELD' | 'REJECTED';

export type KpgsProgressiveUpdate = {
  schema: typeof KPGS_PROGRESSIVE_UPDATE.schema;
  update_id: string;
  node_id: string;
  operation: CrudOperation;
  lane: string;
  context_route: string;
  protocol: string;
  idempotency_key: string;
  value?: unknown;
  apu_status: ApuStatus;
  poc_validated: boolean;
  foc_detected: boolean;
  invariant_passed: boolean;
  authority_effect: 'none';
  state_class: ProgressiveStateClass;
  evidence_refs: string[];
  correlation_id?: string;
  source?: string;
  expected_version?: number | null;
  boundary_marker: typeof KPGS_PROGRESSIVE_UPDATE.boundaryMarker;
};

export type SwfusStageReceipt = {
  stage: (typeof SWFUS_STAGE_ORDER)[number];
  status: string;
  reason: string;
};

export type KpgsSwfusReceipt = {
  schema: typeof KPGS_PROGRESSIVE_UPDATE.receiptSchema;
  receipt_id: string;
  update_id: string;
  node_id: string;
  operation: CrudOperation;
  disposition: SwfusDisposition;
  stages: SwfusStageReceipt[];
  synchronized: boolean;
  canonical_authority_changed: false;
  state_digest: string | null;
  evidence_refs: string[];
  correlation_id: string;
  boundary_marker: typeof KPGS_PROGRESSIVE_UPDATE.boundaryMarker;
  replayed: boolean;
  created_at: string;
};

export function isKpgsProgressiveUpdate(value: unknown): value is KpgsProgressiveUpdate {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<KpgsProgressiveUpdate>;
  const mutation = ['CREATE', 'UPDATE', 'DELETE'].includes(item.operation || '');
  return (
    item.schema === KPGS_PROGRESSIVE_UPDATE.schema &&
    typeof item.update_id === 'string' && item.update_id.length > 0 &&
    typeof item.node_id === 'string' && item.node_id.length > 0 &&
    ['CREATE', 'READ', 'UPDATE', 'DELETE'].includes(item.operation || '') &&
    typeof item.lane === 'string' && item.lane.length > 0 &&
    typeof item.context_route === 'string' && item.context_route.length > 0 &&
    typeof item.protocol === 'string' &&
    typeof item.idempotency_key === 'string' && item.idempotency_key.length > 0 &&
    ['GREEN', 'YELLOW', 'RED', 'UNSPECIFIED'].includes(item.apu_status || '') &&
    typeof item.poc_validated === 'boolean' &&
    typeof item.foc_detected === 'boolean' &&
    typeof item.invariant_passed === 'boolean' &&
    item.authority_effect === 'none' &&
    ['non_authoritative', 'derived_projection', 'pending_proposal'].includes(item.state_class || '') &&
    Array.isArray(item.evidence_refs) && item.evidence_refs.every((ref) => typeof ref === 'string' && ref.length > 0) &&
    item.boundary_marker === '#NB' &&
    (!mutation || (item.poc_validated === true && item.foc_detected === false && item.evidence_refs.length > 0))
  );
}

export function isKpgsSwfusReceipt(value: unknown): value is KpgsSwfusReceipt {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<KpgsSwfusReceipt>;
  if (
    item.schema !== KPGS_PROGRESSIVE_UPDATE.receiptSchema ||
    typeof item.receipt_id !== 'string' ||
    typeof item.update_id !== 'string' ||
    typeof item.node_id !== 'string' ||
    !['CREATE', 'READ', 'UPDATE', 'DELETE'].includes(item.operation || '') ||
    !['APPLIED', 'OBSERVED', 'HELD', 'REJECTED'].includes(item.disposition || '') ||
    typeof item.synchronized !== 'boolean' ||
    item.canonical_authority_changed !== false ||
    !Array.isArray(item.evidence_refs) ||
    item.boundary_marker !== '#NB' ||
    typeof item.replayed !== 'boolean' ||
    typeof item.created_at !== 'string' ||
    !Array.isArray(item.stages) ||
    item.stages.length !== SWFUS_STAGE_ORDER.length
  ) return false;

  return item.stages.every((stage, index) =>
    Boolean(stage) &&
    stage.stage === SWFUS_STAGE_ORDER[index] &&
    typeof stage.status === 'string' &&
    typeof stage.reason === 'string',
  );
}

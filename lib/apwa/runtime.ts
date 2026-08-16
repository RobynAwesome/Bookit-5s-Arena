export type ExperienceTier = 'full' | 'balanced' | 'lite' | 'static';

export interface RuntimeSignals {
  reducedMotion: boolean;
  saveData: boolean;
  effectiveType?: string | null;
  deviceMemoryGb?: number | null;
  hardwareConcurrency?: number | null;
  webgl: boolean;
  visible: boolean;
}

export interface ExperienceProfile {
  tier: ExperienceTier;
  runThreeJs: boolean;
  runPhysics: boolean;
  maxDpr: number;
  targetFps: number;
  reason: string[];
}

export function getExperienceProfile(signals: RuntimeSignals): ExperienceProfile {
  const reason: string[] = [];

  if (signals.reducedMotion) reason.push('prefers-reduced-motion');
  if (signals.saveData) reason.push('save-data');
  if (!signals.webgl) reason.push('webgl-unavailable');
  if (!signals.visible) reason.push('document-hidden');
  if (signals.effectiveType && /(^|-)2g$/.test(signals.effectiveType)) reason.push('constrained-network');
  if (signals.deviceMemoryGb != null && signals.deviceMemoryGb <= 2) reason.push('low-memory');
  if (signals.hardwareConcurrency != null && signals.hardwareConcurrency <= 2) reason.push('low-cpu');

  if (!signals.webgl || signals.reducedMotion) {
    return { tier: 'static', runThreeJs: false, runPhysics: false, maxDpr: 1, targetFps: 0, reason };
  }

  if (signals.saveData || reason.includes('constrained-network') || reason.includes('low-memory')) {
    return { tier: 'lite', runThreeJs: true, runPhysics: false, maxDpr: 1, targetFps: 30, reason };
  }

  if (reason.includes('low-cpu') || !signals.visible) {
    return { tier: 'balanced', runThreeJs: true, runPhysics: true, maxDpr: 1.5, targetFps: 30, reason };
  }

  return { tier: 'full', runThreeJs: true, runPhysics: true, maxDpr: 2, targetFps: 60, reason };
}

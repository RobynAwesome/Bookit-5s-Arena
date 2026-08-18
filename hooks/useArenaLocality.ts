'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PROVINCE_SLUG,
  getNearestProvince,
  getProvinceBySlug,
  LOCALITY_EVENT,
  LOCALITY_STORAGE_KEY,
  type ProvinceSlug,
} from '@/lib/organism/southAfrica';
import {
  applyLocalProgressiveUpdate,
  LOCALITY_SWFUS_NODE,
  readLatestProgressiveReceipt,
  retryProgressiveSync,
} from '@/lib/kpgs/swfusProgressiveUpdates';
import type { SwfusReceipt } from '@/lib/kpgs/progressiveUpdateContract';

type LocalitySource = 'arena-default' | 'saved' | 'manual' | 'device-nearest';

type StoredLocality = {
  provinceSlug: ProvinceSlug;
  source: LocalitySource;
  updatedAt: string;
};

function readStoredLocality(): StoredLocality | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(LOCALITY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredLocality>;
    const province = getProvinceBySlug(parsed.provinceSlug);
    if (!province || province.slug !== parsed.provinceSlug) return null;

    return {
      provinceSlug: province.slug,
      source: parsed.source || 'saved',
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function useArenaLocality() {
  const [provinceSlug, setProvinceSlug] = useState<ProvinceSlug>(DEFAULT_PROVINCE_SLUG);
  const [source, setSource] = useState<LocalitySource>('arena-default');
  const [detecting, setDetecting] = useState(false);
  const [progressiveReceipt, setProgressiveReceipt] = useState<SwfusReceipt | null>(null);

  const witnessProgressiveUpdate = useCallback(
    (payload: StoredLocality) => {
      void applyLocalProgressiveUpdate({
        nodeId: LOCALITY_SWFUS_NODE,
        data: {
          provinceSlug: payload.provinceSlug,
          source: payload.source,
          updatedAt: payload.updatedAt,
        },
      })
        .then(setProgressiveReceipt)
        .catch(() => {
          setProgressiveReceipt((current) =>
            current
              ? {
                  ...current,
                  accepted: false,
                  stage: 'witness_isolation',
                  syncState: 'severed',
                  reason: 'local progressive witness could not be persisted',
                  observedAt: new Date().toISOString(),
                }
              : null,
          );
        });
    },
    [],
  );

  const persist = useCallback(
    (nextSlug: ProvinceSlug, nextSource: LocalitySource) => {
      setProvinceSlug(nextSlug);
      setSource(nextSource);

      if (typeof window === 'undefined') return;

      const payload: StoredLocality = {
        provinceSlug: nextSlug,
        source: nextSource,
        updatedAt: new Date().toISOString(),
      };

      try {
        window.localStorage.setItem(LOCALITY_STORAGE_KEY, JSON.stringify(payload));
      } catch {}

      window.dispatchEvent(new CustomEvent(LOCALITY_EVENT, { detail: payload }));
      witnessProgressiveUpdate(payload);
    },
    [witnessProgressiveUpdate],
  );

  useEffect(() => {
    const stored = readStoredLocality();
    if (stored) {
      setProvinceSlug(stored.provinceSlug);
      setSource(stored.source === 'arena-default' ? 'saved' : stored.source);
    }
    setProgressiveReceipt(readLatestProgressiveReceipt(LOCALITY_SWFUS_NODE));

    function handleLocality(event: Event) {
      const detail = (event as CustomEvent<StoredLocality>).detail;
      if (!detail?.provinceSlug) return;
      const province = getProvinceBySlug(detail.provinceSlug);
      setProvinceSlug(province.slug);
      setSource(detail.source || 'saved');
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === LOCALITY_STORAGE_KEY) {
        const next = readStoredLocality();
        if (!next) return;
        setProvinceSlug(next.provinceSlug);
        setSource(next.source);
      }
      if (event.key === 'fivesarena.swfus.receipts.v1') {
        setProgressiveReceipt(readLatestProgressiveReceipt(LOCALITY_SWFUS_NODE));
      }
    }

    function handleOnline() {
      void retryProgressiveSync(LOCALITY_SWFUS_NODE).then(setProgressiveReceipt);
    }

    window.addEventListener(LOCALITY_EVENT, handleLocality);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener(LOCALITY_EVENT, handleLocality);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const setProvince = useCallback(
    (value: string) => {
      const province = getProvinceBySlug(value);
      persist(province.slug, 'manual');
    },
    [persist],
  );

  const detectLocation = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return { ok: false as const, reason: 'geolocation-unavailable' };
    }

    setDetecting(true);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 6000,
          maximumAge: 10 * 60 * 1000,
        });
      });
      const nearest = getNearestProvince(
        position.coords.latitude,
        position.coords.longitude,
      );
      persist(nearest.slug, 'device-nearest');
      return { ok: true as const, province: nearest };
    } catch {
      return { ok: false as const, reason: 'geolocation-denied-or-timeout' };
    } finally {
      setDetecting(false);
    }
  }, [persist]);

  const province = useMemo(() => getProvinceBySlug(provinceSlug), [provinceSlug]);

  return {
    province,
    provinceSlug,
    source,
    detecting,
    progressiveReceipt,
    setProvince,
    detectLocation,
  };
}

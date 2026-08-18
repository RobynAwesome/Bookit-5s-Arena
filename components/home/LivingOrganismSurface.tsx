'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FaCheckCircle,
  FaCloudUploadAlt,
  FaCrosshairs,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaNewspaper,
  FaSatelliteDish,
  FaShieldAlt,
} from 'react-icons/fa';
import { useArenaLocality } from '@/hooks/useArenaLocality';
import { SOUTH_AFRICA_PROVINCES } from '@/lib/organism/southAfrica';
import type { SwfusReceipt } from '@/lib/kpgs/progressiveUpdateContract';

const LocalityScene = dynamic(() => import('@/components/organism/LocalityScene'), {
  ssr: false,
  loading: () => (
    <div className="min-h-64 animate-pulse rounded-[2rem] border border-white/10 bg-white/5" />
  ),
});

type OrganismArticle = {
  title: string;
  summary: string;
  publisher: string;
  localityScore: number;
};

type AdapterStatus = 'contract-only' | 'ready' | 'degraded';

type OrganismFeed = {
  locality: {
    province: string;
    provinceSlug: string;
    weatherLabel: string;
  };
  weather: null | {
    temperature: number;
    feelsLike: number;
    weatherCode: number;
    condition: string;
    emoji: string;
    wind: number;
    humidity: number;
    footballReady: boolean;
    fetchedAt: string;
  };
  editorial: {
    status: 'live' | 'fallback';
    articles: OrganismArticle[];
  };
  governance?: {
    adapter: {
      configured: boolean;
      status: AdapterStatus;
      origin: string | null;
      checkedAt: string;
    };
    executionPolicy: string;
  };
};

function adapterLabel(status: AdapterStatus) {
  if (status === 'ready') return '.NET boundary ready';
  if (status === 'degraded') return '.NET boundary degraded';
  return '.NET boundary contract';
}

function adapterClasses(status: AdapterStatus) {
  if (status === 'ready') {
    return 'border-green-300/25 bg-green-300/10 text-green-200';
  }
  if (status === 'degraded') {
    return 'border-red-300/20 bg-red-300/8 text-red-200';
  }
  return 'border-amber-300/20 bg-amber-300/8 text-amber-200';
}

function progressiveState(receipt: SwfusReceipt | null) {
  if (!receipt) return null;
  if (!receipt.accepted || receipt.syncState === 'severed') {
    return {
      label: 'Could not save · review',
      className: 'border-red-300/20 bg-red-300/8 text-red-200',
      icon: FaExclamationTriangle,
    };
  }
  if (receipt.syncState === 'synced') {
    return {
      label: 'Saved',
      className: 'border-green-300/25 bg-green-300/10 text-green-200',
      icon: FaCheckCircle,
    };
  }
  return {
    label: 'Saved on this device · sync pending',
    className: 'border-sky-300/20 bg-sky-300/8 text-sky-200',
    icon: FaCloudUploadAlt,
  };
}

function StaticOrganismScene() {
  return (
    <div
      className="grid min-h-64 place-items-center rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(57,217,138,0.18),rgba(4,6,10,0.96)_68%)] p-6 text-center"
      data-experience-tier="static"
    >
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-green-300">
          Adaptive organism · static lane
        </p>
        <p className="mt-3 text-sm leading-6 text-gray-300">
          Province context stays live while motion-heavy 3D rendering is disabled for this preference or capability state.
        </p>
      </div>
    </div>
  );
}

export default function LivingOrganismSurface() {
  const {
    province,
    provinceSlug,
    source,
    detecting,
    progressiveReceipt,
    setProvince,
    detectLocation,
  } = useArenaLocality();
  const prefersReducedMotion = useReducedMotion();
  const [feed, setFeed] = useState<OrganismFeed | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/organism/feed?province=${encodeURIComponent(provinceSlug)}`,
          { signal: controller.signal, cache: 'no-store' },
        );
        if (!response.ok) throw new Error('organism-feed-unavailable');
        const payload = (await response.json()) as OrganismFeed;
        if (mounted) setFeed(payload);
      } catch {
        if (mounted) setFeed(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [provinceSlug]);

  const articles = useMemo(() => feed?.editorial?.articles || [], [feed]);
  const weather = feed?.weather || null;
  const adapterStatus = feed?.governance?.adapter?.status || 'contract-only';
  const updateState = progressiveState(progressiveReceipt);

  return (
    <section
      className="relative overflow-hidden border-y border-white/8 bg-[#040706] px-4 py-16 sm:px-6 lg:px-8"
      data-testid="living-organism"
      data-province={provinceSlug}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(57,217,138,0.12),transparent_38%),radial-gradient(circle_at_90%_80%,rgba(245,197,66,0.08),transparent_36%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-400/8 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-green-300">
                <FaSatelliteDish /> Living Organism
              </span>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500">
                {source.replaceAll('-', ' ')}
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.16em] ${adapterClasses(adapterStatus)}`}
                data-testid="kpgs-adapter-state"
                data-adapter-status={adapterStatus}
              >
                <FaShieldAlt /> {adapterLabel(adapterStatus)}
              </span>
              {updateState ? (
                <span
                  className={`inline-flex min-h-8 items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.12em] ${updateState.className}`}
                  data-testid="progressive-update-state"
                  data-sync-state={progressiveReceipt?.syncState}
                  title={progressiveReceipt?.reason || undefined}
                  aria-live="polite"
                >
                  <updateState.icon /> {updateState.label}
                </span>
              ) : null}
            </div>
            <h2 className="max-w-4xl text-4xl font-black uppercase leading-[0.92] tracking-tight text-white sm:text-5xl lg:text-7xl">
              South Africa changes. <span className="text-yellow-400">Five&apos;s Arena reacts.</span>
            </h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-gray-300 sm:text-base">
              One governed province state now drives weather, editorial relevance and the adaptive visual layer. The user stays inside the Five&apos;s Arena shell while the blog/news organs feed the experience behind it.
            </p>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
            <div className="flex flex-col gap-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.22em] text-gray-500">
                  Current province context
                </p>
                <p
                  className="mt-1 text-xl font-black uppercase text-white"
                  data-testid="current-province"
                >
                  {province.label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void detectLocation()}
                disabled={detecting}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-yellow-400/25 bg-yellow-400/8 px-4 text-[10px] font-black uppercase tracking-[0.14em] text-yellow-200 transition hover:bg-yellow-400/15 disabled:opacity-50 min-[420px]:w-auto"
              >
                <FaCrosshairs /> {detecting ? 'Locating…' : 'Use my location'}
              </button>
            </div>
          </div>
        </div>

        <div
          className="mt-8 flex snap-x gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="South African province context"
        >
          {SOUTH_AFRICA_PROVINCES.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => setProvince(item.slug)}
              data-province-selector={item.slug}
              aria-pressed={item.slug === provinceSlug}
              className={`min-h-11 shrink-0 snap-start rounded-full border px-4 text-[10px] font-black uppercase tracking-[0.14em] transition ${
                item.slug === provinceSlug
                  ? 'border-yellow-300/50 bg-yellow-300/15 text-yellow-100'
                  : 'border-white/10 bg-white/[0.035] text-gray-400 hover:border-white/20 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="grid gap-4">
            {prefersReducedMotion !== false ? (
              <StaticOrganismScene />
            ) : (
              <LocalityScene
                provinceSlug={provinceSlug}
                weatherCode={weather?.weatherCode ?? null}
                temperature={weather?.temperature ?? null}
              />
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Weather</p>
                <p className="mt-2 text-2xl font-black text-white">
                  {loading ? '—' : weather ? `${weather.emoji} ${weather.temperature}°` : 'N/A'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Condition</p>
                <p className="mt-2 text-sm font-black uppercase text-white">
                  {weather?.condition || 'Checking'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Wind</p>
                <p className="mt-2 text-xl font-black text-white">
                  {weather ? `${weather.wind} km/h` : '—'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Football state</p>
                <p className={`mt-2 text-sm font-black uppercase ${weather?.footballReady ? 'text-green-300' : 'text-amber-300'}`}>
                  {weather ? (weather.footballReady ? 'Ready' : 'Watch conditions') : 'Checking'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-green-300">
                  <FaNewspaper /> Local editorial membrane
                </p>
                <h3 className="mt-2 text-2xl font-black uppercase text-white sm:text-3xl">
                  {province.label} football intelligence
                </h3>
                <p className="mt-2 text-xs leading-6 text-gray-500">
                  Blog organ first; South African football feed is the governed fallback until the editorial API contract answers.
                </p>
              </div>
              <Link
                href="/news"
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-4 text-[10px] font-black uppercase tracking-[0.16em] text-white transition hover:border-green-300/30 hover:bg-green-300/8"
              >
                <FaMapMarkerAlt /> Open local feed
              </Link>
            </div>

            <div className="mt-6 grid gap-3">
              {loading ? (
                [0, 1, 2].map((item) => (
                  <div key={item} className="h-24 animate-pulse rounded-2xl bg-white/5" />
                ))
              ) : articles.length ? (
                articles.slice(0, 4).map((article, index) => (
                  <motion.article
                    key={`${article.title}-${index}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="rounded-2xl border border-white/8 bg-black/25 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[9px] font-black uppercase tracking-[0.16em] text-gray-500">
                        {article.publisher}
                      </span>
                      {article.localityScore > 0 ? (
                        <span className="rounded-full bg-green-300/10 px-2 py-1 text-[8px] font-black uppercase tracking-widest text-green-300">
                          locality match
                        </span>
                      ) : null}
                    </div>
                    <h4 className="mt-2 text-sm font-black leading-5 text-white sm:text-base">
                      {article.title}
                    </h4>
                    {article.summary ? (
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-400">
                        {article.summary}
                      </p>
                    ) : null}
                  </motion.article>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm leading-6 text-gray-400">
                  No current editorial items passed the locality membrane. The weather and province state remain active rather than filling the surface with stale demo copy.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

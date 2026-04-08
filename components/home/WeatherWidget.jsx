'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function WeatherWidget() {
  const [locations, setLocations] = useState([]);
  const [activeSlug, setActiveSlug] = useState('arena');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadWeather() {
      try {
        const cached = sessionStorage.getItem('featured_weather_locations');
        if (cached) {
          const { data, ts } = JSON.parse(cached);
          if (Date.now() - ts < 15 * 60 * 1000) {
            if (mounted) {
              setLocations(data);
              setActiveSlug(data[0]?.slug || 'arena');
              setLoading(false);
            }
            return;
          }
        }
      } catch {}

      try {
        const response = await fetch('/api/weather/locations', { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok || !Array.isArray(payload.locations)) {
          throw new Error(payload.error || 'Weather unavailable');
        }

        if (mounted) {
          setLocations(payload.locations);
          setActiveSlug(payload.locations[0]?.slug || 'arena');
          setLoading(false);
        }

        try {
          sessionStorage.setItem(
            'featured_weather_locations',
            JSON.stringify({ data: payload.locations, ts: Date.now() }),
          );
        } catch {}
      } catch {
        if (mounted) {
          setError(true);
          setLoading(false);
        }
      }
    }

    loadWeather();

    return () => {
      mounted = false;
    };
  }, []);

  if (error) {
    return null;
  }

  const activeWeather =
    locations.find((location) => location.slug === activeSlug) || locations[0] || null;

  const getTempColor = (temp) => {
    if (temp >= 35) return 'text-red-400';
    if (temp >= 28) return 'text-orange-400';
    if (temp >= 20) return 'text-green-400';
    if (temp >= 12) return 'text-blue-300';
    return 'text-blue-500';
  };

  return (
    <motion.div
      className="overflow-hidden border-y border-gray-800/60 bg-black/80 py-4"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="text-lg text-green-400">📍</span>
            <div>
              <p className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                Matchday Weather Pulse
              </p>
              <p className="text-[9px] uppercase tracking-wider text-gray-700">
                Venue, South Africa, and Premier League watch cities
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="h-6 w-20 animate-pulse rounded bg-gray-800"
                  />
                ))}
              </motion.div>
            ) : activeWeather ? (
              <motion.div
                key={activeWeather.slug}
                className="flex flex-wrap items-center gap-4 md:gap-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <motion.span
                    className="text-2xl leading-none"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {activeWeather.emoji}
                  </motion.span>
                  <div>
                    <span
                      className={`text-2xl font-black leading-none ${getTempColor(activeWeather.temperature)}`}
                      style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
                    >
                      {activeWeather.temperature}°C
                    </span>
                    <p className="mt-0.5 text-[9px] uppercase tracking-wide text-gray-500">
                      {activeWeather.label} · {activeWeather.condition}
                    </p>
                  </div>
                </div>

                <div className="hidden h-8 w-px bg-gray-800 sm:block" />

                <div className="text-center">
                  <p className="text-sm font-bold leading-none text-white">
                    {activeWeather.feelsLike}°C
                  </p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-wide text-gray-600">
                    Feels Like
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm font-bold leading-none text-white">
                    {activeWeather.wind} km/h
                  </p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-wide text-gray-600">
                    💨 Wind
                  </p>
                </div>

                <div className="text-center">
                  <p className="text-sm font-bold leading-none text-white">
                    {activeWeather.humidity}%
                  </p>
                  <p className="mt-0.5 text-[9px] uppercase tracking-wide text-gray-600">
                    💧 Humidity
                  </p>
                </div>

                {activeWeather.footballReady ? (
                  <motion.div
                    className="flex items-center gap-1.5 rounded-full border border-green-700/50 bg-green-900/40 px-3 py-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-sm">⚽</span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-green-400">
                      Perfect Football Weather!
                    </span>
                  </motion.div>
                ) : null}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {locations.length ? (
            <div className="flex min-w-0 flex-wrap justify-end gap-2">
              {locations.map((location) => (
                <button
                  key={location.slug}
                  onClick={() => setActiveSlug(location.slug)}
                  className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] transition ${
                    activeSlug === location.slug
                      ? 'border-green-500 bg-green-500/15 text-green-300'
                      : 'border-gray-800 bg-gray-900/70 text-gray-400 hover:border-gray-700 hover:text-white'
                  }`}
                >
                  {location.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {activeWeather ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-800/60 pt-3 text-[10px] uppercase tracking-[0.16em] text-gray-500">
            <span>{activeWeather.subtitle}</span>
            <span>
              Updated{' '}
              {new Date(activeWeather.fetchedAt).toLocaleTimeString('en-ZA', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            <motion.a
              href="https://open-meteo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 transition-colors hover:text-gray-400"
            >
              via Open-Meteo
            </motion.a>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

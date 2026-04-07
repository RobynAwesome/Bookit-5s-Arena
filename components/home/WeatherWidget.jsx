'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── WMO weather code → description + emoji ───────────────────────────────
const WMO_CODES = {
  0:  { label: 'Clear Sky',        emoji: '☀️' },
  1:  { label: 'Mainly Clear',     emoji: '🌤️' },
  2:  { label: 'Partly Cloudy',    emoji: '⛅' },
  3:  { label: 'Overcast',         emoji: '☁️' },
  45: { label: 'Foggy',            emoji: '🌫️' },
  48: { label: 'Icy Fog',          emoji: '🌫️' },
  51: { label: 'Light Drizzle',    emoji: '🌦️' },
  53: { label: 'Drizzle',          emoji: '🌦️' },
  55: { label: 'Heavy Drizzle',    emoji: '🌧️' },
  61: { label: 'Light Rain',       emoji: '🌧️' },
  63: { label: 'Rain',             emoji: '🌧️' },
  65: { label: 'Heavy Rain',       emoji: '🌧️' },
  71: { label: 'Light Snow',       emoji: '🌨️' },
  73: { label: 'Snow',             emoji: '❄️' },
  75: { label: 'Heavy Snow',       emoji: '❄️' },
  80: { label: 'Rain Showers',     emoji: '🌦️' },
  81: { label: 'Rain Showers',     emoji: '🌦️' },
  82: { label: 'Violent Showers',  emoji: '⛈️' },
  95: { label: 'Thunderstorm',     emoji: '⛈️' },
  96: { label: 'Hail Storm',       emoji: '⛈️' },
  99: { label: 'Heavy Hail Storm', emoji: '⛈️' },
};

const getCondition = (code) => WMO_CODES[code] ?? { label: 'Unknown', emoji: '🌡️' };

// Cape Town coordinates
const LAT = -33.9249;
const LON = 18.4241;
const API_URL =
  `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,relativehumidity_2m` +
  `&timezone=Africa%2FJohannesburg&wind_speed_unit=kmh`;

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  useEffect(() => {
    // Check cached data first (15-min TTL)
    try {
      const cached = sessionStorage.getItem('cpt_weather');
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        if (Date.now() - ts < 15 * 60 * 1000) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setWeather(data);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setLoading(false);
          return;
        }
      }
    } catch {}

    fetch(API_URL)
      .then(r => r.json())
      .then(data => {
        const c = data.current;
        const payload = {
          temp:       Math.round(c.temperature_2m),
          feelsLike:  Math.round(c.apparent_temperature),
          code:       c.weathercode,
          wind:       Math.round(c.windspeed_10m),
          humidity:   c.relativehumidity_2m,
          fetchedAt:  new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' }),
        };
        setWeather(payload);
        setLoading(false);
        try {
          sessionStorage.setItem('cpt_weather', JSON.stringify({ data: payload, ts: Date.now() }));
        } catch {}
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // Don't render if there's an error (fail silently)
  if (error) return null;

  const condition = weather ? getCondition(weather.code) : null;

  // Temperature comfort level → color
  const getTempColor = (temp) => {
    if (temp >= 35) return 'text-red-400';
    if (temp >= 28) return 'text-orange-400';
    if (temp >= 20) return 'text-green-400';
    if (temp >= 12) return 'text-blue-300';
    return 'text-blue-500';
  };

  // Is it good weather for football? ⚽
  const isFootballWeather = weather && weather.temp >= 15 && weather.temp <= 28 && weather.code <= 3;

  return (
    <motion.div
      className="bg-black/80 border-y border-gray-800/60 py-4 overflow-hidden"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">

          {/* Left — location + label */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-green-400 text-lg">📍</span>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold leading-none mb-0.5">
                Cape Town Weather
              </p>
              <p className="text-[9px] text-gray-700 uppercase tracking-wider">
                Milnerton · Hellenic Football Club
              </p>
            </div>
          </div>

          {/* Centre — main weather data */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="skeleton"
                className="flex items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-6 w-20 bg-gray-800 rounded animate-pulse" />
                ))}
              </motion.div>
            ) : weather ? (
              <motion.div
                key="data"
                className="flex flex-wrap items-center gap-4 md:gap-6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Condition emoji + temp */}
                <div className="flex items-center gap-2">
                  <motion.span
                    className="text-2xl leading-none"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {condition.emoji}
                  </motion.span>
                  <div>
                    <span
                      className={`font-black text-2xl leading-none ${getTempColor(weather.temp)}`}
                      style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}
                    >
                      {weather.temp}°C
                    </span>
                    <p className="text-[9px] text-gray-500 leading-none mt-0.5 uppercase tracking-wide">
                      {condition.label}
                    </p>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-800 hidden sm:block" />

                {/* Feels like */}
                <div className="text-center">
                  <p className="text-white font-bold text-sm leading-none">{weather.feelsLike}°C</p>
                  <p className="text-[9px] text-gray-600 uppercase tracking-wide mt-0.5">Feels Like</p>
                </div>

                {/* Wind */}
                <div className="text-center">
                  <p className="text-white font-bold text-sm leading-none">{weather.wind} km/h</p>
                  <p className="text-[9px] text-gray-600 uppercase tracking-wide mt-0.5">💨 Wind</p>
                </div>

                {/* Humidity */}
                <div className="text-center">
                  <p className="text-white font-bold text-sm leading-none">{weather.humidity}%</p>
                  <p className="text-[9px] text-gray-600 uppercase tracking-wide mt-0.5">💧 Humidity</p>
                </div>

                {/* Football weather tag */}
                {isFootballWeather && (
                  <motion.div
                    className="flex items-center gap-1.5 bg-green-900/40 border border-green-700/50 rounded-full px-3 py-1"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-sm">⚽</span>
                    <span className="text-green-400 text-[10px] font-black uppercase tracking-wider">
                      Perfect Football Weather!
                    </span>
                  </motion.div>
                )}
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Right — attribution + time */}
          {weather && (
            <div className="text-right min-w-0">
              <p className="text-[9px] text-gray-700 uppercase tracking-wider">
                via Open-Meteo · {weather.fetchedAt}
              </p>
              <motion.a
                href="https://open-meteo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[9px] text-gray-800 hover:text-gray-600 transition-colors"
              >
                open-meteo.com
              </motion.a>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

'use client';

import { motion } from 'framer-motion';

/**
 * ArenaBackground — immersive stadium atmosphere
 * Liquid gradient mesh, geometric pitch lines, spotlight beams, particle field
 * No bouncing text. No moving footballs.
 */
export default function ArenaBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-gray-950">

      {/* ── 1. Liquid gradient mesh (3 animated layers) ── */}
      <motion.div
        className="absolute w-[140%] h-[140%] -top-[20%] -left-[20%]"
        style={{
          background: `
            radial-gradient(ellipse at 25% 30%, rgba(16,185,129,0.12) 0%, transparent 50%),
            radial-gradient(ellipse at 75% 70%, rgba(99,102,241,0.10) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(34,197,94,0.05) 0%, transparent 60%)
          `,
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -20, 15, 0],
          rotate: [0, 2, -1, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[120%] h-[120%] -top-[10%] -left-[10%]"
        style={{
          background: `
            radial-gradient(ellipse at 60% 20%, rgba(129,140,248,0.08) 0%, transparent 45%),
            radial-gradient(ellipse at 30% 80%, rgba(52,211,153,0.06) 0%, transparent 45%)
          `,
        }}
        animate={{
          x: [0, -25, 15, 0],
          y: [0, 15, -25, 0],
          rotate: [0, -1.5, 2, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── 2. Geometric pitch lines ── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pitch-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="80" height="80" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pitch-grid)" />
        <circle cx="50%" cy="50%" r="120" fill="none" stroke="rgba(34,197,94,0.08)" strokeWidth="1.5" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(34,197,94,0.05)" strokeWidth="1" />
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(34,197,94,0.05)" strokeWidth="1" />
      </svg>

      {/* ── 3. Spotlight beams (corners) ── */}
      <motion.div
        className="absolute -top-20 -left-20 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'conic-gradient(from 135deg, transparent 0deg, rgba(34,197,94,0.04) 15deg, transparent 30deg)' }}
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute -bottom-20 -right-20 w-[500px] h-[500px] pointer-events-none"
        style={{ background: 'conic-gradient(from 315deg, transparent 0deg, rgba(99,102,241,0.04) 15deg, transparent 30deg)' }}
        animate={{ rotate: [360, 0] }}
        transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
      />

      {/* ── 4. Floating particles (stadium atmosphere) ── */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            background: i % 2 === 0 ? 'rgba(34,197,94,0.3)' : 'rgba(129,140,248,0.3)',
            left: `${8 + (i * 7.5) % 85}%`,
            top: `${5 + (i * 11) % 90}%`,
          }}
          animate={{
            y: [0, -(15 + i * 3), 0],
            x: [0, (i % 2 === 0 ? 8 : -8), 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
        />
      ))}

      {/* ── 5. Stadium vignette ── */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)' }} />

      {/* ── 6. Subtle noise texture ── */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
